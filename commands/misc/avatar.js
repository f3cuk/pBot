module.exports.run = async (bot, message, args) => {
	let msg = await message.channel.send("Generating avatar...");

	let avatar;
	if (args.length <= 0) {
		avatar = message.author;
	} else {
		var check = "<@";
		let user;
		if (!args[0].indexOf(check)) {
			user = args[0].slice(2, -1);
		} else {
			user = args[0];
		}
		console.log(user);
		avatar = await bot.fetchUser(user, true);
	}

	await message.channel.send({files: [
		{
			attachment: avatar.displayAvatarURL,
			name: "avatar.png"
		}
	]});

	msg.delete();
}

module.exports.help = {
	name: "avatar",
	alias: "",
	permission: "none",
	category: "misc",
	helpcommand: false,
	devcommand: false
}