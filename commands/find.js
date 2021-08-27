const Discord = require("discord.js")
const moment = require('moment')

module.exports = {
    name: "find",
    description: "Find a user/server data in a specific database",
    category: "developer",
    permission: "developer",
    arguments: "<database> [id/name]",
    discordPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    aliases: [],
    loader: "external",
    run: (bot, message, args, modules, customFunctions) => {
        const thisCommand = customFunctions.getCommandOrAlias(bot, args[0])
        const database = args[1]
        const idOrName = args[2]
        if(!database) return message.channel.send({embed: {description: `:x: | No database has been provided\n:information_source: Syntax: \`${modules.config.prefix}${thisCommand.name} ${thisCommand.arguments}\`\n:information_source: Available Databases: \`${bot.bootInfo.detailedInformations.databases.length > 0 ? bot.bootInfo.detailedInformations.databases.map(c => c.database).join('`, `') : "❌ No database available"}\``}})
        if(!bot.databases[database.toLowerCase()]) return message.channel.send({embed: {description: ":x: | This database does not exist or hasn't been loaded"}})
        const data = bot.databases[database.toLowerCase()].value()
        const bddScheme = bot.databasesSchemes.get(database.toLowerCase())
        if(!idOrName && bddScheme.type === "id") return message.channel.send({embed: {description: `:x: | No ID/Name has been provided\n:information_source: Syntax: \`${modules.config.prefix}${thisCommand.name} ${thisCommand.arguments}\``}})
        if(!data[idOrName] && bddScheme.type === "id") return message.channel.send({embed: {description: `:x: | No data has been founded in \`${database}\` database`}})
        const dataFounded = idOrName ? data[idOrName] : data
        const formatOfData = Object.keys(bddScheme.data)
        const formatOfDataFounded = Object.keys(dataFounded)
        const embed = new Discord.MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL({dynamic: true}))
        .setDescription(`A data has been founded in \`${database}\` database.${dataFounded.dataCreation ? `\nData Saving started the **${moment(dataFounded.dataCreation).format("L [**at**] LTS")}**` : ""}\n\`\`\`json\n${require('util').inspect(dataFounded).substring(0, 1000)}\`\`\`${idOrName && bddScheme.type !== "unique" ? formatOfData.match(formatOfDataFounded) ? "" : ":warning: *Format of Data does not match with his Scheme*" : ""}`)
        .setTimestamp()
        .setFooter(`${bot.user.username} v${modules.package.version}`)
        message.channel.send(embed)
    }
}

Array.prototype.match = function (arr2) {
    let amount = 0
	this.forEach(c => {
        arr2.forEach(e => {
            if(e === c) amount++ 
        })
    });
    if(amount === arr2.length && amount === this.length) return true
	else return false;
}