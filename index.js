const Discord = require("discord.js");
const prefixes = require("./prefixes.json");
const ytdl = require("ytdl-core");
var opus = require("opusscript");
const actives = [
    "Use cd!help",
    "Created by Next",
    "New Update!",
    "Thanks for Invited me",
    "Version 1.5 BETA",
    "cd!help to open commands"
];
const retart = [
    "meh!",
    "yeah! i'm good",
    "no! i'm not good",
    "idk!"
];
const queue = new Map();
const lister = [
    "Ahaaaa",
    "Why not!",
    "Argh",
    "Stop it!"
];

const bot = new Discord.Client({disableEveryone: true});

    bot.on("ready", async () => {
        console.log(`Hey There! I'm ${bot.user.username} ready to help!`);
        setInterval(() => {
            const indexed = Math.floor(Math.random() * (actives.length - 1) + 1);
        bot.user.setActivity(actives[indexed]);
        }, 4000);
       
    });

        bot.on("message", async message => {
            if(message.author.bot) return undefined;
            if(message.channel.type === "dm") return undefined;

        let prefix = prefixes.prefix;
        let messageArray = message.content.split(" ");
        let cmd = messageArray[0];
        let args = message.content.split(" ");
        const serverQueue = queue.get(message.guild.id);

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
        
                const songinfo = await ytdl.getInfo(args[1]);
                const song = {
                    title: songinfo.title,
                    url: songinfo.video_url
                };
    
            if(!serverQueue){
                const queueConstruct = {
                    textChannel: message.channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 3,
                    playing: true
                };
                queue.set(message.guild.id, queueConstruct);

                queueConstruct.songs.push(song);

                try {
                    var connection = await voiceChannel.join();
                    queueConstruct.connection = connection;
                    play(message.guild, queueConstruct.songs[0]);
                } catch (error) {
                    
                    queue.delete(message.guild.id);
                    console.log("i cant find voice channel!")
                }           
            } else {
                serverQueue.songs.push(song);
                message.channel.send(`**${song.title}** Okay, Added!`);
            }
            
            if(!serverQueue) {
            let meplay = new Discord.RichEmbed()
            .setDescription("**Okay!**")
            .setColor("RANDOM")

            message.delete().catch(O_o=>{});
            return message.channel.send(meplay).then(message => {message.delete(5000)});
            }
        }

        if(cmd === `${prefix}queue`){

            if(!serverQueue) return message.channel.send("Nothing! its empty!");

            let queuelist = new Discord.RichEmbed()
            .setColor("RANDOM")
            .addField("**Information**", "**This command is under development!**");

            return message.channel.send(queuelist).then(message => {message.delete(5000)});
        }


        if(cmd === `${prefix}stop`){
            if(!serverQueue) return message.channel.send("Uhh? Am i suppost to stop something? because there's no song that i play!").then(message => {message.delete(5000)});
            if(!message.member.voiceChannel) return message.channel.send("You are not in voice channel!").then(message => {message.delete(5000)});
            serverQueue.songs = [];
            serverQueue.connection.dispatcher.end();
        
            let why = Math.floor(Math.random() * (lister.length - 1) + 1);
            let myembed1 = new Discord.RichEmbed()
            .setDescription(lister[why])
            .setColor("RANDOM")

            return message.channel.send(myembed1).then(message => {message.delete(5000)});
        }

        if(cmd === `${prefix}help`){
            let myeb = new Discord.RichEmbed()
            .setColor("#39c5dd")
            .setThumbnail(bot.user.avatarURL)
            .setDescription("**All Commands That I've | Global Prefix is cd!**")
            .addField("**Information Command**", ["`help | use this to know all my commands`", "`about | about this bot!`", "`ping | usage: ping`"])
            .addField("**Music Commads**", ["`play | usage: play (link)`", "`stop | usage: stop`", "`skip | usage: skip`"]);

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

        if(cmd === `${prefix}skip`){
            if(serverQueue) {
                serverQueue.connection.dispatcher.end()
                let skips = new Discord.RichEmbed()
                .setColor("RANDOM")
                .setDescription("**Skipped**");

                return message.channel.send(skips).then(message => {message.delete(5000)});
            }
            if(!serverQueue) return message.channel.send("Uhh? Am i suppost to play something? because there's no song on my queue list!").then(message => {message.delete(5000)});
            if(!message.member.voiceChannel) return message.channel.send("You are not in voice channel!").then(message => {message.delete(5000)});
        }

});

function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    if(!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
         .on("end", () => {
             serverQueue.songs.shift();
             play(guild, serverQueue.songs[0]);
         })
         .on("error", async () => console.log("error"));

         dispatcher.setVolumeLogarithmic(serverQueue.volume / 3);
}

    bot.login(process.env.BOT_TOKEN);

//if you want to copy this... sure! but not for token stealers
