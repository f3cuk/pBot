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