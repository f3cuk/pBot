module.exports.run = async (bot, message, args) => {
	// This command removes all messages from all users in the channel, up to 100.
    
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    
    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
}

module.exports.commandinfo = async (bot, message, args) => {
  let prefix = bot.servers.get(message.guild.id).prefix;
  var embed = {
    embed: {
			"title": "Help command for purge",
			"description": "Used for deleting up to 100 messages at once.",
			"fields": [{
				"name": "Usage: " + prefix + "purge <amount>",
				"value": "Insert the amount of messages you want to remove. For example using " + prefix + "purge 10, will remove the 9 messages above + your purge command.",
				"inline": false
			}],
			"color": 3485
		}
  }
  return embed;
}

module.exports.help = {
	name: "purge",
	alias: "",
	permission: "MANAGE_MESSAGES",
	category: "utils",
	helpcommand: true,
	devcommand: false
}