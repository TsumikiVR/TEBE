const Discord = require("discord.js")
const moment = require('moment')

module.exports = {
    name: "fix",
    description: "Fix a user/server data in a specific database with his Scheme",
    category: "developer",
    permission: "developer",
    arguments: "<database> [id/name]",
    discordPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    aliases: [],
    loader: "external",
    run: async (bot, message, args, modules, customFunctions) => {
        const thisCommand = customFunctions.getCommandOrAlias(bot, args[0])
        const database = args[1]
        const idOrName = args[2]
        if(!database) return message.channel.send({embed: {description: `:x: | No database has been provided\n:information_source: Syntax: \`${modules.config.prefix}${thisCommand.name} ${thisCommand.arguments}\`\n:information_source: Available Databases: \`${bot.bootInfo.detailedInformations.databases.length > 0 ? bot.bootInfo.detailedInformations.databases.map(c => c.database).join('`, `') : "❌ No database available"}\``}})
        if(!bot.databases[database.toLowerCase()]) return message.channel.send({embed: {description: ":x: | This database does not exist or hasn't been loaded"}})
        const data = bot.databases[database.toLowerCase()].value()
        const bddScheme = bot.databasesSchemes.get(database.toLowerCase())
        if(!idOrName && bddScheme.type === "id") return message.channel.send({embed: {description: `:x: | No ID/Name has been provided\n:information_source: Syntax: \`${modules.config.prefix}${thisCommand.name} ${thisCommand.arguments}\``}})
        if(!data[idOrName] && bddScheme.type === "id") return message.channel.send({embed: {description: `:x: | No data has been founded in \`${database}\` database`}})
        const schemeOfDatabase = bddScheme.data
        const dataFounded = idOrName ? data[idOrName] : data
        const formatOfData = Object.keys(schemeOfDatabase)
        const formatOfDataFounded = Object.keys(dataFounded)
        if(formatOfData.match(formatOfDataFounded)) return message.channel.send({embed: {description: ":x: | This data does not require a fix"}})
        else {
            let newKeys = []
            for (var i = 0; i < formatOfData.length; i++) {
                if(formatOfData[i] !== formatOfDataFounded[i] && !dataFounded[formatOfData[i]]) {
                    if(idOrName) await bot.databases[database.toLowerCase()].get(idOrName).assign({[formatOfData[i]]: schemeOfDatabase[formatOfData[i]]}).write()
                    else await bot.databases[database.toLowerCase()].assign({[formatOfData[i]]: schemeOfDatabase[formatOfData[i]]}).write()
                    newKeys.push(formatOfData[i])
                }
            }
            message.channel.send({embed: {description: `:white_check_mark: | Data ${idOrName ? `of \`${idOrName}\`` : ""} in \`${database}\` is now fixed and match with his Scheme\n:information_source: New Keys of Data: \`${newKeys.map(c => c).join('`, `')}\``}})
        }
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