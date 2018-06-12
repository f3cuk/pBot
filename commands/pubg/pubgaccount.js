module.exports.run = async (bot, message, args) => {
	//Const vars
	var moment = require('moment');	
	const mysql = require('mysql');
	var https = require('https');

	if (bot.servers.get(message.guild.id).pubgRanksDistribute) {
		if (args.length == 1) {
			//Get the configuration file for the servers PUBGsettings
			var fs = require('fs');
			var filename = `/var/www/vhosts/bot.discordgaming.nl/home/pBot/servers/pubg/${message.guild.id}.json`;
			var pubgsettings = require(filename);

			var isLinked = true;
			var playerprops;
			var playerid;

			if (pubgsettings.players.length < 1)
				isLinked = false;

			if (isLinked) {
				isLinked = false; //Setting value to false as we don't know if the player is in the serverlist yet.
				pubgsettings.players.forEach((player, i) => {
					if (player.player.discordid == message.author.id) {
						isLinked = true;
						playerprops = player;
						playerid = i;
					}
				});
			} 

			if (isLinked) {
				playerprops.player.pubgname = args[0];
				pubgsettings.players[playerid] = playerprops;
			} else {
				playerprops = {
					"player": {
						"discordid": message.author.id,
						"pubgname": args[0],
						"region": "eu"
					}
				}

				pubgsettings.players.push(playerprops);
			}

			var con = mysql.createConnection({
				host: bot.settingscfg.mysqlHost,
				user: bot.settingscfg.mysqlUser,
				password: bot.settingscfg.mysqlPass,
				database: bot.settingscfg.mysqlData
			});
			
			con.connect(err => {
				if (err) console.error(err);
				con.query(`SELECT * FROM pubgranks WHERE discorduser = "${message.author.id}" AND discordserver = "${message.guild.id}"`, (err, rows) => {
					if (err) return console.error(err);
					if (rows.length >= 1) {
						con.query(`UPDATE pubgranks SET pubgname = "${args[0]}", api_id = "" WHERE discorduser = "${message.author.id}" AND discordserver = "${message.guild.id}"`, (err, rows) => {
							if (err) return console.error(err);
						})
					} else {
						con.query(`INSERT INTO pubgranks (discordserver, discorduser, pubgname) VALUES ('${message.guild.id}', '${message.author.id}', '${args[0]}')`, (err, rows) => {
							if (err) return console.error(err);
						})
					}
				});
			});

			message.channel.send(`${message.author}, I've linked your PUBG account (${args[0]}) with this discord server.`);
			fs.writeFile(filename, JSON.stringify(pubgsettings, null, 2), function (err) {
				if (err) return console.error(err);
			});
		} else {
			let prefix = bot.servers.get(message.guild.id).prefix;
			message.channel.send(`Please provide your username. Use **${prefix}help pubgaccount** if need want to see the usage.`);
		}		
	} else {
		message.channel.send(`This server has not enabled this command. Message an server administrator to enable it.`);
	}
}

module.exports.commandinfo = async (bot, message, args) => {
	let prefix = bot.servers.get(message.guild.id).prefix;
	let botcolor = await message.guild.fetchMember(bot.user.id).displayHexColor;
	var embed = {
		embed: {
			"title": "Help command for pubgaccount",
			"description": "Used to linked PUBG account names to the user in discord.",
			"fields": [
			{
				"name": "Usage: " + prefix + "pubgaccount <accountname>",
				"value": "Registers your PUBG username to your discord account for the server you're using the command in.",
				"inline": false
			}
			],
			"color": 3485
			}
	}
	return embed;
}

module.exports.help = {
	name: "pubgaccount",
	alias: "",
	permission: "none",
	category: "pubg",
	helpcommand: true,
	devcommand: false
}

//Usage:
// name: = command name, for example "help"
// permission: = level of permission, insert one of the flags: https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
// category: category of the command
// helpcommand: if there is an help command available