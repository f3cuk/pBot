module.exports.run = async (bot, message, args) => {
	const dispatcher = await message.guild.voiceConnection;
	if (dispatcher) {
		var fs = require('fs');
		var filename = `/home/pBot/servers/${message.guild.id}.json`;
		var props = require(filename);

		props.voiceControl.active = false;
		props.voiceControl.channel = "";
		props.voiceControl.method = "";

		bot.servers.set(message.guild.id, props);
		fs.writeFile(filename, JSON.stringify(props, null, 2), function (err) {
			if (err) return console.error(err);
		});
		
		dispatcher.disconnect();
		message.reply(`I've left your voice channel`);
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
	name: "vleave",
	alias: "",
	permission: "none",
	category: "voice",
	helpcommand: false,
	devcommand: false
}

//Usage:
// name: = command name, for example "help"
// permission: = level of permission, insert one of the flags: https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
// category: category of the command
// helpcommand: if there is an help command available