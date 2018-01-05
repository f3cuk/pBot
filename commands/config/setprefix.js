module.exports.run = async (bot, message, args) => {
	if (args.length != 1) {
		if (bot.servers.get(message.guild.id).prefix !== args[0]) {
			const mysql       = require('mysql');
			var fs = require('fs');
			var filename = `/var/www/vhosts/bot.discordgaming.nl/home/pBot/servers/${message.guild.id}.json`;
			var props = require(filename);
			props.prefix = args[0];
			fs.writeFile(filename, JSON.stringify(props, null, 2), function (err) {
				if (err) return console.error(err);
			});
			var con = mysql.createConnection({
				host: bot.settingscfg.mysqlHost,
				user: bot.settingscfg.mysqlUser,
				password: bot.settingscfg.mysqlPass,
				database: bot.settingscfg.mysqlData
			});
			con.connect(err => {
				if (err) console.error(err);
				con.query(`UPDATE servers SET prefix = "${props.prefix}" WHERE serverid = "${message.guild.id}"`, (err, rows) => {
					if (err) return console.error(err);
					console.log("Updated the database prefix.");
				});
			});
			bot.servers.set(message.guild.id, props);
			message.channel.send(`Prefix changed to ${args[0]}`);
		}
	} else {
		message.channel.send(`Please provide enough arguments to execute this command.`);
	}
	
}

module.exports.help = {
	name: "setprefix",
	alias: "",
	permission: "ADMINISTRATOR",
	category: "config",
	helpcommand: true,
	devcommand: false
}