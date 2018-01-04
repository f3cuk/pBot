module.exports.run = async (bot, message, args) => {
	let prefix = bot.servers.get(message.guild.id).prefix;
	var fs = require('fs');
	var filename = `/home/pBot/servers/${message.guild.id}.json`;
	var props = require(filename);
	if (args.length == 2) {
		
		//By default the command is valid, can become false if some kind of error happens...
		var falseReason;
		var valid = true;
		if (message.mentions.roles.length > 1) {
			valid = false;
			falseReason = `Didn't mention a role to make self assignable`;
		}
		if (props.selfAssignRoles.length >= 1 && valid) {
			props.selfAssignRoles.forEach((role, i) => {
				if (role.role.shortname === args[1]) {
					valid = false;
					falseReason = `Shortname is already taken`;
				} else if (role.role.roleid === message.mentions.roles.first().id) {
					valid = false;
					falseReason = `Role is already self assignable`;
				}
			});
		}
		if (valid) {
			var roleprops = {
				"role" : {
					"roleid": message.mentions.roles.first().id,
					"shortname": args[1]
				}
			}
			props.selfAssignRoles.push(roleprops);

			message.channel.send(`${message.author}, I've made ${message.mentions.roles.first()}, self assignable with shortname ${args[1]}. `);
			fs.writeFile(filename, JSON.stringify(props, null, 2), function (err) {
				if (err) return console.error(err);
			});
		} else {
			message.channel.send(`${message.author}, error: ${falseReason}. Unable to create a new self assignable role.`);
		}
	} else if (args.length == 2 && (args[1] === "remove" || args[1] === "delete")) {
		if (props.selfAssignRoles.length >= 1) {
			props.selfAssignRoles.forEach((role, i) => {
				if (role.role.shortname === args[0]) {
					props.selfAssignRoles.splice(i, 1);
				}
			});
		}
		message.channel.send(`I've removed the ${args[0]} as a self assignable role.`);
		fs.writeFile(filename, JSON.stringify(props, null, 2), function (err) {
			if (err) return console.error(err);
		});
	} else {
		message.channel.send(`${message.author}, you've not provided enough arguments for this command. Please use ${prefix}help selfassignconfig`);
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
	name: "selfassignconfig",
	alias: "",
	permission: "MANAGE_ROLES",
	category: "config",
	helpcommand: true,
	devcommand: false
}

//Usage:
// name: = command name, for example "help"
// permission: = level of permission, insert one of the flags: https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
// category: category of the command
// helpcommand: if there is an help command available