var Discord = require('discord.js');
module.exports.run = async (bot, message, args) => {
	//Command
	//EMBED JSON {"title":"Commands list","description":"All the commands which are used by ","fields":[{"name":"Config Commands","value":"","inline":true},{"name":"Utility Commands","value":"","inline":true}],"color":7458112}
	if (args.length >= 1) {
		let cmd = await bot.commands.get(args[0]);
		if (cmd.help.helpcommand) {
			let embed = await bot.commands.get(args[0]).commandinfo(bot, message, args);
			await message.channel.send(embed);
		} else {
			message.channel.send(`There is no help command available for ${args[0]}`);
		}
	} else {
		//Define all the categories (commands are defined by them)
		var category = [{"category": "utils"},{"category": "config"},{"category": "misc"},{"category":"pubg"},{"category":"voice"}];
		//Define the default embed
		var embed = {
			embed: {
				"title": "Commands list",
				"description": "All the commands which are used by " + bot.settingscfg.botname + ".",
				"fields": [],
				"color": 3485
				}
		}
		//Get all the commands
		var commands = bot.commands;
		category.forEach((c, i) => {
			let categorycommands = new Discord.Collection();
			commands.forEach((com, i) => {
				if (com.help.category === c.category) {
					categorycommands.set(com.help.name, com);
				}
			});
			let embedField = {
				"name": `${c.category} commands`,
				"value": "",
				"inline": false
			}
			categorycommands.forEach((cc, i) => {
				embedField.value = embedField.value + " ``" + cc.help.name + "``";
			});
			embed.embed.fields.push(embedField);
		});
		//Send the embed
		await message.channel.send(embed);
	}
}

module.exports.help = {
	name: "help",
	alias: "",
	permission: "none",
	category: "utils",
	helpcommand: false,
	devcommand: false
}