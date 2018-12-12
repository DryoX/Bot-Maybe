const { Client } = require("discord.js");
const { TOKEN, PREFIX } = require("./config");
const ytdl = require(`ytdl-core`);
var opus = require(`opusscript`);

const client = new Client({ disableEveryone: true});

client.on("warn", console.warn);

client.on("error", console.error);

client.on("ready", () => console.log("i'm online :D"));

client.on("disconnect", () => console.log("i disconnected"));

client.on("reconnecting", () => console.log("i reconnected"));

client.on("message", async msg => {
    if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(PREFIX)) return undefined;
    const args = msg.content.split(" ");

    if (msg.content.startsWith(`${PREFIX}play`)) {
        const voiceChannel = msg.member.voiceChannel;
        if (!voiceChannel) return msg.channel.send("Can You Join Voice Channel?");
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has("CONNECT")) {
            return msg.channel.send("I cant connect to you");
        }
        if (!permissions.has("SPEAK")) {
            return msg.channel.send("I cant speak! Why?");
        }
        try {
            var connection = await voiceChannel.join();
        }   catch (error) {

            console.error(`i cant join voice channel ${error}`);
            return msg.channel.send(`i cant join voice channel ${error}`);
        }

        const dispatcher = connection.playStream(ytdl(args[1]))
            .on(`end`, () => {
                console.log(`song ended`);
                voiceChannel.leave();
            })
            .on(`error`, error => {
                console.error(error);
            });
        dispatcher.setVolumeLogarithmic(3 / 3);
    } else if (msg.content.startsWith(`${PREFIX}stop`)) {
        if (!msg.member.voiceChannel) return msg.channel.send("You are not in voice channel!");
        msg.member.voiceChannel.leave();
        msg.channel.send("As You Wish!");
        return undefined;
    }

    if(msg.content.startsWith(`${PREFIX}about`)) {
        let discordembed = new Discord.RichEmbed()
        .setColor("RANDOM")
        .addField("About", ["This bot is created by Next!", "To invite me on your server", "please use this link", "**[[Invite Me]](https://discordapp.com/api/oauth2/authorize?client_id=522378437621579776&permissions=54001088&scope=bot)"]);

        return message.channel.send(discordembed);

    }
});

client.login(TOKEN);
