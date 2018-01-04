module.exports.run = async (bot, message, args) => {
	var enabled = false;

	if (enabled) {
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
		const mysql   = require('mysql');
		var https = require('https');

		//Function
		if (bot.servers.get(message.guild.id).pubgRanksDistribute) {
			//Get the configuration file for the servers PUBGsettings
			var fs = require('fs');
			var filename = `/home/pBot/servers/pubg/${message.guild.id}.json`;
			var pubgsettings = require(filename);

			var isLinked = true;
			var playerinfo;
			var playertofind;
			if (pubgsettings.players.length < 1) {
				//If there are no players linked in the server yet.. Defaulting to false.
				isLinked = false;
			} 
			if (isLinked) {
				isLinked = false; //Setting value to false as we don't know if the player is in the serverlist yet.
				if (args.length >= 1) {
					playertofind = message.mentions.users.first().id;
				} else {
					playertofind = message.author.id;
				}
				pubgsettings.players.forEach((player, i) => {
					if (player.player.discordid == playertofind) {
						isLinked = true;
						playerinfo = player.player;
					}
				});
			} 
			if (isLinked) {
				var con = mysql.createConnection({
					host: bot.settingscfg.mysqlHost,
					user: bot.settingscfg.mysqlUser,
					password: bot.settingscfg.mysqlPass,
					database: bot.settingscfg.mysqlData
				});
				await con.connect(err => {
					if (err) console.error(err);
					con.query(`SELECT * FROM pubgranks WHERE discorduser = '${playerinfo.discordid}' AND discordserver = '${message.guild.id}'`, (err, rows) => {
						if (err) return console.error(err);
						if (rows.length <= 0) {
							con.query(`INSERT INTO pubgranks (discordserver, discorduser, pubgname) VALUES ('${message.guild.id}', '${playerinfo.discordid}', '${playerinfo.pubgname}')`, (err, rows) => {
								if (err) return console.error(err);
							})
						} else {
						}
					});
				});
				let awaitmessage = await message.channel.send("```Fetching rankings for " + playerinfo.pubgname + ". \nThis may take up to 2 minutes.```");
				var errorcount = 0;
				var bestRank = 20000000;
				var bestMode;
				async function updateRank(bestRank, playertofind) {
					//Finished going through all the regions
					    if (pubgsettings.ranksystem == "ranking") {
					    	let guildMember = await message.guild.fetchMember(playertofind);
					    	// if (playertofind == "322446067155075073"){
					    	// 	stats.skillRating.bestRank = (Math.random() * (10000 - 40) + 40);
					    	// }
			    			if (bestRank >= 1 && bestRank <= 50) {
			    				//Remove other rank roles:
			    				if (pubgsettings.ranking.top100rank !== "") guildMember.removeRole(pubgsettings.ranking.top100rank);
			    				if (pubgsettings.ranking.top250rank !== "") guildMember.removeRole(pubgsettings.ranking.top250rank);
			    				if (pubgsettings.ranking.top500rank !== "") guildMember.removeRole(pubgsettings.ranking.top500rank);
			    				if (pubgsettings.ranking.top1000rank !== "") guildMember.removeRole(pubgsettings.ranking.top1000rank);
			    				if (pubgsettings.ranking.top2500rank !== "") guildMember.removeRole(pubgsettings.ranking.top2500rank);
			    				if (pubgsettings.ranking.top5000rank !== "") guildMember.removeRole(pubgsettings.ranking.top5000rank);
			    				if (pubgsettings.ranking.top10000rank !== "") guildMember.removeRole(pubgsettings.ranking.top10000rank);
			    				if (pubgsettings.ranking.top25000rank !== "") guildMember.removeRole(pubgsettings.ranking.top25000rank);
			    				if (pubgsettings.ranking.unranked !== "") guildMember.removeRole(pubgsettings.ranking.unranked);

			    				//Add the new role
			    				if (pubgsettings.ranking.top50rank !== "") guildMember.addRole(pubgsettings.ranking.top50rank);
			    			} else if (bestRank >= 50 && bestRank <= 100) {
			    				//Remove other rank roles:
			    				if (pubgsettings.ranking.top50rank !== "") guildMember.removeRole(pubgsettings.ranking.top50rank);
			    				if (pubgsettings.ranking.top250rank !== "") guildMember.removeRole(pubgsettings.ranking.top250rank);
			    				if (pubgsettings.ranking.top500rank !== "") guildMember.removeRole(pubgsettings.ranking.top500rank);
			    				if (pubgsettings.ranking.top1000rank !== "") guildMember.removeRole(pubgsettings.ranking.top1000rank);
			    				if (pubgsettings.ranking.top2500rank !== "") guildMember.removeRole(pubgsettings.ranking.top2500rank);
			    				if (pubgsettings.ranking.top5000rank !== "") guildMember.removeRole(pubgsettings.ranking.top5000rank);
			    				if (pubgsettings.ranking.top10000rank !== "") guildMember.removeRole(pubgsettings.ranking.top10000rank);
			    				if (pubgsettings.ranking.top25000rank !== "") guildMember.removeRole(pubgsettings.ranking.top25000rank);
			    				if (pubgsettings.ranking.unranked !== "") guildMember.removeRole(pubgsettings.ranking.unranked);

			    				//Add the new role
			    				if (pubgsettings.ranking.top100rank !== "") guildMember.addRole(pubgsettings.ranking.top100rank);
			    			} else if (bestRank >= 101 && bestRank <= 250) {
			    				//Remove other rank roles:
			    				if (pubgsettings.ranking.top50rank !== "") guildMember.removeRole(pubgsettings.ranking.top50rank);
			    				if (pubgsettings.ranking.top100rank !== "") guildMember.removeRole(pubgsettings.ranking.top100rank);
			    				if (pubgsettings.ranking.top500rank !== "") guildMember.removeRole(pubgsettings.ranking.top500rank);
			    				if (pubgsettings.ranking.top1000rank !== "") guildMember.removeRole(pubgsettings.ranking.top1000rank);
			    				if (pubgsettings.ranking.top2500rank !== "") guildMember.removeRole(pubgsettings.ranking.top2500rank);
			    				if (pubgsettings.ranking.top5000rank !== "") guildMember.removeRole(pubgsettings.ranking.top5000rank);
			    				if (pubgsettings.ranking.top10000rank !== "") guildMember.removeRole(pubgsettings.ranking.top10000rank);
			    				if (pubgsettings.ranking.top25000rank !== "") guildMember.removeRole(pubgsettings.ranking.top25000rank);
			    				if (pubgsettings.ranking.unranked !== "") guildMember.removeRole(pubgsettings.ranking.unranked);

			    				//Add the new role
			    				if (pubgsettings.ranking.top250rank !== "") guildMember.addRole(pubgsettings.ranking.top250rank);
			    			} else if (bestRank >= 251 && bestRank <= 500) {
			    				//Remove other rank roles:
			    				if (pubgsettings.ranking.top50rank !== "") guildMember.removeRole(pubgsettings.ranking.top50rank);
			    				if (pubgsettings.ranking.top100rank !== "") guildMember.removeRole(pubgsettings.ranking.top100rank);
			    				if (pubgsettings.ranking.top250rank !== "") guildMember.removeRole(pubgsettings.ranking.top250rank);
			    				if (pubgsettings.ranking.top1000rank !== "") guildMember.removeRole(pubgsettings.ranking.top1000rank);
			    				if (pubgsettings.ranking.top2500rank !== "") guildMember.removeRole(pubgsettings.ranking.top2500rank);
			    				if (pubgsettings.ranking.top5000rank !== "") guildMember.removeRole(pubgsettings.ranking.top5000rank);
			    				if (pubgsettings.ranking.top10000rank !== "") guildMember.removeRole(pubgsettings.ranking.top10000rank);
			    				if (pubgsettings.ranking.top25000rank !== "") guildMember.removeRole(pubgsettings.ranking.top25000rank);
			    				if (pubgsettings.ranking.unranked !== "") guildMember.removeRole(pubgsettings.ranking.unranked);

			    				//Add the new role
			    				if (pubgsettings.ranking.top500rank !== "") guildMember.addRole(pubgsettings.ranking.top500rank);
			    			} else if (bestRank >= 501 && bestRank <= 1000) {
			    				//Remove other rank roles:
			    				if (pubgsettings.ranking.top50rank !== "") guildMember.removeRole(pubgsettings.ranking.top50rank);
			    				if (pubgsettings.ranking.top100rank !== "") guildMember.removeRole(pubgsettings.ranking.top100rank);
			    				if (pubgsettings.ranking.top250rank !== "") guildMember.removeRole(pubgsettings.ranking.top250rank);
			    				if (pubgsettings.ranking.top500rank !== "") guildMember.removeRole(pubgsettings.ranking.top500rank);
			    				if (pubgsettings.ranking.top2500rank !== "") guildMember.removeRole(pubgsettings.ranking.top2500rank);
			    				if (pubgsettings.ranking.top5000rank !== "") guildMember.removeRole(pubgsettings.ranking.top5000rank);
			    				if (pubgsettings.ranking.top10000rank !== "") guildMember.removeRole(pubgsettings.ranking.top10000rank);
			    				if (pubgsettings.ranking.top25000rank !== "") guildMember.removeRole(pubgsettings.ranking.top25000rank);
			    				if (pubgsettings.ranking.unranked !== "") guildMember.removeRole(pubgsettings.ranking.unranked);

			    				//Add the new role
			    				if (pubgsettings.ranking.top1000rank !== "") guildMember.addRole(pubgsettings.ranking.top1000rank);
			    			} else if (bestRank >= 1001 && bestRank <= 2500) {
			    				//Remove other rank roles:
			    				if (pubgsettings.ranking.top50rank !== "") guildMember.removeRole(pubgsettings.ranking.top50rank);
			    				if (pubgsettings.ranking.top100rank !== "") guildMember.removeRole(pubgsettings.ranking.top100rank);
			    				if (pubgsettings.ranking.top250rank !== "") guildMember.removeRole(pubgsettings.ranking.top250rank);
			    				if (pubgsettings.ranking.top500rank !== "") guildMember.removeRole(pubgsettings.ranking.top500rank);
			    				if (pubgsettings.ranking.top1000rank !== "") guildMember.removeRole(pubgsettings.ranking.top1000rank);
			    				if (pubgsettings.ranking.top5000rank !== "") guildMember.removeRole(pubgsettings.ranking.top5000rank);
			    				if (pubgsettings.ranking.top10000rank !== "") guildMember.removeRole(pubgsettings.ranking.top10000rank);
			    				if (pubgsettings.ranking.top25000rank !== "") guildMember.removeRole(pubgsettings.ranking.top25000rank);
			    				if (pubgsettings.ranking.unranked !== "") guildMember.removeRole(pubgsettings.ranking.unranked);

			    				//Add the new role
			    				if (pubgsettings.ranking.top2500rank !== "") guildMember.addRole(pubgsettings.ranking.top2500rank);
			    			} else if (bestRank >= 2501 && bestRank <= 5000) {
			    				//Remove other rank roles:
			    				if (pubgsettings.ranking.top50rank !== "") guildMember.removeRole(pubgsettings.ranking.top50rank);
			    				if (pubgsettings.ranking.top100rank !== "") guildMember.removeRole(pubgsettings.ranking.top100rank);
			    				if (pubgsettings.ranking.top250rank !== "") guildMember.removeRole(pubgsettings.ranking.top250rank);
			    				if (pubgsettings.ranking.top500rank !== "") guildMember.removeRole(pubgsettings.ranking.top500rank);
			    				if (pubgsettings.ranking.top1000rank !== "") guildMember.removeRole(pubgsettings.ranking.top1000rank);
			    				if (pubgsettings.ranking.top2500rank !== "") guildMember.removeRole(pubgsettings.ranking.top2500rank);
			    				if (pubgsettings.ranking.top10000rank !== "") guildMember.removeRole(pubgsettings.ranking.top10000rank);
			    				if (pubgsettings.ranking.top25000rank !== "") guildMember.removeRole(pubgsettings.ranking.top25000rank);
			    				if (pubgsettings.ranking.unranked !== "") guildMember.removeRole(pubgsettings.ranking.unranked);

			    				//Add the new role
			    				if (pubgsettings.ranking.top5000rank !== "") guildMember.addRole(pubgsettings.ranking.top5000rank);
			    			} else if (bestRank >= 5001 && bestRank <= 10000) {
			    				//Remove other rank roles:
			    				if (pubgsettings.ranking.top50rank !== "") guildMember.removeRole(pubgsettings.ranking.top50rank);
			    				if (pubgsettings.ranking.top100rank !== "") guildMember.removeRole(pubgsettings.ranking.top100rank);
			    				if (pubgsettings.ranking.top250rank !== "") guildMember.removeRole(pubgsettings.ranking.top250rank);
			    				if (pubgsettings.ranking.top500rank !== "") guildMember.removeRole(pubgsettings.ranking.top500rank);
			    				if (pubgsettings.ranking.top1000rank !== "") guildMember.removeRole(pubgsettings.ranking.top1000rank);
			    				if (pubgsettings.ranking.top2500rank !== "") guildMember.removeRole(pubgsettings.ranking.top2500rank);
			    				if (pubgsettings.ranking.top5000rank !== "") guildMember.removeRole(pubgsettings.ranking.top5000rank);
			    				if (pubgsettings.ranking.top25000rank !== "") guildMember.removeRole(pubgsettings.ranking.top25000rank);
			    				if (pubgsettings.ranking.unranked !== "") guildMember.removeRole(pubgsettings.ranking.unranked);

			    				//Add the new role
			    				if (pubgsettings.ranking.top10000rank !== "") guildMember.addRole(pubgsettings.ranking.top10000rank);
			    			} else if (bestRank >= 10001 && bestRank <= 25000) {
			    				//Remove other rank roles:
			    				if (pubgsettings.ranking.top50rank !== "") guildMember.removeRole(pubgsettings.ranking.top50rank);
			    				if (pubgsettings.ranking.top100rank !== "") guildMember.removeRole(pubgsettings.ranking.top100rank);
			    				if (pubgsettings.ranking.top250rank !== "") guildMember.removeRole(pubgsettings.ranking.top250rank);
			    				if (pubgsettings.ranking.top500rank !== "") guildMember.removeRole(pubgsettings.ranking.top500rank);
			    				if (pubgsettings.ranking.top1000rank !== "") guildMember.removeRole(pubgsettings.ranking.top1000rank);
			    				if (pubgsettings.ranking.top2500rank !== "") guildMember.removeRole(pubgsettings.ranking.top2500rank);
			    				if (pubgsettings.ranking.top5000rank !== "") guildMember.removeRole(pubgsettings.ranking.top5000rank);
			    				if (pubgsettings.ranking.top10000rank !== "") guildMember.removeRole(pubgsettings.ranking.top10000rank);
			    				if (pubgsettings.ranking.unranked !== "") guildMember.removeRole(pubgsettings.ranking.unranked);

			    				//Add the new role
			    				if (pubgsettings.ranking.top25000rank !== "") guildMember.addRole(pubgsettings.ranking.top25000rank);
			    			} else if (bestRank >= 25001 || bestRank == null) {
			    				//Remove other rank roles:
			    				if (pubgsettings.ranking.top50rank !== "") guildMember.removeRole(pubgsettings.ranking.top50rank);
			    				if (pubgsettings.ranking.top100rank !== "") guildMember.removeRole(pubgsettings.ranking.top100rank);
			    				if (pubgsettings.ranking.top250rank !== "") guildMember.removeRole(pubgsettings.ranking.top250rank);
			    				if (pubgsettings.ranking.top500rank !== "") guildMember.removeRole(pubgsettings.ranking.top500rank);
			    				if (pubgsettings.ranking.top1000rank !== "") guildMember.removeRole(pubgsettings.ranking.top1000rank);
			    				if (pubgsettings.ranking.top2500rank !== "") guildMember.removeRole(pubgsettings.ranking.top2500rank);
			    				if (pubgsettings.ranking.top5000rank !== "") guildMember.removeRole(pubgsettings.ranking.top5000rank);
			    				if (pubgsettings.ranking.top10000rank !== "") guildMember.removeRole(pubgsettings.ranking.top10000rank);
			    				if (pubgsettings.ranking.top25000rank !== "") guildMember.removeRole(pubgsettings.ranking.top25000rank);

			    				//Add the new role
			    				if (pubgsettings.ranking.unranked !== "") guildMember.addRole(pubgsettings.ranking.unranked);
			    			}
			    		} else if (pubgsettings.ranksystem == "rating") {
			    			//Do nothing yet.
			    		}
			    		if (args.length >= 1) {
			    			message.channel.send("```" + message.author.username + ", I've updated the rank of " + message.mentions.users.first().username + " accordingly to their best rank available: " + bestRank + "```");
			    		} else {
			    			message.channel.send("```" + message.author.username + ", I've updated your rank accordingly to your best rank available: " + bestRank + "```");
			    		}
			    		con.query(`SELECT * FROM pubgranks WHERE discordserver = "${message.guild.id}" AND discorduser = "${playerinfo.discordid}"`, (err, rows) => {
			    			if (err) return console.error(err);
			    			if (rows.length == 1) {
			    				var oldRank = rows[0]["currentRank"];
			    				var oldMode = rows[0]["currentMode"];
			    				con.query(`UPDATE pubgranks SET currentRank = "${bestRank}", currentMode = "${bestMode}", previousRank = "${oldRank}", previousMode = "${oldMode}", updatetime = CURRENT_TIMESTAMP WHERE discordserver = "${message.guild.id}" AND discorduser = "${playerinfo.discordid}"`, (err, rows) => {
					    			if (err) return console.error(err);
					    		});
			    			} 
			    		});
				}
				function updateStats() {
					pubgAPI.getProfileByNickname(playerinfo.pubgname)
					  .then(async (profile) => {

					    const data = profile.content;
					    var {solo, duo, squad, solofpp, duofpp, squadfpp} = false;
					    var {na, eu, as, oc, sa, sea, krjp} = false;

					    var contentstats = profile.content.Stats;
					    contentstats.forEach((stat, i) => {
					    	//EU Checks
				    		if (stat.Season === SEASON.seas201801 && stat.Region == 'eu') {
				    			eu = true;
				    			switch (stat.Match) {
				    				case "solo":
				    					solo = false;
				    					break;
				    				case "duo":
				    					duo = false;
				    					break;
				    				case "squad":
				    					squad = true;
				    					break;
				    				case "solo-fpp":
				    					solofpp = false;
				    					break;
				    				case "duo-fpp":
				    					duofpp = false;
				    					break;
				    				case "squad-fpp":
				    					squadfpp = true;
				    					break;
				    			}
				    		}
					    });

					    var stats;
					    //Fetching stats for each Region!
					    if (eu) {
					    	if (solo) {
						    	stats = profile.getStats({
							      region: 'eu',
							      season: SEASON.seas201801,
							      match: 'solo'
							    });
						    	if (stats.rankData.rating <= bestRank) {
						    		bestRank = stats.rankData.rating;
						    		bestMode = 'solo';
						    	}
						    }
						    if (duo) {
						    	stats = profile.getStats({
							      region: 'eu',
							      season: SEASON.seas201801,
							      match: 'duo'
							    });
						    	if (stats.rankData.rating <= bestRank) {
						    		bestRank = stats.rankData.rating;
						    		bestMode = 'duo';
						    	}
						    }
						    if (squad) {
						    	stats = profile.getStats({
							      region: 'eu',
							      season: SEASON.seas201801,
							      match: 'squad'
							    });
						    	if (stats.rankData.rating <= bestRank) {
						    		bestRank = stats.rankData.rating;
						    		bestMode = 'squad';
						    	}
						    }
						    if (solofpp) {
						    	stats = profile.getStats({
							      region: 'eu',
							      season: SEASON.seas201801,
							      match: 'solo-fpp'
							    });
						    	if (stats.rankData.rating <= bestRank) {
						    		bestRank = stats.rankData.rating;
						    		bestMode = 'solo-fpp';
						    	}
						    }
						    if (duofpp) {
						    	stats = profile.getStats({
							      region: 'eu',
							      season: SEASON.seas201801,
							      match: 'duo-fpp'
							    });
						    	if (stats.rankData.rating <= bestRank) {
						    		bestRank = stats.rankData.rating;
						    		bestMode = 'duo-fpp';
						    	}
						    }
						    if (squadfpp) {
						    	stats = profile.getStats({
							      region: 'eu',
							      season: SEASON.seas201801,
							      match: 'squad-fpp'
							    });
						    	if (stats.rankData.rating <= bestRank) {
						    		bestRank = stats.rankData.rating;
						    		bestMode = 'squad-fpp';
						    	}
						    }
					    }
					    updateRank(bestRank, playertofind);
					    awaitmessage.delete();
					})
					.catch(async (error) => {
						if (errorcount >= 0) {
							let botdev = await message.guild.fetchMember("120978498956296194");
							updateStatsBackup();
							awaitmessage.edit(botdev + "```Fetched rankings for " + playerinfo.pubgname + ". \n\nI've used the backup API (PUBG.OP.GG) to find the stats for the player.```");
						} else {
							awaitmessage.edit("```Fetching rankings for " + playerinfo.pubgname + ". \nThis may take up to 2 minutes.\n\nI've encountered " + (errorcount + 1) +" error(s).```");
							setTimeout(function() {
								updateStats();
								errorcount++;
							}, 60000);
						}
					});
				}
				function updateStatsBackup() {
					con.query(`SELECT * FROM pubgranks WHERE discordserver = "${message.guild.id}" AND discorduser = "${playerinfo.discordid}"`, (err, rows) => {
						if (err) return console.error(err);
						if (rows.length >= 1) {
							//Squad FPP EU Rankings:
							var squadfpp = {
					          host: 'pubg.op.gg',
					          port: 443,
					          path: '/api/users/' + rows[0]['op_gg_id'] + '/matches/aggregate?season=2018-01&server=eu&queue_size=4&mode=fpp',
					          method: 'GET',
					          headers: { 'Content-Type': 'application/json' }
					        };
					        //Squad TPP EU Rankings:
					        var squadtpp = {
					          host: 'pubg.op.gg',
					          port: 443,
					          path: '/api/users/' + rows[0]['op_gg_id'] + '/matches/aggregate?season=2018-01&server=eu&queue_size=4&mode=tpp',
					          method: 'GET',
					          headers: { 'Content-Type': 'application/json' }
					        };

					        var req = https.get(squadfpp, function(res) {
					        	res.setEncoding('utf8');
								res.on('data', async function (chunk) {
									var json = JSON.parse(chunk);
									if (json.message !== "" && json.ranks.rating < bestRank) {
										bestRank = json.ranks.rating;
										bestMode = "squad-fpp";
									}
									var requ = https.get(squadtpp, function(ress) {
							        	ress.setEncoding('utf8');
										ress.on('data', async function (chunk) {
											var jsont = JSON.parse(chunk);
											if (jsont.message !== "" && jsont.ranks.rating < bestRank) {
												bestRank = jsont.ranks.rating;
												bestMode = "squad";
											}
											updateRank(bestRank, playertofind);
										});
										requ.on('error', function(e) {
											console.log('problem with request: ' + e.message);
										});
										requ.end();
									});

								});
								req.on('error', function(e) {
									console.log('problem with request: ' + e.message);
								});
								req.end();
							});
						}
					});
				}
				updateStats();
			} else {
				let prefix = await bot.servers.get(message.guild.id).prefix;
				if (args.length >= 1) {
					message.channel.send(`${message.author}, ${message.mentions.users.first()} has not yet linked their account to this server.	`);
				} else {
					message.channel.send(`You've not yet linked your PUBG name to the bot in this server. Please use ${prefix}pubgaccount <username>`);
				}
			}
		} else {
			message.channel.send(`This server has not enabled this command. Message an server administrator to enable it.`);
		}
	} else {
		message.reply(`Command disabled due to season changes. Or issues with API's.`);
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
	name: "123pubgroleold",
	alias: "123pupdateold",
	permission: "none",
	category: "*legacypubg",
	helpcommand: false,
	devcommand: false
}

//Usage:
// name: = command name, for example "help"
// permission: = level of permission, insert one of the flags: https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
// category: category of the command
// helpcommand: if there is an help command available