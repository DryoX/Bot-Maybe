const Discord = require("discord.js");
const YouTube = require("simple-youtube-api");
const fs = require("fs");
const Util = require("discord.js");
const botconfig = require("./botconfig.json");
//const prefixes = require("./prefixes.json");
const ytdl = require("ytdl-core");
//const tokens = require("./allthings.json");
var opus = require("opusscript");
const actives = [
    "Maintenance!",
    "New Update!",
    "Thanks for invited me!",
    "cd!help for commands!",
    "Version 2.0 BETA",
    "Created by Next"
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
    "No No Noo!"
];

const youtube = new YouTube(botconfig.apikey);

const bot = new Discord.Client({disableEveryone: true});

    bot.on("ready", async () => {
        console.log(`Hey There! I'm ${bot.user.username} ready to help!`);
        setInterval(() => {
            const indexed = Math.floor(Math.random() * (actives.length - 1) + 1);
        bot.user.setActivity(actives[indexed]);
        }, 4000);
       
    });

        bot.on("message", async message => {
            if(message.author.bot) return;
            if(message.channel.type === "dm") return;

            let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));
            if(!prefixes[message.guild.id]){
              prefixes[message.guild.id] = {
                prefixes: botconfig.prefix
              };
            }

        let prefix = prefixes[message.guild.id].prefixes;
        let messageArray = message.content.split(" ");
        let cmd = messageArray[0];
        let argsa = messageArray.slice(1);
        let args = message.content.split(" ");
        const url = args[1] ? args[1].replace(/<(.-)>/g, `$1`) : ``;
        const searchString = args.slice(1).join(" ");
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
        
            try {
                var video = await youtube.getVideo(url);
            }   catch (error) {
                try {
                    var videos = await youtube.searchVideos(searchString, 1);
                    var video = await youtube.getVideoByID(videos[0].id);
                } catch (error) {
                    return message.channel.send("Cannot find that video!");
                }
            }

                const song = {
                    id: video.id,
                    title: video.title,
                    url: `https://www.youtube.com/watch?v=${video.id}`
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
            .addField("**Here's what i got**", `${serverQueue.songs.map(song => `**--** ${song.title}`).join(`\n`)}`)
            .addField("Now Playing", `${serverQueue.songs[0].title}`);

            return message.channel.send(queuelist);
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
            .addField("**Information Command**", ["`help | use this to know all my commands`", "`about | about this bot!`", "`ping | usage: ping`", "`bug | usage: bug (report)`"])
            .addField("**Admin Commands**", ["`prefix | usage: prefix (prefix)`", "`volset | usage: volset (volume)`"])
            .addField("**Music Commads**", ["`play | usage: play (song/link)`", "`stop | usage: stop`", "`skip | usage: skip`", "`pause | usage: pause`", "`resume | usage: resume`", "`nowplaying | usage: np`", "`volume | usage: volume`", "`queue | usage: queue`"]);

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

        if(cmd === `${prefix}prefix`){

            if(!message.member.hasPermission("MANAGE_SERVER")) return message.reply("Stop it if you dont have any permission");
            if(!argsa[0] || argsa[0 == "help"]) return message.reply("Usage: prefix <Chose your prefix>");

            let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));

            prefixes[message.guild.id] = {
            prefixes: argsa[0]
            };

            fs.writeFile("./prefixes.json", JSON.stringify(prefixes), (err) => {
            if (err) console.log(err)
            });

            let sEmbed = new Discord.RichEmbed()
            .setColor("RANDOM")
            .setTitle("Prefix Is Set")
            .setDescription(`Set Prefix To ${argsa[0]}`);

            message.channel.send(sEmbed);
        }
            
            if(cmd === `${prefix}bug`){
                
                let vbq = argsa.join(" ");
              if(!vbq) return message.channel.send("Any bug report?");

              message.channel.send("Your Report Has Been Sended!").then(message => {message.delete(5000)});

              let bugEmbed = new Discord.RichEmbed()
              .setColor("RANDOM")
              .addField("**Bug Report**", vbq);

              message.delete().catch(O_o=>{});
              bot.users.get("378074425066520577").send(bugEmbed);
            }

            if(cmd === `${prefix}np`){
                if(!serverQueue) return message.channel.send("Uhh? Am i suppost to play something? because there's no song that i play!").then(message => {message.delete(5000)});
                
                let nplay = new Discord.RichEmbed()
                .setColor("RANDOM")
                .addField("Now Playing", `**${serverQueue.songs[0].title}**`);

                return message.channel.send(nplay);
            }

            if(cmd === `${prefix}volume`){

                if(!serverQueue) return message.channel.send("Uhh? Am i suppost to set something? because there's no song that i play!").then(message => {message.delete(5000)});

                if(!args[1]){

                    let cvol = new Discord.RichEmbed()
                    .setColor("RANDOM")
                    .addField("**My volume is at**", `${serverQueue.volume}`);

                    return message.channel.send(cvol);
                }

                serverQueue.volume = args[1];
                
            }

            if(cmd === `${prefix}volset`){

                if(!bot.users.get("378074425066520577"));
                if(!message.member.hasPermission("SPEAK")) return message.channel.send("No No No!");

                let volsets = argsa.join()

                if(!serverQueue) return message.channel.send("Uhh? Am i suppost to set something? because there's no song that i play!").then(message => {message.delete(5000)});

                serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 3); {

                    let volset = new Discord.RichEmbed()
                    .setColor("RANDOM")
                    .addField("Volume set to", volsets);

                    return message.channel.send(volset);
                }
            }

            if(cmd === `${prefix}pause`){

                if(serverQueue && serverQueue.playing) {

                    serverQueue.playing = false;
                serverQueue.connection.dispatcher.pause();

                    let pausea = new Discord.RichEmbed()
                        .setColor("RANDOM")
                        .setDescription("**Paused!**");

                        return message.channel.send(pausea).then(message => {message.delete(5000)});
                }

               return message.channel.send("Uhh? Am i suppost to resume something? because there's no song that i play!").then(message => {message.delete(5000)});
    
            }

            if(cmd === `${prefix}resume`){
                
                if(serverQueue && !serverQueue.playing) {
                    serverQueue.playing = true;
                    serverQueue.connection.dispatcher.resume();

                    let resumea = new Discord.RichEmbed()
                    .setColor('RANDOM')
                    .setDescription("**Resume!**");

                    return message.channel.send(resumea).then(message => {message.delete(5000)});

                }

                return message.channel.send("Uhh? Am i suppost to resume something? because there's no song that i play!").then(message => {message.delete(5000)});

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

         serverQueue.textChannel.send(`Now its time for **${song.title}**`);
}

    bot.login(process.end.BOT_TOKEN);
