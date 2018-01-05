module.exports.run = async (bot, message, args) => {
	var fs = require('fs');
	var filename = `/var/www/vhosts/bot.discordgaming.nl/home/pBot/servers/${message.guild.id}.json`;
	var props = require(filename);

	switch(args[0]) {
		case "enable":
			props.welcomeEnabled = "1";
			message.channel.send(`I've **enabled** the welcome messages.`);
			break;
		case "disable":
			props.welcomeEnabled = "0";
			message.channel.send(`I've **disabled** the welcome messages.`);
			break;
		case "channel":
			var check = "<@";
			let welcome = ``;
			if (message.mentions.channels.first().id.indexOf(check)) {
				welcome = message.mentions.channels.first().id;
			} else {
				welcome = args[1];
			}
			props.welcomeChannel = welcome;
			message.channel.send(`I've changed the welcome message channel to ${message.mentions.channels.first()}`);
			break;
		case "ruleschannel":
			var check = "<@";
			let rules = ``;
			if (message.mentions.channels.first().id.indexOf(check)) {
				rules = message.mentions.channels.first().id;
			} else {
				rules = args[1];
			}
			props.welcomeRulesCh = rules;
			message.channel.send(`I've changed the rules channel in the welcome message to ${message.mentions.channels.first()}`);
			break;
		case "message":
			let welcomemessage = message.content.slice(((bot.servers.get(message.guild.id).prefix.length) + 11 + 7 + 2));
			props.welcomeMessage = welcomemessage;
			message.channel.send(`I've changed the welcome message to ${welcomemessage}`);
			break;
	}
	bot.servers.set(message.guild.id, props);
	fs.writeFile(filename, JSON.stringify(props, null, 2), function (err) {
		if (err) return console.error(err);
	});
}

module.exports.commandinfo = async (bot, message, args) => {
	let prefix = bot.servers.get(message.guild.id).prefix;
	var embed = {
		embed: {
			"title": "Help command for joinmessage",
			"description": "This command is used to make the bot welcome every new discord member into the discord.",
			"fields": [
			{
				"name": "Usage: " + prefix + "joinmessage <enable / disable>",
				"value": "Used to enable or disable the welcome messages. By default the welcome message is disabled.```" + prefix + "joinmessage enable\n" + prefix + "joinmessage disable```",
				"inline": false
			},
			{
				"name": "Usage: " + prefix + "joinmessage channel <channel>",
				"value": "Used to set the channel where the bot will welcome message. Either tag the channel or use the channel id.```" + prefix + "joinmessage channel #welcome```",
				"inline": false
			},
			{
				"name": "Usage: " + prefix + "joinmessage ruleschannel <channel>",
				"value": "Used to set the channel where the bot will reference to if you have a rules channel. Either tag the channel or use the channel id.```" + prefix + "joinmessage ruleschannel #rules```",
				"inline": false
			},
			{
				"name": "Usage: " + prefix + "joinmessage message <message>",
				"value": "Used to set the welcome message send out by the bot. You can use %member%, %rules%, %membercount% as quick references in the message. " +
						 "```" + prefix + "joinmessage message Welcome %username% to pBot's Server, read the %RULES% for more information. We're now at a total of %MEMBERCOUNT% users in the discord.```",
				"inline": false
			}
			],
			"color": 3485
			}
	}
	return embed;

}

module.exports.help = {
	name: "joinmessage",
	alias: "",
	permission: "ADMINISTRATOR",
	category: "config",
	helpcommand: true,
	devcommand: false
}