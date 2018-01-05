module.exports.run = async (bot, message, args) => {
	if (args.length = 1) {
		var fs = require('fs');
		var filename = `/var/www/vhosts/bot.discordgaming.nl/home/pBot/servers/${message.guild.id}.json`;
		var props = require(filename);

		var assingtorole;
		var valid = false;
		var falseReason;
		if (props.selfAssignRoles.length >= 1) {
			props.selfAssignRoles.forEach((role, i) => {
				if (role.role.shortname === args[0]) {
					valid = true;
					assigntorole = role.role.roleid;
				}
			});
			if (valid) {
				message.member.addRole(assigntorole);
				message.channel.send(`${message.author}, I've assigned you to the ${args[0]} role.`);
			} else {
				message.channel.send(`${message.author}, the given shortname isn't available. I cannot give you any self assignable role.`);
			}
		} else {
			message.channel.send(`${message.author}, this server doesn't have any self assignable roles (yet).`);
		}
	} else {
		//Available roles.
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
	name: "selfassign",
	alias: "",
	permission: "none",
	category: "utils",
	helpcommand: true,
	devcommand: false
}

//Usage:
// name: = command name, for example "help"
// permission: = level of permission, insert one of the flags: https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
// category: category of the command
// helpcommand: if there is an help command available