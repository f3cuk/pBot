module.exports.run = async (bot, message, args) => {
	const Discord     = require('discord.js');
	var guilds = bot.guilds.array().length;
	var users  = bot.users.array().length;


	message.channel.send(`\`\`\`Connected to ${guilds} servers!\nThere are ${users} total users in those servers!\`\`\``);
}

module.exports.help = {
	name: "botstats",
	alias: "",
	permission: "none",
	category: "misc",
	helpcommand: false,
	devcommand: false
}