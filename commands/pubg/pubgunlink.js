module.exports.run = async (bot, message, args) => {
	const mysql       = require('mysql');
	if (bot.servers.get(message.guild.id).pubgRanksDistribute) {
		message.reply(`This command is not yet fully functional and in development.`);
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
	name: "pubgunlink",
	alias: "",
	permission: "none",
	category: "*dev*pubg",
	helpcommand: true,
	devcommand: false
}

//Usage:
// name: = command name, for example "help"
// permission: = level of permission, insert one of the flags: https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
// category: category of the command
// helpcommand: if there is an help command available