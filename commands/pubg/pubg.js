module.exports.run = async (bot, message, args) => {
	//Const variables.
	const {PubgAPI, PubgAPIErrors, REGION, MATCH} = require('pubg-api-redis');
	const curseason = bot.settingscfg.curseason;
	const pubgAPI = new PubgAPI({apikey: bot.settingscfg.pubgapikey});
	const mysql = require('mysql');

	if (args.length != 3) {
		let prefix = bot.servers.get(message.guild.id).prefix;
		message.channel.send(`${message.author}, you've not provided the needed arguments to execute the command. Use `+"``"+ `${prefix}help pubg`+"``"+ ` if you need help for this command.`);
		return;
	}
	//{prefix}pubg <name> <region> <mode>
	var name   = args[0];
	var region = args[1].toLowerCase();
	var mode   = args[2].toLowerCase();

	var finalRegion, finalMode;
	//na eu as oc sa sea krjp
	switch(region) {
		case "eu":
			finalRegion = REGION.EU;
			break;
		case "na":
			finalRegion = REGION.NA;
			break;
		case "as":
			finalRegion = REGION.AS;
			break;
		case "oc":
			finalRegion = REGION.OC;
			break;
		case "sa":
			finalRegion = REGION.SA;
			 break;
		case "sea":
			finalRegion = REGION.SEA;
			break;
		case "krjp":
			finalRegion = 'krjp';
			break;
	}
	//solo duo squad solo-fpp duo-fpp squad-fpp
	switch(mode) {
		case "solo":
			finalMode = MATCH.SOLO;
			break;
		case "duo":
			finalMode = MATCH.DUO;
			break;
		case "squad":
			finalMode = MATCH.SQUAD;
			break;
		case "solo-fpp":
			finalMode = MATCH.SOLOFPP;
			break;
		case "duo-fpp":
			finalMode = MATCH.DUOFPP;
			break;
		case "squad-fpp":
			finalMode = MATCH.SQUADFPP;
			break;
	}
	//Get the stats
	pubgAPI.getProfileByNickname(args[0])
	  .then(async (profile) => {	  	
	    const data = profile.content;
	    var contentstats = profile.content.Stats;
	    var hasStats = false;
	    contentstats.forEach((stat, i) => {
	    	if (!hasStats) {
	    		if (stat.Region === finalRegion && stat.Match === finalMode && stat.Season === curseason) {
	    			hasStats = true;
	    		}
	    	}
	    });
	    if (hasStats) {
	    	const stats = profile.getStats({
		      region: finalRegion,
		      season: curseason,
		      match: finalMode
		    });

		    var sec, min, hour;
		    var seconds = stats.performance.timeSurvived;
		    if(seconds<3600){
			    var a = Math.floor(seconds/60); //minutes
			    var b = seconds%60; //seconds

			    if (b!=1){
			        sec = "seconds";
			    }else{
			        sec = "second";
			    }

			    if(a!=1){
			        min = "minutes";
			    }else{
			        min = "minute";
			    }

			    var timePlayed = ""+a+" "+min+"";
			} 
			else {
			    var a = Math.floor(seconds/3600); //hours
			    var x = seconds%3600;
			    var b = Math.floor(x/60); //minutes
			    var c = seconds%60; //seconds

			     if (c!=1){
			        sec = "seconds";
			    }else{
			        sec = "second";
			    }

			    if(b!=1){
			        min = "mins";
			    }else{
			        min = "min";
			    }

			    if(c!=1){
			        hour = "hrs";
			    }else{
			        hour = "hr";
			    }

			    var timePlayed = ""+a+" "+hour+", "+b+" "+min+"";
			}
			var moment = require("moment");
		    var embed = {
		    	embed: {
		    	  "title": "Stats for: " + name + ", mode: "+ finalMode + ", in region: " + finalRegion,
		    	  "description": "Stats provided by PUBGTracker.com",
		    	  "author": {
		    	  	"name": "Requested by: " + message.author.username,
		    	  	"icon_url": message.author.displayAvatarURL
		    	  },
		    	  "footer":{"text":"pBot | " + moment().format('MMMM Do YYYY, h:mm:ss a')},
				  "color": 3485,
				  "fields": [
				    {
				      "inline": true,
				      "name": "Rating",
				      "value": stats.skillRating.rating
				    },
				    {
				      "inline": true,
				      "name": "Wins",
				      "value": stats.performance.wins
				    },
				    {
				      "inline": true,
				      "name": "Top 10s",
				      "value": stats.performance.top10s
				    },
				    {
				      "inline": true,
				      "name": "K/D Ratio",
				      "value": ""+stats.performance.killDeathRatio+""
				    },
				    {
				      "inline": true,
				      "name": "Win Percentage",
				      "value": "" + stats.performance.winRatio + " %"
				    },
				    {
				      "inline": true,
				      "name": "Time Played",
				      "value": ""+timePlayed+""
				    }
				  ]
				}
		    }
		    message.channel.send(embed);
		    // Require library
			// var gd = require('node-gd');

			// // Create blank new image in memory
			// await gd.openFile('/var/www/vhosts/bot.discordgaming.nl/home/TokaHimiko/_examples/pubg_img.png', function(err, img) {
			// 	if (err) {
			// 		throw err;
			// 	}

			// 	var txtWhite = img.colorAllocate(255, 255, 255);
			// 	var txtOrang = img.colorAllocate(255, 153, 0);

			// 	var fontPathBig = '/var/www/vhosts/bot.discordgaming.nl/home/TokaHimiko/fonts/teko.medium.ttf';
			// 	var fontPathSma = '/var/www/vhosts/bot.discordgaming.nl/home/TokaHimiko/fonts/teko.light.ttf';

			// 	//Userinfo
			// 	var regionmode = (finalRegion.toUpperCase() + " - " + finalMode.toUpperCase());
			// 	img.stringFT(txtWhite, fontPathBig, 26, 0, 90, 40, name);
			// 	img.stringFT(txtOrang, fontPathBig, 22, 0, 90, 80, regionmode);

			// 	//Rating
			// 	var rating = (""+stats.skillRating.rating+"");
			// 	img.stringFT(txtWhite, fontPathSma, 34, 0, 90, 190, rating);

			// 	//K/D Ratio
			// 	var kdratio = (""+stats.performance.killDeathRatio+"");
			// 	img.stringFT(txtWhite, fontPathSma, 34, 0, 90, 286, kdratio);

			// 	//Wins
			// 	var wins = (""+stats.performance.wins+"");
			// 	img.stringFT(txtWhite, fontPathSma, 34, 0, 300, 190, wins);

			// 	//Win %
			// 	var winper = ("" + stats.performance.winRatio + " %");
			// 	img.stringFT(txtWhite, fontPathSma, 34, 0, 260, 286, winper);

			// 	//Top10s
			// 	var top10s = (""+stats.performance.top10s+"");
			// 	img.stringFT(txtWhite, fontPathSma, 34, 0, 480, 190, top10s);

			// 	//Time Played
			// 	var playtime = (""+timePlayed+"");
			// 	img.stringFT(txtWhite, fontPathSma, 22, 0, 434, 278, playtime);


			// 	img.saveFile('/var/www/vhosts/bot.discordgaming.nl/home/TokaHimiko/images/output.png', function(err) {
			// 		img.destroy();
			// 		if (err) {
			// 			throw err;
			// 		}
			// 	});
			// });

			// await message.channel.send({files: [
			// 	{
			// 		attachment: '/var/www/vhosts/bot.discordgaming.nl/home/TokaHimiko/images/output.png',
			// 		name: "output.png"
			// 	}
			// ]});

	    } else {
	    	let prefix = bot.servers.get(message.guild.id).prefix;
	    	message.channel.send(`${message.author}, I've not found stats for the requested player ${args[0]} | ${finalRegion} | ${finalMode}. Use ${prefix}help pubg if you need help for this command.`);
	    }

	})
	.catch((error) => {
		message.reply(`I've run into an error getting stats: ${error}`);
	});
}

module.exports.commandinfo = async (bot, message, args) => {
	let prefix = bot.servers.get(message.guild.id).prefix;
	let botcolor = await message.guild.fetchMember(bot.user.id).displayHexColor;
	var embed = {
		embed: {
			"title": "Help command for pubg",
			"description": "",
			"fields": [
			{
				"name": "Usage: " + prefix + "pubg <pubgname> <region> <mode>",
				"value": "Used for finding stats of a certain player.",
				"inline": false
			},
			{
				"name": "Regions",
				"value": "```na\neu\nas\noc\nsa\nsea\nkrjp```",
				"inline": false
			},
			{
				"name": "Modes",
				"value": "```\nsolo\nduo\nsquad\nsolo-fpp\nduo-fpp\nsquad-fpp```",
				"inline": false
			}
			],
			"color": 3485
			}
	}
	return embed;
}

module.exports.help = {
	name: "pubg",
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