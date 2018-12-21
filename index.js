const Discord = require("discord.js");
const prefixes = require("./prefixes.json");
const ytdl = require("ytdl-core");
var opus = require("opusscript");
const actives = [
    "use p!help",
    "Created by Next",
    "Update Cancled!",
    "Thanks for Invited me",
    "Version 1.0.4",
    "p!help to open commands"
];
const retart = [
    "meh!",
    "yeah! i'm good",
    "no! i'm not good",
    "idk!"
];

const bot = new Discord.Client({disableEveryone: true});

    bot.on("ready", async () => {
        setInterval(() => {
            const indexed = Math.floor(Math.random() * (actives.length - 1) + 1);
        bot.user.setActivity(actives[indexed]);
        console.log(`Hey There! I'm ${bot.user.username} ready to help!`);
        }, 4000);
       
    });

        bot.on("message", async message => {
            if(message.author.bot) return undefined;
            if(message.channel.type === "dm") return undefined;

        let prefix = prefixes.prefix;
        let messageArray = message.content.split(" ");
        let cmd = messageArray[0];
        let args = message.content.split(" ");

        if(cmd === `${prefix}play`){

            const voiceChannel = message.member.voiceChannel;
            if(!voiceChannel) return message.channel.send("Can You Join Voice Channel?");
            const permissions = voiceChannel.permissionsFor(message.client.user);
            if(!permissions.has("CONNECT")) {
                return message.channel.send("I cant connect to you!");
            }
            if(!permissions.has("SPEAK")) {
                return message.channel.send("I cant speak!");
            }
            try {
                var connection = await voiceChannel.join();
            } catch (error) {

                console.log("i cant find voice channel!")
            }  

            const dispatcher = connection.playStream(ytdl(args[1]))
            .on(`end`, () => {
                voiceChannel.leave();
            })

            dispatcher.setVolumeLogarithmic(3 / 3);

            let meplay = new Discord.RichEmbed()
            .setDescription("**Played!**")
            .setColor("RANDOM")

            message.delete().catch(O_o=>{});
            return message.channel.send(meplay).then(message => {message.delete(5000)});

        }

        if(cmd === `${prefix}stop`){
            if(!message.member.voiceChannel) return message.channel.send("You are not in voice channel!");
        message.member.voiceChannel.leave();
        
            let myembed1 = new Discord.RichEmbed()
            .setDescription("As You Wished!")
            .setColor("RANDOM")

            return message.channel.send(myembed1).then(message => {message.delete(5000)});
        }

        if(cmd === `${prefix}help`){
            let myeb = new Discord.RichEmbed()
            .setColor("#39c5dd")
            .setDescription("**All Commands That I've | Global Prefix is p!**")
            .addField("**Information Command**", ["`help | use this to know all my commands`", "`about | about this bot!`"])
            .addField("**Music Commads**", ["`play | usage: play (link)`", "`stop | usage: stop`"]);

            return message.channel.send(myeb);
        }

        if(cmd === `${prefix}about`){
            let abouta = new Discord.RichEmbed()
            .setColor("RANDOM")
            .addField("**Information**", ["`This bot is created by Next!`", "`if you have any issue with this bot`", "`please DM me! and if you want to invite this bot!`", "**[[INVITE ME]](https://discordapp.com/api/oauth2/authorize?client_id=522378437621579776&permissions=37084480&scope=bot)**"]);

            return message.channel.send(abouta);
        }
            
            if(cmd === `${prefix}ping`){

            let retarted = Math.floor(Math.random() * (retart.length - 1) + 1);
            let pings = new Discord.RichEmbed()
            .setThumbnail(bot.user.avatarURL)
            .setColor("#42c8f4")
            .addField("Ping goes to!", [Math.floor(bot.ping)+`ms!`], true)
            .addField("Am i feeling good?", retart[retarted], true);

            return message.channel.send(pings).then(message => {message.delete(5000)});
        }

});

    bot.login(process.env.BOT_TOKEN);

//if you want to copy this... sure! but not for token stealers
