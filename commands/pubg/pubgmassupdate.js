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

	var fs = require('fs');
	var filename = `/home/pBot/servers/pubg/${message.guild.id}.json`;
	var pubgsettings = require(filename);
	if (pubgsettings.ranksystem === "elo") {
			con.query(`SELECT * FROM pubgranks WHERE discordserver = ${message.guild.id}`, async (err, rows) => {
			rows.forEach(async (p, i) => {
				//Getting the stats
				let awaitmessage = await message.reply(`I'm currently updating all the ranks for the ${rows.length} users in the server.`);
				setTimeout(async function() {
					var playerinfo = p;
					var playertofind = p.discorduser;
					var elosquadtpp = 1;
					var elosquadfpp = 1;
					
					awaitmessage.edit(`${message.author}, I'm currently updating all the ranks for the ${rows.length} users in the server.\nUpdating: ${playerinfo.pubgname}`);
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

					let guildMember = await message.guild.fetchMember(playertofind).catch((err) => console.error(err));

					//Assinging the new role to the user.
					var toGive;
					if (bestelo < 1600) {
						toGive = "unranked";
					} else if (bestelo >= 1600 && bestelo < 2000) {
						toGive = "1600rating";
					} else if (bestelo >= 2000 && bestelo < 2400) {
						toGive = "2000rating";
					} else if (bestelo >= 2400 && bestelo < 2800) {
						toGive = "2400rating";
					} else if (bestelo >= 2800 && bestelo < 3200) {
						toGive = "2800rating";
					} else if (bestelo >= 3200 && bestelo < 3600) {
						toGive = "3200rating";
					} else if (bestelo >= 3600 && bestelo < 4000) {
						toGive = "3600rating";
					} else if (bestelo >= 4000) {
						toGive = "4000rating";
					}

					for(var attributename in pubgsettings["elo"]){
						if (attributename === toGive) {
							guildMember.addRole(pubgsettings["elo"][attributename]);
						} else {
							guildMember.removeRole(pubgsettings["elo"][attributename]);
						}
					}
					
					con.query(`UPDATE pubgranks SET currentRank = "${bestelo}", currentMode = "${bestmode}", previousRank = "${p.currentRank}", previousMode = "${p.currentMode}", updatetime = CURRENT_TIMESTAMP WHERE discordserver = "${p.discordserver}" AND discorduser = "${p.discorduser}"`, (err, rows) => {
						if (err) console.error(err);
					});
					if ((i+1) === rows.length) {
						awaitmessage.edit(`${message.author}, I'm currently updating all the ranks for the ${rows.length} users in the server.\nI'm finished with updating`);
					}
				}, ((i*1000) + 1250));

			});
		});
	}
}

module.exports.cron = async (bot, guild, channel) => {

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
	name: "pubgmassupdate",
	alias: "",
	permission: "ADMINISTRATOR",
	category: "pubg",
	helpcommand: false,
	devcommand: false
}

//Usage:
// name: = command name, for example "help"
// permission: = level of permission, insert one of the flags: https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
// category: category of the command
// helpcommand: if there is an help command available