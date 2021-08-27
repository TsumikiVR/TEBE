const Discord = require("discord.js")
const moment = require('moment')

module.exports = {
    name: "database",
    description: "Check informations of a specific database",
    category: "developer",
    permission: "developer",
    arguments: "<database>",
    discordPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    aliases: ["data"],
    loader: "external",
    run: (bot, message, args, modules, customFunctions) => {
        const thisCommand = customFunctions.getCommandOrAlias(bot, args[0])
        const database = args[1]
        if(!database) return message.channel.send({embed: {description: `:x: | No database has been provided\n:information_source: Syntax: \`${modules.config.prefix}${thisCommand.name} ${thisCommand.arguments}\`\n:information_source: Available Databases: \`${bot.bootInfo.detailedInformations.databases.length > 0 ? bot.bootInfo.detailedInformations.databases.map(c => c.database).join('`, `') : "❌ No database available"}\``}})
        if(!bot.databases[database.toLowerCase()]) return message.channel.send({embed: {description: ":x: | This database does not exist or hasn't been loaded"}})
        const data = bot.databases[database.toLowerCase()].value()
        const bddScheme = bot.databasesSchemes.get(database.toLowerCase())
        if(!bddScheme.infoData || bddScheme.infoData.length < 1) return message.channel.send({embed: {description: ":x: | No InfoData has been founded"}})
        let embed = new Discord.MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL({dynamic: true}))
        .setTitle(`Informations of Database \`${database.toLowerCase()}\``)
        .setTimestamp()
        .setFooter(`${bot.user.username} v${modules.package.version}`)
        if(bddScheme.type === "id") bddScheme.infoData.forEach(infoScheme => {
            let dataEvalued = data
            if(infoScheme.data) dataEvalued = customFunctions.deepFind(Object.values(dataEvalued), infoScheme.data)
            if(infoScheme.execute) dataEvalued = infoScheme.execute(Object.values(dataEvalued))
            embed.addField(infoScheme.name, dataEvalued, true)
        })
        if(bddScheme.type === "unique") bddScheme.infoData.forEach(infoScheme => {
            let dataEvalued = data
            if(infoScheme.data) dataEvalued = customFunctions.deepFind(dataEvalued, infoScheme.data)
            if(infoScheme.execute) dataEvalued = infoScheme.execute(dataEvalued)
            embed.addField(infoScheme.name, dataEvalued, true)
        })
        message.channel.send(embed)
    }
}