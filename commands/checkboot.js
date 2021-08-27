const Discord = require('discord.js')

module.exports = {
    name: "checkboot",
    description: "Check the boot of the bot and her files",
    category: "developer",
    permission: "developer",
    arguments: "",
    discordPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    aliases: ["checkb"],
    loader: "external",
    run: (bot, message, args, modules, customFunctions) => {
        const bootEmbed = new Discord.MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL({dynamic: true}))
        .addField("Commands Loader", bot.bootInfo.detailedInformations.commands.length > 0 ? bot.bootInfo.detailedInformations.commands.length <= 10 ? bot.bootInfo.detailedInformations.commands.map(log => {
            let loaded = log.loaded ? ":white_check_mark:" : ":x:"
            if(log.loaded === "warning") loaded = "⚠️"
            return `${loaded} | \`${log.command}\` -> \`${log.time}ms\`${log.internal ? " [INTERNAL]" : ""}${log.missingParameters.length > 0 ? "\n\t=> [`"+log.missingParameters.map(c => c).join('`,`')+"`]" : ""}`
        }).join('\n') : ":warning: *Only important logs (too much commands)*\n"+bot.bootInfo.detailedInformations.commands.filter(c => c.loaded !== true || c.time >= 100).map(log => {
            let loaded = log.loaded ? ":white_check_mark:" : ":x:"
            if(log.loaded === "warning") loaded = "⚠️"
            return `${loaded} | \`${log.command}\` -> \`${log.time}ms\`${log.internal ? " [INTERNAL]" : ""}${log.missingParameters.length > 0 ? "\n\t=> [`"+log.missingParameters.map(c => c).join('`,`')+"`]" : ""}`
        }).join('\n') : "📂 | No commands available", true)
        .addField("Events Loader", bot.bootInfo.detailedInformations.events.length > 0 ? bot.bootInfo.detailedInformations.events.map(log => {
            let loaded = log.loaded ? ":white_check_mark:" : ":x:"
            if(log.loaded === "warning") loaded = "⚠️"
            return `${loaded} | \`${log.event}\` -> \`${log.time}ms\`${log.missingParameters.length > 0 ? "\n\t=> [`"+log.missingParameters.map(c => c).join('`,`')+"`]" : ""}`
        }) : "📂 | No events available", true)
        .addField("DatabasesSchemes Loader", bot.bootInfo.detailedInformations.databasesSchemes.length > 0 ? bot.bootInfo.detailedInformations.databasesSchemes.map(log => {
            let loaded = log.loaded ? ":white_check_mark:" : ":x:"
            if(log.loaded === "warning") loaded = "⚠️"
            return `${loaded} | \`${log.databaseScheme}\` -> \`${log.time}ms\`${log.missingParameters.length > 0 ? "\n\t=> [`"+log.missingParameters.map(c => c).join('`,`')+"`]" : ""}`
        }) : "📂 | No databasesSchemes available", true)
        .addField("Databases Loader", bot.bootInfo.detailedInformations.databases.length > 0 ? bot.bootInfo.detailedInformations.databases.map(log => {
            let loaded = log.loaded ? ":white_check_mark:" : ":x:"
            if(log.loaded === "warning") loaded = "⚠️"
            return `${loaded} | \`${log.database}\` -> \`${log.time}ms\`${log.missingParameters.length > 0 ? "\n\t=> [`"+log.missingParameters.map(c => c).join('`,`')+"`]" : ""}`
        }) : "📂 | No databases available", true)
        .addField("Loader Summary", `✅ | Commands [\`${bot.commands.size}\`/**${bot.bootInfo.commands}**]\n✅ | Events [\`${bot.events.size}\`/**${bot.bootInfo.events}**]\n✅ | DatabasesSchemes [\`${bot.databasesSchemes.size}\`/**${bot.bootInfo.databasesSchemes}**]\n✅ | Databases [\`${Object.keys(bot.databases).length}\`/**${bot.bootInfo.databases}**]`, true)
        message.channel.send(bootEmbed)
    }
}