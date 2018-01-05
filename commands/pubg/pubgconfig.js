module.exports.run = async (bot, message, args) => {
	var fs = require('fs');
	var filename = `/var/www/vhosts/bot.discordgaming.nl/home/pBot/servers/pubg/${message.guild.id}.json`;
	var props = require(filename);

	if (args[0] === "ranksystem") {
		if (args[1] === "ranking" || args[1] === "rating" || args[1] === "elo") {
			if (args[1] === props.ranksystem) {
				message.reply(`You cannot initialize the same ranksystem: ${args[1]}`);
			} else {

				var toInitalize = args[1];
				if (toInitalize === "ranking") {
					var toDeleteOne = "rating";
					var toDeleteTwo = "elo";
				} else if (toInitalize === "rating") {
					var toDeleteOne = "ranking";
					var toDeleteTwo = "elo";
				} else if (toInitalize === "elo") {
					var toDeleteOne = "ranking";
					var toDeleteTwo = "rating";
				}
				props.ranksystem = args[1];

				//Initalizing the system.
				//First removing the old systems, or resetting it.
				for(var attributename in props[toDeleteOne]){
					if (props[toDeleteOne][attributename] !== "") {
						console.log(`Attempting to delete role id: ${attributename} => ${props[toDeleteOne][attributename]}`);
						let role = await message.guild.roles.get(props[toDeleteOne][attributename]).delete();
						props[toDeleteOne][attributename] = "";
					}
				}
				for(var attributename in props[toDeleteTwo]){
					if (props[toDeleteTwo][attributename] !== "") {
						console.log(`Attempting to delete role id: ${attributename} => ${props[toDeleteTwo][attributename]}`);
						let role = await message.guild.roles.get(props[toDeleteTwo][attributename]).delete();
						props[toDeleteTwo][attributename] = "";
					}
				}
				//Creating new roles
				for(var attributename in props[toInitalize]){
					await message.guild.createRole({name: attributename})
						.then(role => {
							props[toInitalize][attributename] = role.id;
							role.setHoist(true);
							role.setMentionable(true);
						});
				}

				message.reply(`I've switched rank distribution based on ${args[1]}. Wait ~2 minutes before all ranks are initialized in the bot!`);
			}
		} else {
			message.reply(`You did not provide a valid rank system.`);
		}
		//DO NOTHING AT THE MOMENT
	} else if (args[0] === "enableRanks") {
		if (props.ranksystem === "none") {
			message.reply(`The server does not have a rank system. So I cannot enable distribution.`);
		} else {
			var serverfile = `/var/www/vhosts/bot.discordgaming.nl/home/pBot/servers/${message.guild.id}.json`;
			var serversettings = require(serverfile);
			serversettings.pubgRanksDistribute = true;
			bot.servers.set(message.guild.id, serversettings);
			fs.writeFile(serverfile, JSON.stringify(serversettings), function (err) {
				if (err) return console.error(err);
			});

			message.channel.send("I've enabled rank distribution for the rankings you've assigned.");
		}
	} else if (args[0] === "disableRanks") {
		var serverfile = `/var/www/vhosts/bot.discordgaming.nl/home/pBot/servers/${message.guild.id}.json`;
		var serversettings = require(serverfile);
		serversettings.pubgRanksDistribute = false;
		bot.servers.set(message.guild.id, serversettings);
		fs.writeFile(serverfile, JSON.stringify(serversettings), function (err) {
			if (err) return console.error(err);
		});

		message.channel.send("I've disabled rank distribution.");
	}
	

	//Write the new config file for PUBGsettings
	fs.writeFile(filename, JSON.stringify(props, null, 2), function (err) {
		if (err) return console.error(err);
	});
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
	name: "pubgconfig",
	alias: "",
	permission: "MANAGE_ROLES",
	category: "pubg",
	helpcommand: false,
	devcommand: false
}

//Usage:
// name: = command name, for example "help"
// permission: = level of permission, insert one of the flags: https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
// category: category of the command
// helpcommand: if there is an help command available


//Legacy Code
/*
if (props.ranksystem === "ranking") {
	/* Supported ranks (JSON format), when needed more we'll have to manually add them.
		"top50rank": "",
	  	"top100rank": "",
	  	"top250rank": "",
	  	"top500rank": "",
	  	"top1000rank": "",
	  	"top2500rank": "",
	  	"top5000rank": "",
	  	"top10000rank": "",
	  	"top25000rank": "",
	  	"unranked": ""
	*/
	/*
	switch (args[0]) {
		case "50":
			props.ranking.top50rank = message.mentions.roles.first().id;
			break;
		case "100":
			props.ranking.top100rank = message.mentions.roles.first().id;
			break;
		case "250":
			props.ranking.top250rank = message.mentions.roles.first().id;
			break;
		case "500":
			props.ranking.top500rank = message.mentions.roles.first().id;
			break;
		case "1000":
			props.ranking.top1000rank = message.mentions.roles.first().id;
			break;
		case "2500":
			props.ranking.top2500rank = message.mentions.roles.first().id;
			break;
		case "5000":
			props.ranking.top5000rank = message.mentions.roles.first().id;
			break;
		case "10000":
			props.ranking.top10000rank = message.mentions.roles.first().id;
			break;
		case "25000":
			props.ranking.top25000rank = message.mentions.roles.first().id;
			break;
		case "unranked":
			props.ranking.unranked = message.mentions.roles.first().id;
			break;
		default: 
			message.channel.send(`I'm not able to give a special rank to ${args[0]}, as there is not yet support for.`);
			return;
			break;
	}
	message.channel.send(`I've changed the ${args[0]} rank to ${message.mentions.roles.first()}.`);
}
else if (props.ranksystem === "rating") {
	//DO NOTHING AT THE MOMENT
}
*/