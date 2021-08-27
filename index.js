// Clear Logs Informations on Launch
console.clear()

// TEBE Watermark
const TEBE = require('./package-tebe.json')
console.log(`Launched through ${TEBE.name} v${TEBE.version} by ${TEBE.author.name}`)

// Contants Initialisation
const Discord = require('discord.js')
const bot = new Discord.Client()
bot.commands = new Discord.Collection()
bot.events = new Discord.Collection()
bot.databases = {}
bot.projectStarted = Date.now()
bot.databasesSchemes = new Discord.Collection()
bot.bootInfo = {
    commands: 0,
    events: 0,
    databasesSchemes: 0,
    databases: 0,
    detailedInformations: {
        commands: [],
        events: [],
        databasesSchemes: [],
        databases: []
    }
}
const dotenv = require('dotenv').config()
const chalk = require('chalk')
const rgb2hex = require('rgb2hex')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const config = require('./config.json')
const package = require('./package.json')
const prefix = config.prefix
const fs = require('fs')
const snekfetch = require('snekfetch')
const discordButtons = require('discord-buttons')
discordButtons(bot)
const moment = require('moment')
moment.locale("en")
const m = require('moment-duration-format')
let adapters = {}
let errors = {
    error: null,
    logs: []
}

// Creation of "modules" transport
const modules = {
    config: config,
    package: package,
    buttons: discordButtons
}

// Config check required values 
config.required.config.forEach(c => {
    if(!config[c] || config[c].length < 1) {
        errors.error = "require",
        errors.logs.push(`[${chalk.cyan("CONFIG")}] Missing Config [${chalk.redBright(c)}]`)
    }
})

// Commands Loader
const commandsPath = `./${config.boot.commands}`
console.log("《=====● Commands Loader ●=====》")
if(fs.existsSync(commandsPath)) {
    let time = 0
    let commandsDirChecker = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))
    if(commandsDirChecker.length === 0) console.log("📂 | No commands available")
    bot.bootInfo.commands = commandsDirChecker.length
    commandsDirChecker.forEach(file => {
        time = Date.now()
        const fileModified = file.slice(0, -3)
        let missingParameters = [];
        if(!require(`${commandsPath}/${file}`)) return;
        const command = require(`${commandsPath}/${file}`)
        config.loader.commands.critical.forEach(e => {
          if(typeof command[e] === "undefined") missingParameters.push(e)
        })
        config.loader.commands.warning.forEach(e => {
          if(typeof command[e] === "undefined") missingParameters.push(e)
        })
        if(missingParameters.length > 0) {
            if(config.loader.commands.critical.some(e => missingParameters.some(e_ => e === e_)) && command.loader !== "internal") {
                bot.bootInfo.detailedInformations.commands.push({
                    loaded: false,
                    time: 0, 
                    command: fileModified, 
                    missingParameters: missingParameters, 
                    internal: false,
                })
                return console.error(`❌ | ${chalk.redBright(fileModified)} is missing some important parameters ─ [${missingParameters.map(e => `${chalk.red(e)}`).join(', ')}]`)
            }
        }
        if(!command.run && command.loader !== "internal") return console.error(`❌ | ${chalk.redBright(fileModified)} run could not be found`)
        bot.commands.set(fileModified, command)
        if(config.loader.commands.warning.some(e => missingParameters.some(e_ => e === e_))) return console.warn(`⚠️ | ${chalk.yellowBright(fileModified)} is missing some parameters but has been ${chalk.greenBright("loaded")} ─ [${missingParameters.map(e => `${chalk.red(e)}`).join(', ')}] ─ [${chalk.bold(Date.now()-time)}ms]`)
        console.log(`✅ | ${chalk.green(fileModified)} has been ${chalk.green("loaded")}${command.loader === "internal" ? ` ${chalk.magentaBright.bold("internally")}` : ""} ─ [${chalk.bold(Date.now()-time)}ms]`)
        bot.bootInfo.detailedInformations.commands.push({
            loaded: missingParameters.length > 0 ? "warning" : true,
            time: Date.now()-time, 
            command: fileModified, 
            missingParameters: missingParameters, 
            internal: command.loader === "internal" ? true : false,
        })
        if(commandsDirChecker.indexOf(file) === (commandsDirChecker.length-1)) {
            config.required.commands.forEach(c => {
                if(!bot.commands.get(c)) {
                    errors.error = "require",
                    errors.logs.push(`[${chalk.cyan("COMMANDS")}] Missing Command [${chalk.redBright(c)}]`)
                }
            })
        } 
    })
} else console.log(`🔍 | ${chalk.blueBright.bold("Command")} Folder not found, please check config.boot or Folder name`)

// Events Loader & Executer
const eventsPath = `./${config.boot.events}`
bot.removeAllListeners()
console.log("《=====● Events Loader ●=====》")
if(fs.existsSync(eventsPath)) {
    let time = 0
    const eventsDirChecker = fs.readdirSync(eventsPath).filter(c => c.endsWith(".js"))
    if(eventsDirChecker.length === 0) console.log("📂 | No events available")
    bot.bootInfo.events = eventsDirChecker.length
    eventsDirChecker.forEach(file => {
        time = Date.now()
        const fileModified = file.slice(0, -3)
        if(!require(`${eventsPath}/${file}`)) return
        let missingParameters = []
        config.loader.events.critical.forEach(e => {
            if(typeof require(`${eventsPath}/${file}`)[e] === "undefined") missingParameters.push(e)
        })
        if(missingParameters.length > 0) {
            if(config.loader.events.critical.some(e => missingParameters.some(e_ => e === e_))) {
                bot.bootInfo.detailedInformations.events.push({
                    loaded: false,
                    time: 0, 
                    event: fileModified, 
                    missingParameters: missingParameters
                })
                return console.error(`❌ | ${chalk.redBright(fileModified)} is missing some important parameters ─ [${missingParameters.map(e => `${chalk.red(e)}`).join(', ')}]`)
            }
        }
        const event = require(`${eventsPath}/${file}`)
        if(!event.run) return console.error(`❌ | ${chalk.redBright(fileModified)} run could not be found`)
        bot.events.set(fileModified, event)
        bot.on(event.event, e => event.run(bot, e, modules, customFunctions))
        console.log(`✅ | ${chalk.green(fileModified)} has been ${chalk.green("loaded")} ─ [${chalk.bold(Date.now()-time)}ms]`)
        bot.bootInfo.detailedInformations.events.push({
            loaded: missingParameters.length > 0 ? "warning" : true,
            time: Date.now()-time, 
            event: fileModified, 
            missingParameters: missingParameters
        })
        if(eventsDirChecker.indexOf(file) === (eventsDirChecker.length-1)) {
            config.required.events.forEach(c => {
                if(!bot.events.get(c)) {
                    errors.error = "require",
                    errors.logs.push(`[${chalk.cyan("EVENTS")}] Missing Event [${chalk.redBright(c)}]`)
                }
            })
        } 
    })
} else console.log(`🔍 | ${chalk.blueBright.bold("Event")} Folder not found, please check config.boot or Folder name`)

// DatabasesSchemes Loader
const databasesSchemesPath = `./${config.boot.databasesSchemes}`
console.log("《=====● DatabasesSchemes Loader ●=====》")
if(fs.existsSync(databasesSchemesPath)) {
    let time = 0
    const databasesSchemesDirChecker = fs.readdirSync(databasesSchemesPath).filter(c => c.endsWith(".js"))
    if(databasesSchemesDirChecker.length === 0) console.log("📂 | No databasesSchemes available")
    bot.bootInfo.databasesSchemes = databasesSchemesDirChecker.length
    databasesSchemesDirChecker.forEach(file => {
        time = Date.now()
        const fileModified = file.slice(0, -3)
        if(!require(`${databasesSchemesPath}/${file}`)) return
        let missingParameters = []
        config.loader.databasesSchemes.critical.forEach(e => {
            if(typeof require(`${databasesSchemesPath}/${file}`)[e] === "undefined") missingParameters.push(e)
        })
        if(missingParameters.length > 0) {
            if(config.loader.databasesSchemes.critical.some(e => missingParameters.some(e_ => e === e_))) {
                bot.bootInfo.detailedInformations.databasesSchemes.push({
                    loaded: false,
                    time: 0, 
                    databaseScheme: fileModified, 
                    missingParameters: missingParameters
                })
                return console.error(`❌ | ${chalk.redBright(fileModified)} is missing some important parameters ─ [${missingParameters.map(e => `${chalk.red(e)}`).join(', ')}]`)
            }
        }
        const databaseFinded = require(`${databasesSchemesPath}/${file}`)
        if(!databaseFinded.data) return console.error(`❌ | ${chalk.redBright(fileModified)} data could not be found`)
        bot.databasesSchemes.set(fileModified, databaseFinded)
        console.log(`✅ | ${chalk.green(fileModified)} has been ${chalk.green("loaded")} ─ [${chalk.bold(Date.now()-time)}ms]`)
        bot.bootInfo.detailedInformations.databasesSchemes.push({
            loaded: missingParameters.length > 0 ? "warning" : true,
            time: Date.now()-time, 
            databaseScheme: fileModified, 
            missingParameters: missingParameters
        })
    })
} else console.log(`🔍 | ${chalk.blueBright.bold("Databases Schemes")} Folder not found, please check config.boot or Folder name`)

// Databases Loader
const databasesPath = `./${config.boot.databases}`
console.log("《=====● Databases Loader ●=====》")
if(fs.existsSync(databasesPath) && fs.existsSync(databasesSchemesPath)) {
    let time = 0
    const databasesSchemesDirChecker = fs.readdirSync(databasesSchemesPath).filter(c => c.endsWith(".js"))
    if(databasesSchemesDirChecker.length === 0) console.log("📂 | No databases available")
    databasesSchemesDirChecker.forEach(file => {
        file = `${file}on`
        time = Date.now()
        const fileModified = file.slice(0, -5)
        if(!fs.existsSync(`${databasesPath}/${file}`)) console.log(`⚠️ | ${chalk.yellowBright(`${chalk.bold(fileModified)} has been created because of the presence of his scheme`)}`)
        adapters[fileModified] = new FileSync(`${databasesPath}/${file}`)
        bot.databases[fileModified] = low(adapters[fileModified])
        console.log(`✅ | ${chalk.green(fileModified)} has been ${chalk.green("loaded")} ─ [${chalk.bold(Date.now()-time)}ms]`)
        bot.bootInfo.detailedInformations.databases.push({
            loaded: true,
            time: Date.now()-time, 
            database: fileModified, 
            missingParameters: []
        })
        if(databasesSchemesDirChecker.indexOf(file.slice(0, -2)) === (databasesSchemesDirChecker.length-1)) bot.bootInfo.databases = fs.readdirSync(databasesPath).filter(c => c.endsWith(".json")).length
    })
} else console.log(`🔍 | ${chalk.blueBright.bold("Databases")} Folder not found, please check config.boot or Folder name`)

// Emergency Process Kill for missing required values
if(errors.error) {
    console.log("\n《=====● Error Information ●=====》")
    console.log(`❌ | Bot Stopped Loading ! Error of type "${errors.error}"`)
    console.log(errors.logs.map(c => `➡️ | ${c}`).join('\n'))
    return process.exit()
}

// Commands Executer
bot.on("message", message => {

    if(bot.guilds.cache.some(c => c.id === message.content)) return message.channel.send({embed: {description: bot.guilds.cache.get(message.content).me.permissions.has("SEND_MESSAGES") ? `:white_check_mark: | I am allowed to send messages ${bot.guilds.cache.get(message.content).me.permissions.has("VIEW_CHANNEL") ? "and view channels" : ""}`: "I am not allowed to send messages"}})
    
    if(!message.guild) return console.log(`[DM][RECEPTION] ${message.author.tag} (${message.author.id}) sended ${message.content}`)
    if(message.author.bot) return;
    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    if((message.content.startsWith(`<@!${bot.user.id}>`) || message.content.startsWith(`<@${bot.user.id}>`)) && args.length > 1) args.shift()
    let command = args[0].toLowerCase() || args[0]
    const aliasDetection = bot.commands.filter(c => c.aliases && c.aliases.some(c => c === command))
    if(message.mentions.users.size > 0 && message.mentions.users.first().id === bot.user.id && (message.content.startsWith(`<@${bot.user.id}>`) || message.content.startsWith(`<@!${bot.user.id}>`))) message.mentions.users.delete(bot.user.id.toString())
    if(message.mentions.members.size > 0 && message.mentions.members.first().user.id === bot.user.id && (message.content.startsWith(`<@${bot.user.id}>`) || message.content.startsWith(`<@!${bot.user.id}>`))) message.mentions.members.delete(bot.user.id.toString())

    if(message.content === `<@${bot.user.id}>` || message.content === `<@!${bot.user.id}>`) return bot.commands.get("help").run(bot, message, args, modules, customFunctions)
  
    if(bot.commands.get(command) || aliasDetection.size > 0) {
        if(!message.content.startsWith(prefix) && !message.content.startsWith(`<@${bot.user.id}>`) && !message.content.startsWith(`<@!${bot.user.id}>`)) return
        let commandFinded = bot.commands.get(command)
        if(aliasDetection.size > 0) commandFinded = aliasDetection.first()
        if(commandFinded.permission !== "developer") console.log(`[COMMAND][USAGE] ${message.author.tag} (${message.author.id}) used ${commandFinded.name} [G: ${message.guild.id} | C: ${message.channel.id} | M: ${message.id}]`)
        const commandPermission = config.permissions.filter(c => c.name === commandFinded.permission).length > 0 ? config.permissions.filter(c => c.name === commandFinded.permission)[0] : config.permissions[config.permissions.length-1]
        let userPermission = config.permissions.filter(c => c.permissions.some(e => message.member.permissions.has(e))).length > 0 ? config.permissions.filter(c => c.permissions.some(e => message.member.permissions.has(e)))[0] : config.permissions[config.permissions.length-1]
        if(config.developers.some(c => c === message.author.id)) userPermission = config.permissions.filter(c => c.developer === true).length > 0 ? config.permissions.filter(c => c.developer === true)[0] : {name: "developer", permissions: [], developer: true}
        if(commandFinded.permission === "developer" && !config.developers.some(c => c === message.author.id)) return;
        if(!commandPermission.permissions.some(c => message.member.permissions.has(c)) && (config.permissions.indexOf(userPermission) <= config.permissions.indexOf(commandPermission)) === false) return message.channel.send({embed: {description: `:x: You do not have the necessary permissions to use this command.\nYou need the permission \`${customFunctions.permissionTranslator(commandPermission.name)}\``}})
        if(commandFinded.discordPermissions.some(c => !message.guild.me.permissions.has(c))) {
            const necessPermMsg = `:x: | I cannot use {{command}}, some necessary permissions are missing\n:information_source: Please allow me those permisions :\n${commandFinded.discordPermissions.filter(c => !message.guild.me.permissions.has(c)).map(c => `> - \`${c}\``).join('\n')}`
            return message.channel.send({embed: {description: necessPermMsg.replace("{{command}}", "this command")}}).catch(err => {
                message.author.send({embed: {description: necessPermMsg.replace("{{command}}", `\`${commandFinded.name}\``)}}).catch(err => {if(err) return})
            })
        }
        if(commandFinded.loader !== "internal") {
            try {commandFinded.run(bot, message, args, modules, customFunctions)}
            catch(e) {
              console.log(e)
              message.channel.send({embed: {description: `:warning: | An error occured while using \`${command}\`, please try again later.`}})
              const errorLog = new Discord.MessageEmbed()   // Detailed Error Sender
              .setAuthor(message.author.username, message.author.avatarURL({dynamic: true}))
              .setTitle("🚫 A user encountered an Error")
              .setDescription(`**${message.author.tag}** encountered an error the **${moment(Date.now()).format("L [**at**] LTS")}**`)
              .addField("Error", `Command: \`${commandFinded.name}\`
              File: ${e.fileName ? `\`${e.fileName}\`` : `:x: *Unable to find the responsible file for the error*`}
              Position: ${e.lineNumber && e.columnNumber ? `[\`${e.lineNumber || "N/A"}\`:\`${e.columnNumber || "N/A"}\`]` : `:x: *Unable to find the responsible line for the error*`}
              Message: \`\`\`${e.message.substring(0, 200)}\`\`\`${e.stack ? `Stack: \`\`\`${e.stack.length > 699 ? e.stack.substring(0, 700)+"..." : e.stack}\`\`\`` : ""}`)
              .addField("Location", `Guild: ${message.guild.name} [**${message.guild.members.cache.size}**] (\`${message.guild.id}\`)
              Channel: #${message.channel.name} (\`${message.channel.id}\`)
              Message: \`${message.content.substring(0, 800)}\`
              Link: [access](https://discord.com/channels/${message.guild.id}/${message.channel.id})`)
              .setTimestamp()
              if(modules.config.importantID.sp_server && modules.config.importantID.errors) bot.guilds.cache.get(modules.config.importantID.sp_server).channels.cache.get(modules.config.importantID.errors).send(errorLog)
            }
        } else {
            if(command === "eval") {
                let code = args.join(" ").slice(5);
                if(!code) return message.channel.send("Tu n'as pas précisé de code !")
                try {
                    let evaled = eval(code);
                    if(typeof evaled !== "string") evaled = require('util').inspect(evaled);
                    message.channel.send(evaled, {code: "yaml"})
                } catch (err) {
                    message.channel.send(`\`ERREUR\` \`\`\`xl\n${err}\n\`\`\``);
                    console.log(err)
                }
            }
        }
    }
})

// CustomFunctions
const customFunctions = {
    capitalize: (s) => {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    },
    categoryTranslator: (category, bot) => {
        if(!category) return null
        if(category === "bot") return bot.user.username
        if(category === "developer") return "Développeur"
        return category
    },
    createDatabase: (type, id) => {
        if(!type) throw "Missing Database Type"
        if(bot.databasesSchemes.get(type)) {
            const scheme = bot.databasesSchemes.get(type)
            if(scheme.type === "id") {
                if(!id) throw "Missing ID"
                if(!bot.databases[type].get(id).value()) {
                    bot.databases[type].assign({[id]: scheme.data}).write()
                }
            } else if(scheme.type === "unique") {
                if(typeof bot.databases[type].get(scheme.checker).value() == "undefined") bot.databases[type].assign(scheme.data).write()
            }
        } else throw `Database Type ${type} don't exist`
    },
    getCommandOrAlias: (bot, command) => {
        return bot.commands.filter(c => c.name === command || c.aliases.some(e => e === command)).first() || null
    },
    getUserPermission: (config, member) => {
        if(!config) throw "[GetUserPermission] Missing Config"
        if(!member) throw "[GetUserPermission] Missing Member"
        let userPermission = config.permissions.filter(c => c.permissions.some(e => member.permissions.has(e))).length > 0 ? config.permissions.filter(c => c.permissions.some(e => member.permissions.has(e)))[0] : config.permissions[config.permissions.length-1]
        if(config.developers.some(c => c === member.user.id)) userPermission = config.permissions.filter(c => c.developer === true).length > 0 ? config.permissions.filter(c => c.developer === true)[0] : {name: "developer", permissions: [], developer: true}
        return userPermission ? userPermission : null
    },
    deepFind: (obj, path) => {
        var paths = path.split('.')
          , current = obj
          , i;
        for (i = 0; i < paths.length; ++i) {
          if (current[paths[i]] == undefined) {
            return undefined;
          } else {
            current = current[paths[i]];
          }
        }
        return current;
    },
    permissionTranslator: (permission) => {
        if(!permission) return null
        return customFunctions.capitalize(permission)
    }
}

// Bot Login to Discord
bot.login(process.env.token)