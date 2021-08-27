const Discord = require('discord.js')

module.exports = {
    name: "help",
    description: "Menu d'aide",
    permission: "none",
    category: "bot",
    arguments: "[command]",
    discordPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    loader: "external",
    aliases: ["?", "h"],
    run: (bot, message, args, modules, customFunctions) => {
        let commandArgs = args[1]
        const aliasDetection = bot.commands.filter(c => c.aliases && c.aliases.some(e => e === commandArgs))
        const devCommandCheck = modules.config.developers.some(c => c === message.author.id) ? bot.commands.get(commandArgs) : bot.commands.filter(c => c.category !== "developer").get(commandArgs)
        if(devCommandCheck || aliasDetection.size > 0) {
            let command = bot.commands.get(commandArgs)
            if(aliasDetection.size > 0) command = aliasDetection.first()
            let advencedHelpMenu = new Discord.MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL({dynamic: true}))
            .setTitle(`Advanced help for the command \`${command.name}\``)
            .addField("Name", customFunctions.capitalize(command.name), true)
            .addField("Usage", `\`${modules.config.prefix}${command.name}${command.arguments ? " "+command.arguments : ""}\``, true)
            .addField("Alias", command.aliases ? command.aliases.length > 0 ? command.aliases.map(c => `• \`${modules.config.prefix}${c}\``).join('\n') : "No Alias" : "No Alias", true)
            .addField("Category", customFunctions.capitalize(customFunctions.categoryTranslator(command.category, bot)), true)
            .addField("User Permission", `- ${customFunctions.capitalize(command.permission)}\n❓*See \`${modules.config.prefix}userp ${command.permission}\`*` || "No permission", true)
            .addField("Bot Permissions", command.discordPermissions.length > 0 ? command.discordPermissions.map(c => `> \`${c} [${message.guild.me.permissions.has(c) ? "✅" : "❌"}]\``).join('\n') : "No required permission", true)
            .addField("Description", command.description || "No description")
            .setTimestamp()
            .setFooter(`${bot.user.username} v${modules.package.version}`)
            return message.channel.send(advencedHelpMenu)
        } else {
            let categories = []
            bot.commands.forEach(command => {
                if(!categories.some(c => c === command.category)) categories.push(command.category)
            })
            let helpMenu = new Discord.MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL({dynamic: true}))
            .setDescription(`Kon'nichiwa **__${message.author.username}__**,\nMy name is **${bot.user.username}**, here you can find all commands available at use, have fun !\nℹ️ More help: \`${modules.config.prefix}${bot.commands.get("help").name} <command>\`\nℹ️ Prefix: \`${modules.config.prefix}\` or \`@${bot.user.username}\``)
            .setThumbnail(bot.user.avatarURL({dynamic: true, size: 2048}))
            .setTimestamp()
            .setFooter(`${bot.user.username} v${modules.package.version}`)
            categories.forEach(category => {
                let userPermission = customFunctions.getUserPermission(modules.config, message.member)
                if(userPermission.name !== "developer" && category === "developer") return
                if(category === "developer" && commandArgs !== "--dev") return
                const lastIndex = categories.length-1
                helpMenu.addField(customFunctions.capitalize(customFunctions.categoryTranslator(category, bot)), `\`${bot.commands.filter(c => c.category === category).sort(function (a,b) {if(a<b) return -1;else if(a>b) return 1; return 0;}).map(c => c.name).join('`,`')}\`${lastIndex === categories.indexOf(category) ? `\n\n${modules.config.support ? `📩 If you need more help, click [here](https://discord.gg/${modules.config.support}) to join the support server` : ""}` : ""}`)
            })
            return message.channel.send(helpMenu)
        }
    }
}