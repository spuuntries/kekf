require("dotenv").config();
const procenv = process.env,
  Discord = require("discord.js"),
  client = new Discord.Client({
    intents: [
      "GUILDS",
      "GUILD_MEMBERS",
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_REACTIONS",
      "GUILD_EMOJIS_AND_STICKERS",
    ],
  });

function logger(msg) {
  console.log(`[${new Date()}] ${msg}`);
}

function login() {
  client.login(procenv.TOKEN).catch(() => {
    logger("Failed to login, retrying in 5 seconds...");
    setTimeout(login, 5000);
  });
}

login();

client.on("ready", () => {
  logger("Logged in as " + client.user.tag);
});

client.on("messageCreate", (message) => {
  let msg = message.content.trim().trimEnd();
  if (message.author.bot || !msg.toLowerCase().startsWith(procenv.BOTPREFIX))
    return;
  let args = msg.slice(procenv.BOTPREFIX.length).split(/ +/g),
    cmd = args.shift().toLowerCase();
  if (cmd != "f" && args[0].toLowerCase() != "f") return;
  if (args[0].toLowerCase() == "f") args.shift();
  let content = args.length ? args.join(" ") : "me!";
  if (message.mentions.users.size)
    content = message.mentions.users.first().username;
  message.channel
    .send("Press F to pay respects to **" + content + "**")
    .then((result) => {
      result.react("🇫").then(() => {
        let filter = (reaction, user) =>
            reaction.emoji.name === "🇫" && !user.bot,
          collector = result.createReactionCollector({
            filter: filter,
            time: 120000,
          }),
          reacted = [];
        collector.on("collect", (reaction, user) => {
          if (user.bot || reacted.includes(user.id)) return;
          result.channel.send(
            "**" +
              user.username +
              "** has paid their respect to **" +
              content +
              "**"
          );
          reacted.push(user.id);
        });
        collector.on("end", (collected, reason) => {
          result.message.channel.send(
            "**" +
              reacted.length +
              "** people has paid their respects to **" +
              content +
              "**"
          );
        });
      });
    });
});
