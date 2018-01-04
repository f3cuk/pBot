module.exports.run = async (bot, message, args) => {
	const dispatcher = await message.guild.voiceConnection;
	const streamOptions = { seek: 0, volume: 0.15, passes: 2 }; //Volume to not RIP headphone users.
	if (args.length >= 1 && dispatcher) {
		var fs = require('fs');
		var filename = `/home/pBot/servers/${message.guild.id}.json`;
		var props = require(filename);
		var changes = false;
		if (args[0] === "moe" || args[0] === "listenmoe") {
			changes = true;
			//https://listen.moe/stream
			props.voiceControl.method = "listenmoe";
			bot.servers.set(message.guild.id, props);
			
			dispatcher.playStream('https://listen.moe/stream', streamOptions);
			message.reply(`I've started a music stream to **Listen.moe**. Enjoy your weeaboo music.`);
		}
		if (args[0] === "youtube") {
			changes = true;
			props.voiceControl.method = "youtube";
			const ytdl = require('ytdl-core');
			props = bot.servers.get(message.guild.id);

			//Given video URL is valid?
			if (ytdl.validateURL(args[1])) {
				var video = {"song": {"url": args[1]}};

				if (props.voiceQueue.length < 1) {
					const stream = ytdl(args[1], { filter : 'audioonly' });
					const streaminfo = await ytdl.getInfo(args[1]);
					dispatcher.playStream(stream, streamOptions);
					message.reply(`Now Playing: ${streaminfo.title}`);
				} else {
					message.reply(`I've added your song to the queue.`);
				}
				props.voiceQueue.push(video); //Pushing it later on, otherwise bugs.
			} else {
				message.reply(`You did not provide a valid URL.`);
			}
		}

		if (changes) {
			fs.writeFile(filename, JSON.stringify(props, null, 2), function (err) {
				if (err) return console.error(err);
			});
		}
	}
}

module.exports.commandinfo = async (bot, message, args) => {
	let prefix = bot.servers.get(message.guild.id).prefix;
	let botcolor = await message.guild.fetchMember(bot.user.id).displayHexColor;
	var embed = {
		embed: {
			"title": "[WIP] Help command for vplay",
			"description": "Used to play music in a discord channel.",
			"fields": [
			{
				"name": "Usage: " + prefix + "vplay <argument> [options]",
				"value": "Currently you can listen to a radio stream from **Listen.moe** or play Youtube Songs via the bot." +
				"```" + prefix + "vplay listenmoe\n" + prefix + "vplay youtube url```",
				"inline": false
			}
			],
			"color": 3485
			}
	}
	return embed;
}

module.exports.help = {
	name: "vplay",
	alias: "",
	permission: "none",
	category: "voice",
	helpcommand: true,
	devcommand: false
}

//Usage:
// name: = command name, for example "help"
// permission: = level of permission, insert one of the flags: https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
// category: category of the command
// helpcommand: if there is an help command available