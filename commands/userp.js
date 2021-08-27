const Discord = require('discord.js')

module.exports = {
    name: "userp",
    description: "Show users permissions for Commands",
    category: "bot",
    permission: "none",
    arguments: "[permission]",
    discordPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    aliases: ["up"],
    loader: "external",
    run: (bot, message, args, modules, customFunctions) => {
        let permChoosed = args[1]
        let autoriseDevPerm = false
        let userPermission = modules.config.permissions.filter(c => c.permissions.some(e => message.member.permissions.has(e))).length > 0 ? modules.config.permissions.filter(c => c.permissions.some(e => message.member.permissions.has(e)))[0] : modules.config.permissions[modules.config.permissions.length-1]
        if(modules.config.developers.some(c => c === message.author.id)) userPermission = modules.config.permissions.filter(c => c.developer === true).length > 0 ? modules.config.permissions.filter(c => c.developer === true)[0] : {name: "developer", permissions: [], developer: true}
        if(permChoosed && modules.config.permissions.some(c => c.name === permChoosed.toLowerCase())) {
            permChoosed = modules.config.permissions.filter(c => c.name === permChoosed.toLowerCase())[0]
            let userpEmbed = new Discord.MessageEmbed()
            .setTitle(`Permission \`${customFunctions.capitalize(permChoosed.name)}\`${userPermission === permChoosed ? " (**Actual**)" : ""}`)
            .setDescription(`__Permissions:__\n${permChoosed.permissions.length > 0 ? permChoosed.permissions.map(c => `> \`${c} [${message.member.permissions.has(c) ? "✅": "❌"}]\``) : "> No permissions required"}${permChoosed.developer === true ? "\n*\`❗ Developer permissions\`*" : ""}`)
            .setTimestamp()
            .setFooter(`${bot.user.username} v${modules.package.version}`)
            message.channel.send(userpEmbed)
        } else {
            if(permChoosed === "--dev" && userPermission.developer === true) autoriseDevPerm = true 
            let userpEmbed = new Discord.MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL({dynamic: true}))
            .setTitle(`List of User Permissions (for ${bot.user.username}'s Commands)`)
            .setDescription(`:warning: *Remember that \`(Actual)\` is the highest permission you got, if there's a permission where there's one missing, you don't have it\n- You need all permissions listed to get the access to this permission*`)
            .setTimestamp()
            .setFooter(`${bot.user.username} v${modules.package.version}`)
            modules.config.permissions.forEach(perm => {
                if(perm.developer === true && autoriseDevPerm === false) return
                userpEmbed.addField(`${customFunctions.permissionTranslator(perm.name)}${userPermission === perm ? " (**Actual**)" : ""}`, `__Permissions:__\n${perm.permissions.length > 0 ? perm.permissions.map(c => `> \`${c} [${message.member.permissions.has(c) ? "✅": "❌"}]\``) : "> No permissions required"}${perm.developer === true ? "\n*\`❗ Developer permissions\`*" : ""}`, true)
            })
            message.channel.send(userpEmbed)
        }
    }
}