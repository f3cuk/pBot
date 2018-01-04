const BotSettings = require('./botsettings.json');
const Discord     = require('discord.js');
const mysql       = require('mysql');
const fs 		  = require("fs");
const recursive   = require("recursive-readdir");
const ytdl 		  = require('ytdl-core');

const bot 	 	  = new Discord.Client({disableEveryone: true});
bot.commands 	  = new Discord.Collection();
bot.servers  	  = new Discord.Collection();
bot.settingscfg	  = BotSettings;

//load mysql
var con = mysql.createConnection({
	host: BotSettings.mysqlHost,
	user: BotSettings.mysqlUser,
	password: BotSettings.mysqlPass,
	database: BotSettings.mysqlData,
	dateStrings: true
});
con.connect(err => {
	if (err) console.error(err);
	console.log ("Connected to database");
});


/* BOT METHODS */
//Extend JSON objects into each other. Used for configuration merge.
function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}
//Load commands & serers into the bot.
function loadCommands() {
	if (bot.commands.length >= 1) {
		bot.commands.deleteAll();
	}
	recursive('/home/pBot/commands/', (err, files) => {
		if (err) console.error(err);

		let jsfiles = files.filter(f => f.split(".").pop() === "js");
		if (jsfiles.length <= 0) {
			console.log("No commands to load.");
			return;
		}
		jsfiles.forEach((f, i) => {
			let props = require(`${f}`);
			bot.commands.set(props.help.name, props);
			if (props.alias !== "") {
				bot.commands.set(props.help.alias, props);
			}
		});

		console.log(`Loaded ${jsfiles.length} commands!`);
	});
}
function loadServers() {
	if (bot.servers.length >= 1) {
		bot.servers.deleteAll();
	}
	fs.readdir('/home/pBot/servers/', (err, files) => {
		if (err) console.error(err);

		let jsfiles = files.filter(f => f.split(".").pop() === "json");
		if (jsfiles.length <= 0) {
			console.log("No servers to load.");
			return;
		}

		const expFile = require(`./_examples/serverexample.json`);
		jsfiles.forEach((f, i) => {
			let props = require(`/home/pBot/servers/${f}`);

			//Checking if the server has the latest configuration file.
			//If not call the extend function to combine the 2 files. Keeping all the data from the old one.
			if (expFile.configVersion != props.configVersion) {
				props = extend({}, expFile, props);
				//Setting the new config version for the file. Otherwise this will be executed on every boot.
				props.configVersion = expFile.configVersion;
				//Write the new file.
				fs.writeFile(`/home/pBot/servers/${f}`, JSON.stringify(props, null, 2), function (err) {
					if (err) return console.error(err);
				});
			}
			bot.servers.set(props.serverid, props);
		});

		console.log(`Loaded ${jsfiles.length} servers!`);
	});
}
loadCommands();
loadServers();
/* END BOT METHODS */

bot.on("ready", async () => {
	console.log (`Bot is ready! ${bot.user.username}`);
	bot.user.setGame(`on ${bot.guilds.size} servers`);

	// Disabled due to Season changes.
	
	// //Auto Update function for PUBG, special function!
	// setInterval(async function() {
	// 	var server  = "118349957114626057";
	// 	var kanaal = "160338178115502080";
	// 	con.query(`SELECT * FROM servers WHERE serverid = "${server}"`, async (err, rows) => {
	// 		if (err) console.error(err);
	// 		var lastRunTime = rows[0]["pubg_massupdate"];
	// 		// The selected timestamp, using a dummy value here.
	// 		var d = new Date(lastRunTime); 
	// 		var ms = d.getTime();
	// 		var n = Date.now();
	// 		var nd = (n - ms);
	// 		//3 minutes
	// 		if (nd >= 21600000) {
	// 			let cmd = await bot.commands.get("pubgmassupdate");
	// 			let guild = await bot.guilds.find("id", server);
	// 			let channel = await guild.channels.find("id", kanaal);
	// 			cmd.cron(bot, guild, channel);

	// 			//Set new update time in DB.
	// 			con.query(`UPDATE servers SET pubg_massupdate = CURRENT_TIMESTAMP WHERE serverid = "${server}"`, (err, rows) => {
	// 				if (err) throw err;
	// 			});
	// 		}
	// 	});
	// }, 900000);

	//Load previous voice channels on bot restart
	bot.servers.forEach(async (server, i) => {
		const streamOptions = { seek: 0, volume: server.voiceControl.volume, passes: 2 };
		if (server.voiceControl.active) {
			await bot.channels.get(server.voiceControl.channel).join()
				.then(connection => {
					if (server.voiceControl.method === "listenmoe") {
						connection.playStream('https://listen.moe/stream', streamOptions);
					} else if (server.voiceControl.method === "youtube" && server.voiceQueue.length >= 1) {
						// console.log(server.voiceQueue[0]);
						const stream = ytdl(server.voiceQueue[0].song.url, {filter: 'audioonly'});
						connection.playStream(stream, streamOptions);
					}
				})
				.catch(`I've ran into an error: ${console.error}`);
		}
	});

	//Youtube Queue check.
	setInterval(async function() {
		bot.servers.forEach(async (server, i) => {
			if (server.voiceControl.active && server.voiceControl.method === "youtube") {
				//Get the voiceChannel
				let connection = await bot.channels.get(server.voiceControl.channel).connection;
				const streamOptions = { seek: 0, volume: server.voiceControl.volume, passes: 2 };
				if (connection && server.voiceQueue.length != 0) {
					connection.dispatcher.on('end', async () => {
						//If not speaking, song is finished.
						if (server.voiceQueue.length > 1) {
							const newsong = server.voiceQueue[1].song.url;
							server.voiceQueue.slice(1);
							fs.writeFile(`/home/pBot/servers/${server.serverid}.json`, JSON.stringify(server, null, 2), function (err) {
								if (err) return console.error(err);
							});
							const stream = ytdl(newsong, {filter: 'audioonly'});
							bot.channels.get(server.voiceControl.channel).connection.playStream(stream, streamOptions);
						}
					});
					
				}
			}
		});
	}, 400);

	//Bot Game State
	var gameState = 0; //Default state
	setInterval(async function() {
		switch(gameState) {
			case 0:
				var pubgusers = 0;
				await con.query(`SELECT count(*) as 'pubg' FROM pubgranks`, (err, rows) => {
					if (err) throw err;
					pubgusers = rows[0]["pubg"];
					bot.user.setGame(`with PUBG stats for ${pubgusers} users.`);
				});
				gameState++;
				break;
			default: 
				gameState = 0;
				bot.user.setGame(`on ${bot.guilds.size} servers`);
				break;
		}
	}, 150000);
});

//When the bot joins a guild.
bot.on("guildCreate", guild => {
	console.log(`I have been added to: ${guild.name} (id: ${guild.id})`);

	//Creating a new JSON for the server
	var examplefile = `/home/pBot/_examples/serverexample.json`;
	var targetfile  = `/home/pBot/servers/${guild.id}.json`;
	var props = require(examplefile);
	props.serverid = guild.id;
	props.ownerid  = guild.ownerID;

	bot.servers.set(guild.id, props);
	fs.writeFile(targetfile, JSON.stringify(props, null, 2), function (err) {
		if (err) return console.error(err);
	});

	//Inserting PUBG files on new guild join.
	var pubgfile = `/home/pBot/_examples/pubgsettingsexample.json`;
	var pubgsett = require(pubgfile);
	fs.writeFile(`/home/pBot/settings/pubg/${guild.id}.json`, JSON.stringify(props, null, 2), function (err) {
		if (err) return console.error(err);
	});

	con.query(`INSERT INTO servers (serverid, ownerid, servername) VALUES ('${guild.id}', '${guild.ownerID}', '${guild.name}')`, (err, rows) => {
		if (err) throw err;
		console.log ("Inserted the new server into the database");
	});
	//Update bot status.
	bot.user.setGame(`on ${bot.guilds.size} servers`);
});

//When the bot leaves a guild.
bot.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  bot.user.setGame(`on ${bot.guilds.size} servers`);
});

//When someone joins a guild.
bot.on('guildMemberAdd', member => {
	let server = bot.servers.get(member.guild.id);
	if (server.welcomeEnabled === "1") {
		const channel = member.guild.channels.find('id', server.welcomeChannel);
		if (!channel) return;
		let message = server.welcomeMessage;

		//Checking if the welcome message contains references
		var memberCheck = '%member%';
		if (message.indexOf(memberCheck)) {
			message = message.replace('%member%', `${member}`);
		}
		var rulesCheck = '%rules%';
		if (message.indexOf(rulesCheck)) {
			message = message.replace('%rules%', `${member.guild.channels.find('id', server.welcomeRulesCh)}`);
		}
		var membercountCheck = "%membercount%";
		if (message.indexOf(membercountCheck)) {
			message = message.replace('%membercount%', `${member.guild.memberCount}`);
		}
		
		channel.send(message);
	}
});

//When someone sends a message.
bot.on("message", async message => {
	if (message.author.bot) return;
	if (message.channel.type === "dm") return;

	let prefix = bot.servers.get(message.guild.id).prefix;
	let messageArray = message.content.split(" ");
	let command = messageArray[0];
	let args = messageArray.slice(1);

	//Prefix checking
	if (!command.startsWith(prefix)) return;
	if (command.slice(prefix.length) === "") {
		message.delete()
				.then(msg => console.log(`Deleted message from ${msg.author}`))
				.catch(console.error);
	} else {
		if (command.slice(prefix.length) === "devcommand" && message.author.id == "120978498956296194") {
			if (args[0] === "reloadCommands") {
				loadCommands();
				message.channel.send(`${message.author}, Reloaded all server commands in the bot.`);
			} else if (args[0] === "reloadServers") {
				loadServers();
				message.channel.send(`${message.author}, Reloaded all servers configuration in the bot`);
			} else {
				message.delete();
			}
		} else {
			let cmd = bot.commands.get(command.slice(prefix.length));
			if (cmd && cmd.help.permission === 'none') cmd.run(bot, message, args);
			else if (message.member.hasPermission(cmd.help.permission)) {
				cmd.run(bot, message, args);
			} else if (message.author.id == "120978498956296194" && bot.servers.get(message.guild.id).overRuleCommands) {
				//Above statements allows the botdev to execute commands on the server, if enabled.
				cmd.run(bot, message, args);
			} else {
				message.delete()
					.then(msg => console.log(`Deleted message from ${msg.author}`))
					.catch(console.error);
			}
		}
	}

});

//Start the bot
bot.login(BotSettings.token); //Discord