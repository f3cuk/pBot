module.exports.run = async (bot, message, args) => {
	if (message.member.voiceChannel) {
		var fs = require('fs');
		var filename = `/home/pBot/servers/${message.guild.id}.json`;
		var props = require(filename);

		message.member.voiceChannel.join()
			.then(connection => { // Connection is an instance of VoiceConnection
				message.reply('I have successfully connected to the channel!');
				props.voiceControl.active = true;
			 	props.voiceControl.channel = message.member.voiceChannelID;
				props.voiceControl.method = "idle";
				bot.servers.set(message.guild.id, props);
				fs.writeFile(filename, JSON.stringify(props, null, 2), function (err) {
					if (err) return console.error(err);
				});
			}).catch(console.log);
    } else {
      message.reply('You need to join a voice channel first!');
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
	name: "vjoin",
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