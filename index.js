/*
avuOS version 1.0
    - Developped by: betawolfy
    - Host: replit.com 
    - Database: mongo.db
    c 2023 Hematom

    "don't let fools tell you that you are wrong, your tears are their food, your spirit and your strength is your weapon to fight them."
*/

const config = require('./config')
const { Client, ActivityType, OAuth2Scopes, EmbedBuilder } = require('discord.js')
const logger = require("./logger");
const ecologger = require("./economy");
const msgLogger = require("./msgLogger");
const Economy = require('discord-economy-super/mongodb');
const fs = require('fs').promises;
const cowsay = require('cowsay');
//const { token } = require('./config.json');
let chalk;
const _ = require('lodash');

import('chalk').then((module) => {
    chalk = module.default;
});


const client = new Client({
    intents: ['GuildMembers', 'GuildMessages', 'Guilds', 'MessageContent', 'DirectMessages']
})

// Create a new economy

let eco = new Economy({
    connection: {
        connectionURI: config.connectionString,
        dbName: 'pointForCRY',
        collectionName: 'pointForCRY'
    },

    dailyAmount: 100,
    workAmount: [50, 200],
    weeklyAmount: 5000
})


const getUser = userID => client.users.cache.get(userID)

// Actual command handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const authorizedUsers = ['432116536866766849', '1137286559306096710', '436722027966234634'];

    // const messageInGuild = interaction.guild ? true : false;
    // msgLogger.info(`[${messageInGuild ? "GUILD] [" + interaction.guild.name : "DM"}] [${interaction.channel.name}] [${interaction.user.tag}]: ${interaction.commandName}`);

    const command = interaction.commandName
    const prefix = "/"

    let guild = eco.cache.guilds.get({
        guildID: interaction.guild.id
    })

    let user = eco.cache.users.get({
        memberID: interaction.user.id,
        guildID: interaction.guild.id
    })

    const userID = interaction.options.getUser('user')?.id ||
        interaction.guild.members.cache.find(member => member.user.username == interaction.options.getString('username'))?.id
        || getUser(interaction.options.getString('username'))?.id


    let argumentUser = eco.cache.users.get({
        memberID: userID,
        guildID: interaction.guild.id
    })

    const shop = eco.cache.shop.get({
        guildID: interaction.guild.id
    }) || []

    const inventory = eco.cache.inventory.get({
        guildID: interaction.guild.id,
        memberID: interaction.user.id
    }) || []

    const history = eco.cache.history.get({
        guildID: interaction.guild.id,
        memberID: interaction.user.id
    }) || []

    if (interaction.user.bot) return

    if (userID && !argumentUser) {
        argumentUser = await eco.users.create(userID, interaction.guild.id)
    }

    if (!guild) {
        guild = await eco.guilds.create(interaction.guild.id)
    }

    if (!user) {
        const ecoUser = await eco.users.get(interaction.user.id, interaction.guild.id)

        if (ecoUser) {
            eco.cache.users.update({
                guildID: interaction.guild.id,
                memberID: interaction.user.id
            })

            user = ecoUser
            return
        }

        user = await guild.users.create(interaction.user.id)
    }

    const { commandName } = interaction;

    if (commandName === 'help') {
        const exampleEmbed = new EmbedBuilder()
            .setColor(0xcdc6f4)
            .setTitle('⋆₊☆ CRY Help ⋆₊☆')
            .setAuthor({ name: 'betawolfy', iconURL: 'https://i.imgur.com/g5ujuy8.png', url: 'http://www.betawolfy.xyz' })
            .setDescription(`${interaction.user}, here's the help for this bot :\n\n` +

                `### Staff only:\n\n` +
                `\`${prefix}add <user> <amount>\` - add point. \n` +
                `\`${prefix}remove <user> <amount | all>\` - remove point\n` +
                `\`${prefix}ping\` - shows latency.\n\n` +

                `### usable by all\n\n` +
                `\`${prefix}help\` - shows this message.\n` +
                //`\`${prefix}credit\` - Credits all things used for this bot.\n` +
                `\`${prefix}points [user]\` - show the user points.\n`
                //`\`${prefix}bal\` - shows your points\n` +
                //`\`${prefix}leaderboard\` - shows the top\n`
            )
            .setFooter({ text: 'RE: CRYST4LLUM [CRY]', iconURL: 'https://i.imgur.com/fsRAPDM.png' });

        logger.info(`[${interaction.guild.id}] La commande help a bien été executé par ${interaction.user}`);
        await interaction.reply({ embeds: [exampleEmbed] });

    } else if (commandName === 'ping') {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const uptimeMinutes = Math.round(interaction.client.uptime / 60000);
        const websocketPing = interaction.client.ws.ping;
        const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`:ping_pong: Pong!\n:stopwatch: Uptime: ${uptimeMinutes} minutes\n:sparkling_heart: Websocket heartbeat: ${client.ws.status}ms.\n:round_pushpin: Rountrip Latency: ${roundtripLatency}ms`);
    } else if (commandName === 'add') {
        const userID = interaction.options.getUser('user')?.id ||
            interaction.guild.members.cache.find(member => member.user.username == interaction.options.getString('username'))?.id
            || getUser(interaction.options.getString('username'))?.id;

        const user = interaction.guild.members.cache.get(userID); // Récupérer l'utilisateur mentionné


        //betawolfy
        if (interaction.user.id == "432116536866766849") {
            if (!userID) {
                return interaction.reply(
                    `:warning: - ${interaction.user}, specify the person to whom you want to add the point. .`
                );
            }

            if (!user) {
                return interaction.reply(
                    `:x: - ${interaction.user}, this person doesn't exist.`
                );
            }

            const amount = interaction.options.getInteger('amount');

            if (!amount) {
                return interaction.reply(
                    `:warning: - ${interaction.user}, specify how much point you want to add`
                );
            }

            if (isNaN(amount)) {
                return interaction.reply(
                    `${interaction.user}, pls specify a real number..`
                );
            }

            await argumentUser.balance.add(amount);
            ecologger.info(`[${interaction.guild.id}] ${interaction.user.tag} à ajouté ${amount} à ${user ? user.user.tag : userID}`);
            const addMoneyEmbed = new EmbedBuilder()
                .setColor(0xa9f6f6)
                .setTitle('<:0y:1142855575466692789> - point added!')
                .setDescription(`﹒♡﹒${interaction.user}, **${amount}** point added to **<@${userID}>** ﹒ᐢᗜᐢ`)
                .setFooter({ text: 'RE: CRYST4LLUM', iconURL: 'https://i.imgur.com/fsRAPDM.png' });

            interaction.reply({ embeds: [addMoneyEmbed] });
        }
        else {
            interaction.reply(":x: - 403: Forbidden");
            ecologger.warn(`${interaction.user} à essayé de s'**ajouter** des point!!`);
        }
    } else if (commandName === 'remove') {
        const userID = interaction.options.getUser('user')?.id ||
            interaction.guild.members.cache.find(member => member.user.username == interaction.options.getString('username'))?.id
            || getUser(interaction.options.getString('username'))?.id;

        const user = interaction.guild.members.cache.get(userID); // Récupérer l'utilisateur mentionné

        //betawolfy
        if (interaction.user.id == "432116536866766849") {
            if (!userID) {
                return interaction.reply(
                    `:warning: - ${interaction.user}, specify the person to whom you want to remove the point.`
                );
            }

            if (!user) {
                return interaction.reply(
                    `:x: - ${interaction.user}, this person doesn't exist.`
                );
            }

            const userBalance = await argumentUser.balance.get() || 0
            const amount = interaction.options.getInteger('amount') == 'all' ? userBalance : parseInt(interaction.options.getInteger('amount'));

            if (!amount) {
                return interaction.reply(
                    `:warning: - ${interaction.user}, specify how much point you want to remove`
                );
            }

            if (isNaN(amount)) {
                return interaction.reply(
                    `:warning: - ${interaction.user}, pls choose a real number.`
                );
            }

            await argumentUser.balance.subtract(amount);
            ecologger.info(`${interaction.user.tag} à supprimé ${amount} point à ${user ? user.user.tag : userID}`);
            const removeMoneyEmbed = new EmbedBuilder()
                .setColor(0xf6a9a9)
                .setTitle(':<:0y:1142855575466692789> - removed point')
                .setDescription(`﹒♡﹒${interaction.user}, **removed ${amount}** point to **<@${userID}>** ﹒°╭╮`)
                .setFooter({ text: 'RE: CRYST4LLUM', iconURL: 'https://i.imgur.com/fsRAPDM.png' });

            interaction.reply({ embeds: [removeMoneyEmbed] });
        }
        else {
            interaction.reply(":x: - 403: Forbidden");
            ecologger.warn(`${interaction.user} à essayé de **soustraire** des point!!`);;
        }
    } else if (commandName === 'points') {
        const userID = interaction.options.getUser('user')?.id ||
            interaction.guild.members.cache.find(member => member.user.username == interaction.options.getString('username'))?.id
            || getUser(interaction.options.getString('username'))?.id;

        const member = interaction.guild.members.cache.get(userID);

        if (!userID) {
            return interaction.reply(
                `:warning: - ${interaction.user}, you must specify who you want to check (do /checkself if you're too lazy to ping yourself)`
            );
        }

        const economyUser = member ? argumentUser : user;
        const balanceData = eco.cache.balance.get({ memberID: member.id, guildID: interaction.guild.id });

        const [balance, bank] = [balanceData?.money, balanceData?.bank];

        const embed = new EmbedBuilder()
            .setColor('#CDC6F4')
            .setTitle(`<:16_pearl:1147545093419581531> - Displaying a member's points`)
            .setDescription(`${getUser(economyUser.id)}'s points\npoint: **${balance || 0}**.`);

        interaction.reply({ embeds: [embed] });
    } else if (commandName === 'cowsay') {
        const text = interaction.options.getString('text');
        const cowSays = cowsay.say({ text: text });
        await interaction.reply(`\`\`\`\n${cowSays}\n\`\`\``);
    } else if (commandName === 'didyoumean') {
        const top = interaction.options.getString('top');
        const bottom = interaction.options.getString('bottom');

        if (top.length > 51) {
            interaction.reply('⚠ - Text must be under 51 characters.');
            return;
        }
        else if (top.length > 51) {
            interaction.reply('⚠ - Text must be under 51 characters.');
            return;
        }



        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🔍 - Did you mean?')
            .setImage(`https://api.alexflipnote.dev/didyoumean?top=${encodeURIComponent(top)}&bottom=${encodeURIComponent(bottom)}`);
        await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'howmuch') {
        const milMedroles = [
            { name: 'selenite leader - SL', value: 4000 },
            { name: 'celestite center - CC', value: 3570 },
            { name: 'apophyllite rapper - AR', value: 3165 },
            { name: 'atlantisite vocalist - AV', value: 2760 },
            { name: 'astrophyllite dancer - AD', value: 2350 },
            { name: 'angelite visual - AN', value: 1970 },
            { name: 'debuting idol - DI', value: 1660 },
            { name: 'voting waves - VW', value: 1360 },
            { name: 'riptide ranking - RR', value: 1100 },
            { name: 'seafaring show - SS', value: 910 },
            { name: 'pearly competition - PC', value: 760 },
            { name: 'malachite auditionee - MA', value: 635 },
            { name: 'stage preparation - SP', value: 510 },
            { name: 'casted talent - CT', value: 375 },
            { name: 'roselite methods - RM', value: 250 },
            { name: 'geode ambitions - GA', value: 150 },
            { name: 'tidal rehearsals - TR', value: 75 },
            { name: 'seashell trainee - ST', value: 0 }
          ];

          const userPoints = interaction.options.getString('current');
    const user = interaction.options.getUser('user');
    const career = interaction.options.getString('career');
  
    let roles;
    if (career === 'normal') {
        roles = milMedroles;
    } 
  
    const sortedRoles = _.sortBy(roles, 'value');
    let currentRank = _.findLast(sortedRoles, role => userPoints >= role.value);
    let nextRank = _.find(sortedRoles, role => userPoints < role.value);
  
    let difference;
    if (nextRank) {
      difference = nextRank.value - userPoints;
    }
  
    let response;
  
    if (!nextRank) {
        response = `${user ? user.username + ' has' : 'You are at '} the highest rank.`;
      } else {
        response = `${user ? user.username + ' needs' : 'You need'} ${difference} more points to reach the next rank: ${nextRank.name}, which requires ${nextRank.value} points.`;
      }
  
    // Renvoyer la réponse à l'utilisateur
    await interaction.reply({ content: response, ephemeral: false });
    }
});

// Log all messages
client.on('messageCreate', message => {


    // V rifier si le message a  t  envoy  par un bot
    if (message.author.bot) {
        console.log(chalk.red(`Date: ${new Date().toISOString()}, Canal: ${message.channel.name}, sent by: ${message.author.tag}`));
        return;
    }


    // V rifier si le message est un embed
    if (message.embeds.length > 0) return;


    // V rifier si le contenu du message est pr sent
    const content = message.content || 'Contenu non disponible';

    const logMessage = `Date: ${new Date().toISOString()}, Canal: ${message.channel.name}, sent by: ${message.author.tag} Message: ${content}`;
    const logMessage4log = `Date: ${new Date().toISOString()}, Canal: ${message.channel.name}, sent by: ${message.author.tag} Message: ${content}\n`;

    // console.log(logMessage);

    fs.appendFile('logMessages.txt', logMessage4log, err => {
        if (err) {
            console.error('Erreur lors de l\'écriture du fichier de log:', err);
        }
    });
});

// Accounce new members
client.on('guildMemberAdd', async member => {
    console.log('A member has joined the server.');
  
    if (member.guild.id !== '1083874458198085652') {
      console.log('The member did not join the specified server.');
      return;
    }
  
    console.log('The member has joined the specified server.');
  
    let isBlacklisted = blacklist.hasOwnProperty(member.user.id);
    let message = `New member: ${member.user.username} (${member.displayName})\nAccount creation date: ${member.user.createdAt.toDateString()}\nIs blacklisted: ${isBlacklisted ? 'Yes' : 'No'}`;
  
    console.log('Message created.');
  
    if (new Date() - member.user.createdAt < 1000 * 60 * 60 * 24 * 30) {
      message += '\n:warning: - **This account is less than one month old!**';
      console.log('The account is less than one month old.');
    }
      if (new Date() - member.user.createdAt < 1000 * 60 * 60 * 24 * 14) {
        message += '\n:x: - **This account is less than two weeks old!**';
        console.log('The account is less than two weeks old.');
      }
  
      const channel = await member.guild.channels.fetch('1199894218856996865');
      console.log('Channel fetched.');
  
      channel.send(message);
      console.log('Message sent.');
    });
  

// Only once when the bot is ready
client.on('ready', () => {
    const status = "CRY OS v0.1a"
    var d = new Date();
  const os = require('os');

  // Enregistrez l'heure de d but
  const start = Date.now();
  // Une fois que le bot a d marr 
  const end = Date.now();

  console.log(`${client.user.tag} is starting...\n\nOS Name: ${os.type()} v${os.release()} \nCopyright (c) 2024, AVU team, inc\n\n Processor: ${os.cpus()[0].model}\n\nMemory: ${Math.round(os.totalmem() / 1024 / 1024)} MB\n Startup time: ${end - start} ms\n current time :` + new Date().toLocaleString() + `\n\nAward Plug and Play BIOS Exension v1.0A\nInictialize Plug and Play Card...\nPnP init Completed\n\nDetecting Primary Master ... ${os.hostname}\nDetecting Primary Slave ... Unbuntu\nDetecting Secondary Master ... Skip\nDetecting Secondary Slave ... none_\n\n\n\n Loading ${client.user.tag}`);
  console.log(chalk.green(`Ready! Logged in as ${client.user.tag}\nSCurrent activity: ${status} with status: ${status}`));


    client.user.setActivity(`${status}`, {
        type: ActivityType.Watching,
    })
    console.log(`actual status of the client: ${status}. `)
})

// Log in to the bot
require('./server')();
client.login(config.token)