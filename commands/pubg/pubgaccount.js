module.exports.run = async (bot, message, args) => {
	//Const vars
	const {PubgAPI, PubgAPIErrors, REGION, MATCH} = require('pubg-api-redis');
	const SEASON = {
	  EA2017pre1: '2017-pre1',
	  EA2017pre2: '2017-pre2',
	  EA2017pre3: '2017-pre3',
	  EA2017pre4: '2017-pre4',
	  EA2017pre5: '2017-pre5',
	  EA2017pre6: '2017-pre6',
	  seas201801: '2018-01'
	};
	const pubgAPI = new PubgAPI({apikey: bot.settingscfg.pubgapikey});
	var moment = require('moment');	
	const mysql       = require('mysql');
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
			if (pubgsettings.players.length < 1) {
				//If there are no players linked in the server yet.. Defaulting to false.
				isLinked = false;
			} 
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
			var options = {
	          host: 'pubg.op.gg',
	          port: 443,
	          path: '/user/' + args[0] + '?server=eu',
	          method: 'GET'
	        };
	        
	        var req = https.request(options, function(res) {
	          res.setEncoding('utf8');
	          res.on('data', function (chunk) {
	            if (chunk.indexOf('data-user_id') > -1) {
	                if (typeof chunk === 'string') {

	                    var result = chunk.match(/data-user_id="(.*?)"/g).map(function (val) {
	                        return val.replace(/data-user_id="/g,'').replace('"','');
	                    });
	                    var opggid = result[0];
	                    console.log("I've fetched OPGGID: " + opggid);

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
									con.query(`UPDATE pubgranks SET pubgname = "${args[0]}", op_gg_id = "${opggid}" WHERE discorduser = "${message.author.id}" AND discordserver = "${message.guild.id}"`, (err, rows) => {
										if (err) return console.error(err);
									})
								} else {
									con.query(`INSERT INTO pubgranks (discordserver, discorduser, pubgname, op_gg_id) VALUES ('${message.guild.id}', '${message.author.id}', '${args[0]}', '${opggid}')`, (err, rows) => {
										if (err) return console.error(err);
									})
								}
							});
						});
	                }
	            }
	          });
	        });
	        req.on('error', function(e) {
	          console.log('problem with request: ' + e.message);
	        });
	        req.end();

			message.channel.send(`${message.author}, I've linked your PUBG account (${args[0]}) with this discord server. `);
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