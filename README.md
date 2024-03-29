# TEBE

Tsumiki's Easy Bot Environnement (TEBE) is a full & ready Handler Environnement for a Discord Bot

## Summary

- [Install](#Install)
- [Configuration](#Configuration)
- [Adding new Commands](#Adding-new-Commands)
- [Adding new Events](#Adding-new-Events)
- [Adding new Databases](#Adding-new-Databases)
- [Help](#Help)
- [License](#License)

## Install

⚠ If you do not have Node.JS installed on your computer, install it first.<br>
Download [Node.JS](https://nodejs.org/en/).

The first thing to do is to download TEBE, then open your Windows Explorer and create a **new folder** wherever you want.<br>
And extract TEBE.zip in this same folder.

Then open a CMD, do `cd <tebe_folder_path>`, and enter.

![CMD_CD](https://i.imgur.com/QdRTtpA.jpg)


And then do `npm i` or `npm install` to install __all required modules__ for TEBE

![CMD_NPM_I](https://i.imgur.com/BnaZ1ag.jpg)

**That's it, TEBE is installed**

## Configuration

To configure TEBE for your bot, open the `.env` file in TEBE Folder and add the **Token** of your bot just after `token=`

After that, open `config.json` file, find the "prefix" and "developers" keys and edit them as you want.

__Note__:
- **Prefix**: Is the required "word" for the bot to understand a command (exemple: for `m!help`, `m!` is the prefix)
- **Developers**: Is an array with all the IDs of the developers of the bot (⚠ They will have all permissions on the bot)

**That's it, TEBE is ready to launch your bot**

## Adding new Commands

If you want to create a new command, you'll have to follow a certain type of base.<br>
In the `commands` folder there is a file named `test.js`, this command is a the base.<br>
You just have to edit it as your envy

__Note__:
- **Name**: Is the name of the commande that will be used to be understandable on Discord (⚠ Make sure to have the same name in the file name)
- **Description**: Is the description of the command, to help users to know what does she do
- **Category**: Is the category where the command will be affected to in the `help` command
- **Permission**: Is the permission required to be used, check `config.permissions` or execute the `userp` command
- **Arguments**: Is the arguments descriptor for the users to know if they have to add arguments after the commande (<> = required | [] = optional)
- **discordPermissions**: Is the permissions of Discord, that the bot must have to execute the command (`SEND_MESSAGES` is the required permission to send a message)
- **Aliases**: Is the aliases of the command name, they are optional to help users to execute a command faster (exemple: `h` or `?` can be the aliases for `help`)
- **Loader**: Is the type of load for commands, `external` is the most used because it load the command by the file and `internal` load commands in `index.js` (the eval command need to be load internally)
- **Run**: Is the line of code that will be executed when a user use the command

__Command Base__:
```js
module.exports = {
    name: "test",
    description: "",
    category: "developer",
    permission: "developer",
    arguments: "",
    discordPermissions: [],
    aliases: [],
    loader: "external",
    run: (bot, message, args, modules, customFunctions) => {
        // Some lines
    }
}
```

## Adding new Events

If you want to create a new event, you'll have (as for commands) to follow a certain type of base.<br>
For events, you can follow the `ready.js` file in `events` folder.<br>

__Note__:
- **Event**: Is the event that Discord.JS will undertand to listen to
- **Run**: As Run for commands, it will execute what you want when Discord will return an information

__Event Base__:
```js
module.exports = {
    event: "",
    run: (bot, e) => {
        // Some lines
    }
}
```

## Adding new Databases

As Commands and Events, you'll have to follow a certain type of base.<br>
You have to create a file in the `databasesSchemes` folder this time, TEBE will create the database himself

__Note__:
- **Type**: Is the type of database that will be created, the type `id` means that it will create like a `user` database, the type `unique` means a database with solid variables
- **infoData**: Is the informations that will be getted when you use the command `database` (it shows like a summary of all data), you'll find the database base just under the Note
- **Data**: Is the data that TEBE will create by default when create the database

__Database Base__:
```js
module.exports = {
    type: "",
    infoData: [
        {
            name: "test",
            data: "length", // for short data
            execute: (data) => {
                return data // for data that need to be executed
            }
        }
    ],
    data: {}
}
```

## Help

If there is a problem with TEBE, send me a DM on Discord to Tsumiki#0001.

## License

Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)