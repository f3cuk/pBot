module.exports.run = async (bot, message, args) => {
	const opggapi = require("pubg.op.gg");
	const {PubgAPI, PubgAPIErrors, REGION, SEASON, MATCH} = require('pubg.op.gg');
	const api = new PubgAPI();
	const mysql   = require('mysql');
	const curseason = bot.settingscfg.curseason;
	var https = require('https');

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
			// te doen
		} else if (pubgsettings.ranksystem === "ranking") {
			// te doen
		} else if (pubgsettings.ranksystem === "elo") {

			con.query(`SELECT * FROM pubgranks WHERE discorduser = ${playertofind} AND discordserver = ${message.guild.id}`, async (err, rows) => {
				if (err) {
					console.error(err);
					message.reply(e.message);
				}

				if(rows.length == 0) {
					message.reply('Your account has not been linked yet, use .pubgaccount [ingame name] to link your account.');
				} else {

					var playerinfo = rows[0];

					var options = {
						host: 'pubg.discordgaming.nl',
						port: 443,
						path: '/api.php?playername='+playerinfo['pubgname'],
						method: 'GET'
					};

					var bestelo = 1;

					var req = https.request(options, function(res) {
						if(res && res > 1) {
							var bestelo = res;
						}
					});
					req.on('error', function(e) {
						console.log('problem with request: ' + e.message);
						message.reply(e.message);
					});
					req.end();

					let guildMember = await message.guild.fetchMember(playertofind);

					for(var attributename in pubgsettings["elo"]){
						await guildMember.removeRole(pubgsettings["elo"][attributename]);
					}

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

				}
			});

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