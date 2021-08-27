const moment = require('moment')
const m = require('moment-duration-format')
const config = require("../config.json")

module.exports = {
    event: "ready",
    run: (bot, e) => {
        if(config.preload.activity && config.preload.activity.name) bot.user.setActivity(config.preload.activity.name, {type: config.preload.activity.type || "PLAYING"})
        console.log(`\n《=====● Loader Summary ●=====》\n✅ | Commands [${bot.commands.size}/${bot.bootInfo.commands}]\n✅ | Events [${bot.events.size}/${bot.bootInfo.events}]\n✅ | DatabasesSchemes [${bot.databasesSchemes.size}/${bot.bootInfo.databasesSchemes}]\n✅ | Databases [${Object.keys(bot.databases).length}/${bot.bootInfo.databases}]`)
        console.log(`\n《=====● Loader Summary ●=====》\n✅ | Connected with ...\n➡️ Name [${bot.user.tag}]\n➡️ ID [${bot.user.id}]\n➡️ Servers [${bot.guilds.cache.size}]\n➡️ Users [${bot.users.cache.size}]\n➡️ Ready In [${moment.duration(bot.readyTimestamp-bot.projectStarted).format("hh[h]mm[m]ss[s] S[ms]")}]`)
    }
}