const fs = require('fs')
const config = require('../config.json')
const chalk = require('chalk')
const commandsPath = `./${config.boot.commands}`
const commandsRequiredPath = `../${config.boot.commands}`

module.exports = {
    name: "command",
    description: "Commands Editor Menu",
    category: "developer",
    permission: "developer",
    arguments: "<reload|delete> <command>",
    discordPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    aliases: ["c"],
    loader: "external",
    run: (bot, message, args, modules, customFunctions) => {
        const thisCommand = customFunctions.getCommandOrAlias(bot, args[0])
        const option = args[1]
        if(option === "reload" || option === "r") {
            if(!args[2]) return message.channel.send({embed: {description: ":x: | No command has been selected"}})
            const command = customFunctions.getCommandOrAlias(bot, args[2]) || args[2]
            const commandPath = `./${modules.config.boot.commands}/${command.name ? command.name : command}.js`
            if(!fs.existsSync(commandPath)) return message.channel.send({embed: {description: ":x: | This command does not exist"}})
            delete require.cache[require.resolve("."+commandPath)]
            try {
                const newCommand = require("."+commandPath);
                bot.commands.set(newCommand.name, newCommand);
                message.channel.send({embed: {description: `:white_check_mark: | Command \`${command.name}\` successfully reloaded`}})
            } catch (error) {
                console.error(error);
                message.channel.send({embed: {description: `:warning: | An error occured during \`${command.name ? command.name : command}\` reloading :\n\`\`\`${error.message}\`\`\``}});
            }    
        } else if(option === "delete" || option === "d") {
            if(!args[2]) return message.channel.send({embed: {description: ":x: | No command has been selected"}})
            const command = customFunctions.getCommandOrAlias(bot, args[2])
            if(!command) return message.channel.send({embed: {description: ":x: | This command does not exist"}})
            try {
                bot.commands.delete(command.name);
                message.channel.send({embed: {description: `:white_check_mark: | Command \`${command.name}\` successfully unloaded`}})
            } catch (error) {
                console.error(error);
                message.channel.send({embed: {description: `:warning: | An error occured during \`${command.name ? command.name : command}\` unloading :\n\`\`\`${error.message}\`\`\``}});
            }
        } else if(option === "load" || option === "l") {
            if(!args[2]) return message.channel.send({embed: {description: ":x: | No command has been selected"}})
            const command = args[2].toLowerCase() || args[2]
            if(customFunctions.getCommandOrAlias(bot, command)) return message.channel.send({embed: {description: ":x: | This command is already loaded"}})
            try {
                if(fs.existsSync(commandsPath)) {
                    let time = 0
                    let commandsDir = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))
                    const commandsFiltered = commandsDir.filter(c => c.slice(0, -3) === command)
                    if(commandsFiltered.length < 1) return message.channel.send({embed: {description: `:x: | The searched command does not exist`}})
                    const file = commandsFiltered[0]
                    const fileModified = commandsFiltered[0].slice(0, -3)
                    time = Date.now()
                    let missingParameters = [];
                    if(!require(`${commandsRequiredPath}/${file}`)) return;
                    const commandRequired = require(`${commandsRequiredPath}/${file}`)
                    config.loader.commands.critical.forEach(e => {
                      if(typeof commandRequired[e] === "undefined") missingParameters.push(e)
                    })
                    config.loader.commands.warning.forEach(e => {
                      if(typeof commandRequired[e] === "undefined") missingParameters.push(e)
                    })
                    if(!commandRequired.run && commandRequired.loader !== "internal") {
                        message.channel.send({embed: {description: `:x: | ${fileModified} run could not be found`}})
                        return console.error(`❌ | ${chalk.redBright(fileModified)} run could not be found`)
                    }
                    bot.commands.set(fileModified, commandRequired)
                    if(config.loader.commands.warning.some(e => missingParameters.some(e_ => e === e_))) {
                        message.channel.send({embed: {description: `⚠️ | ${fileModified} is missing some parameters but has been loaded ─ [${missingParameters.map(e => `${e}`).join(', ')}] ─ [${Date.now()-time}ms]`}})
                        return console.warn(`⚠️ | ${chalk.yellowBright(fileModified)} is missing some parameters but has been ${chalk.greenBright("loaded")} ─ [${missingParameters.map(e => `${chalk.red(e)}`).join(', ')}] ─ [${chalk.bold(Date.now()-time)}ms]`)
                    }
                    console.log(`✅ | ${chalk.green(fileModified)} has been ${chalk.green("loaded")}${commandRequired.loader === "internal" ? " internally" : ""} ─ [${chalk.bold(Date.now()-time)}ms]`)
                    message.channel.send({embed: {description: `:white_check_mark: | Command \`${commandRequired.name}\` has been loaded${commandRequired.loader === "internal" ? " internally" : ""} ─ [${Date.now()-time}ms]`}})
                }
            } catch (error) {
                console.error(error);
                message.channel.send({embed: {description: `:warning: | An error occured during \`${command.name ? command.name : command}\` loading :\n\`\`\`${error.message}\`\`\``}});
            }
        } else return message.channel.send({embed: {description: `:x: | No \`option\` has been provised\n:information_source: Syntax: \`${modules.config.prefix}${thisCommand.name} ${thisCommand.arguments}\`\n:information_source: Options:\n> ● \`reload\` : Reload a command\n> ● \`delete\` : Unload a command\n> ● \`load\` : Load a command`}})
    }
}