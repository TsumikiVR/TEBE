module.exports = {
    name: "eval",
    description: "Executer du code",
    permission: "developer",
    category: "developer",
    arguments: "<code>",
    discordPermissions: [],
    loader: "internal",
    aliases: [],
    run: () => {throw "Eval cannot be used externally"}
}