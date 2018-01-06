module.exports.run = async (bot, message, args) => {
	const opggapi = require("pubg.op.gg");
	const {PubgAPI, PubgAPIErrors, REGION, SEASON, MATCH} = require('pubg.op.gg');
	const api = new PubgAPI();
	const mysql   = require('mysql');

	var enabled = true; //Developer enabled.
	var con = mysql.createConnection({
		host: bot.settingscfg.mysqlHost,
		user: bot.settingscfg.mysqlUser,
		password: bot.settingscfg.mysqlPass,
		database: bot.settingscfg.mysqlData
	});
	await con.connect(err => {
		if (err) console.error(err);
		//Connected to database.
	});

	if (enabled && bot.servers.get(message.guild.id).pubgRanksDistribute) {
		var playertofind;
		if (args.length >= 1) {
			playertofind = message.mentions.users.first().id;
		} else {
			playertofind = message.author.id;
		}

		var fs = require('fs');
		var filename = `/var/www/vhosts/bot.discordgaming.nl/home/pBot/servers/pubg/${message.guild.id}.json`;
		var pubgsettings = require(filename);
		if (pubgsettings.ranksystem === "rating") {
			con.query(`SELECT * FROM pubgranks WHERE discorduser = ${playertofind} AND discordserver = ${message.guild.id}`, async (err, rows) => {
				if (err) console.error(err);

				//Getting the stats
				var playerinfo = rows[0];
				var bestRating = 0;
				
				//SQUAD TPP rating
				await api.getProfileByID(playerinfo["op_gg_id"], SEASON.RE2018sea1, REGION.EU, MATCH.SQUAD.size, MATCH.SQUAD.name)
					.then((profile) => {
						const data = profile.getStats();
						if (data.rating > bestRating) {
							bestRating = data.rating;
						}
					})
					.catch((err) => {
						console.error(err);
					});
				//SQUAD FPP rating
				await api.getProfileByID(playerinfo["op_gg_id"], SEASON.RE2018sea1, REGION.EU, MATCH.SQUADFPP.size, MATCH.SQUADFPP.name)
					.then((profile) => {
						const data = profile.getStats();
						if (data.rating > bestRating) {
							bestRating = data.rating;
						}
					})
					.catch((err) => {
						console.error(err);
					});

				//Updating the player rank in the server.
				//Removing the roles from the member first... :)
				let guildMember = await message.guild.fetchMember(playertofind);
				for(var attributename in pubgsettings["rating"]){
					guildMember.removeRole(pubgsettings["rating"][attributename]);
				}
				//Assinging the new role to the user.
				if (bestRating < 1400) {
					guildMember.addRole(pubgsettings["rating"]["unranked"]);
				} else if (bestRating >= 1400 && bestRating < 1600) {
					guildMember.addRole(pubgsettings["rating"]["1400rating"]);
				} else if (bestRating >= 1600 && bestRating < 1800) {
					guildMember.addRole(pubgsettings["rating"]["1600rating"]);
				} else if (bestRating >= 1800 && bestRating < 2000) {
					guildMember.addRole(pubgsettings["rating"]["1800rating"]);
				} else if (bestRating >= 2000 && bestRating < 2200) {
					guildMember.addRole(pubgsettings["rating"]["2000rating"]);
				} else if (bestRating >= 2200 && bestRating < 2400) {
					guildMember.addRole(pubgsettings["rating"]["2200rating"]);
				} else if (bestRating >= 2400) {
					guildMember.addRole(pubgsettings["rating"]["2400rating"]);
				}

				message.reply(`I've assigned the new rating role to ${guildMember}. Rating: ${bestRating}`);
			});
		} else if (pubgsettings.ranksystem === "ranking") {
			//message.reply(``);
		} else if (pubgsettings.ranksystem === "elo") {
			con.query(`SELECT * FROM pubgranks WHERE discorduser = ${playertofind} AND discordserver = ${message.guild.id}`, async (err, rows) => {
				if (err) console.error(err);

				var playerinfo = rows[0];
				var p = playerinfo;
				var elosquadtpp = 1;
				var elosquadfpp = 1;

				//SQUAD TPP rating
				await api.getProfileByID(playerinfo["op_gg_id"], SEASON.RE2018sea1, REGION.EU, MATCH.SQUAD.size, MATCH.SQUAD.name)
					.then((profile) => {
						const stats = profile.getStats();
						if (stats.matches_cnt >= 10) {
							var winrating = (stats.win_matches_cnt / stats.matches_cnt) * 100;
						  	var kda       = (stats.kills_sum + stats.assists_sum) / stats.deaths_sum;
							elosquadtpp = (1000 * (1+((winrating*2)/100)) *  (1+((kda/2)/100)) * (1 + (stats.damage_dealt_avg/2)/100));
						}
					})
					.catch((err) => {
						// console.error(err);
					});
				//SQUAD FPP rating
				await api.getProfileByID(playerinfo["op_gg_id"], SEASON.RE2018sea1, REGION.EU, MATCH.SQUADFPP.size, MATCH.SQUADFPP.name)
					.then((profile) => {
						const stats = profile.getStats();
						if (stats.matches_cnt >= 10) {
							var winrating = (stats.win_matches_cnt / stats.matches_cnt) * 100;
						  	var kda       = (stats.kills_sum + stats.assists_sum) / stats.deaths_sum;
							elosquadfpp = (1000 * (1+((winrating*2)/100)) *  (1+((kda/2)/100)) * (1 + (stats.damage_dealt_avg/2)/100));
						}
					})
					.catch((err) => {
						// console.error(err);
					});

				//Final vars
				var bestelo;
				var bestmode;
				if (elosquadfpp > elosquadtpp) {
					bestelo = Math.ceil(elosquadfpp);
					bestmode = 'squad-fpp';
				} else {
					bestelo = Math.ceil(elosquadtpp);
					bestmode = 'squad';
				}

				con.query(`UPDATE pubgranks SET currentRank = "${bestelo}", currentMode = "${bestmode}", previousRank = "${p.currentRank}", previousMode = "${p.currentMode}", updatetime = CURRENT_TIMESTAMP WHERE discordserver = "${p.discordserver}" AND discorduser = "${p.discorduser}"`, (err, rows) => {
					if (err) console.error(err);
					con.end();
				});

				//Updating the player rank in the server.
				//Removing the roles from the member first... :)
				let guildMember = await message.guild.fetchMember(playertofind);
				for(var attributename in pubgsettings["elo"]){
					await guildMember.removeRole(pubgsettings["elo"][attributename]);
				}
				//Assinging the new role to the user.
				if (bestelo < 1600) {
					guildMember.addRole(pubgsettings["elo"]["unranked"]);
				} else if (bestelo >= 1600 && bestelo < 2000) {
					guildMember.addRole(pubgsettings["elo"]["1600rating"]);
				} else if (bestelo >= 2000 && bestelo < 2400) {
					guildMember.addRole(pubgsettings["elo"]["2000rating"]);
				} else if (bestelo >= 2400 && bestelo < 2800) {
					guildMember.addRole(pubgsettings["elo"]["2400rating"]);
				} else if (bestelo >= 2800 && bestelo < 3200) {
					guildMember.addRole(pubgsettings["elo"]["2800rating"]);
				} else if (bestelo >= 3200 && bestelo < 3600) {
					guildMember.addRole(pubgsettings["elo"]["3200rating"]);
				} else if (bestelo >= 3600 && bestelo < 4000) {
					guildMember.addRole(pubgsettings["elo"]["3600rating"]);
				} else if (bestelo >= 4000) {
					guildMember.addRole(pubgsettings["elo"]["4000rating"]);
				}

				//Ranked player or not.?
				if (bestelo == 1) {
					message.reply(`I've not assigned an elo role to ${guildMember}. Player has not ranked yet, 10+ games to get ranked`);
				} else {
					message.reply(`I've assigned the new elo role to ${guildMember}. ELO: ${bestelo}`);
				}
			});

		} else {
			message.reply('Your account has not been linked yet, use .pubgaccount [ingame name] to link your account.');
		}

	} else {
		if (!enabled) {
			message.reply(`Command is disabled by developer.`);
		}
		if (!bot.servers.get(message.guild.id).pubgRanksDistribute) {
			message.reply(`Server has not enabled pubg rank distribution.`);
		}
	}


}

module.exports.commandinfo = async (bot, message, args) => {
	let prefix = bot.servers.get(message.guild.id).prefix;
	let botcolor = await message.guild.fetchMember(bot.user.id).displayHexColor;
	var embed = {
		embed: {
			"title": "Help command for <command>",
			"description": "",
			"fields": [
			{
				"name": "Usage: " + prefix + "",
				"value": "",
				"inline": false
			}
			],
			"color": 3485
			}
	}
	return embed;
}

module.exports.help = {
	name: "pubgrole",
	alias: "pupdate",
	permission: "none",
	category: "pubg",
	helpcommand: false,
	devcommand: false
}

//Usage:
// name: = command name, for example "help"
// permission: = level of permission, insert one of the flags: https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
// category: category of the command
// helpcommand: if there is an help command available