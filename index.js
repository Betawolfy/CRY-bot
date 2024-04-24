/*
avuOS version 1.0
    - Developped by: betawolfy
    - Host: replit.com 
    - Database: mongo.db
    c 2023 Hematom

    "don't let fools tell you that you are wrong, your tears are their food, your spirit and your strength is your weapon to fight them."
*/

const config = require('./config')
const { Client, ActivityType, OAuth2Scopes, EmbedBuilder, ButtonBuilder, ButtonStyle, } = require('discord.js')
const logger = require("./logger");
const ecologger = require("./economy");
const msgLogger = require("./msgLogger");
const Economy = require('discord-economy-super/mongodb');
const fs = require('fs');
//const fs = require('fs').promises;
const cowsay = require('cowsay');
//const { token } = require('./config.json');

const _ = require('lodash');
const { cli } = require('winston/lib/winston/config');
const pagination = require('discord.js-pagination');
let chalk;
import('chalk').then((module) => {
    chalk = module.default;
});

const simplydjs = require('simply-djs')
const axios = require('axios');

// const client = new Client({
//     intents: ['GuildMembers', 'GuildMessages', 'Guilds', 'MessageContent', 'GuildMessageReactions', 'DirectMessages', 'GuildPresences']
// })

const client = new Client({
    intents: [
        'Guilds',
        'GuildMessages',
        'GuildMessageReactions',
        'MessageContent',
        'GuildMembers',
        'GuildPresences',
    ],
});

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
    //
    const authorizedUsers = ['729571229060563067', '660122476885573632', '1153268855444078602', '376105044959035392', '537380950204743691', '622068827328610324', '873152278222241834', '432116536866766849', '699529186750234747'];

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
                //warn commands help
                `\`${prefix}warn-add <user> <reason> <comment>\` - warn a user\n` +
                `\`${prefix}warn-remove <user> <warn_index>\` - remove a warn from a user\n` +
                `\`${prefix}warn-list <user>\` - list all warns of a user\n` +
                `\`${prefix}checkifblacklist <user>\` - check if a user is blacklisted\n\n` +

                `### usable by all\n\n` +
                `\`${prefix}points <user>\` - show the user points.\n` +
                `\`${prefix}leaderboard\` - shows the top\n` +
                `\`${prefix}cowsay <text>\` - make a cow say something\n` +
                `\`${prefix}didyoumean <top> <bottom>\` - send a meme like google believe you say something wrong\n` +
                `\`${prefix}howmuch <career> <current> <user>\` - shows how much point left before the next rank.\n` +
                `\`${prefix}calculator\` - for lazy people who don't want to use their brain\n` +
                `\`${prefix}achievement <text>\` - generates a "Minecraft Achievement" meme\n` +
                `\`${prefix}hexcolor <value>\` - give a hex color code and get a preview of it.\n` +
                `\`${prefix}tonetags <tone>\` - displays a list of tone tags.\n`
            )
            .setFooter({ text: 'RE: CRYST4LLUM [CRY]', iconURL: 'https://i.imgur.com/fsRAPDM.png' });

        logger.info(`[${interaction.guild.id}] La commande help a bien été executé par ${interaction.user}`);
        await interaction.reply({ embeds: [exampleEmbed] });

    } else if (commandName === 'ping') {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const uptimeMinutes = Math.round(interaction.client.uptime / 60000);
        const websocketPing = interaction.client.ws.ping;
        const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`:ping_pong: Pong!\n:stopwatch: Uptime: ${uptimeMinutes} minutes\n:sparkling_heart: Websocket heartbeat: ${websocketPing}ms.\n:round_pushpin: Rountrip Latency: ${roundtripLatency}ms`);
    } else if (commandName === 'add') {
        const userID = interaction.options.getUser('user')?.id ||
            interaction.guild.members.cache.find(member => member.user.username == interaction.options.getString('username'))?.id
            || getUser(interaction.options.getString('username'))?.id;

        const user = interaction.guild.members.cache.get(userID); // Récupérer l'utilisateur mentionné


        //betawolfy
        if (authorizedUsers.includes(interaction.user.id)) {
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
        if (authorizedUsers.includes(interaction.user.id)) {
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
    } else if (commandName === 'leaderboard') {
        const rawLeaderboard = await guild.leaderboards.money()

        const leaderboard = rawLeaderboard
            .filter(lb => !getUser(lb.userID)?.bot)
            .filter(lb => !!lb.money)

        if (!leaderboard.length) {
            return interaction.reply(`there are no users in the leaderboard.`)
        }

        // Étape 1: Divisez le tableau en sous-tableaux de 10 éléments chacun
        const pages = [];
        for (let i = 0; i < leaderboard.length; i += 10) {
            pages.push(leaderboard.slice(i, i + 10));
        }

        // Étape 2: Créez une fonction pour générer un embed pour chaque page
        function generateEmbed(page, pageIndex, totalPages) {
            return new EmbedBuilder()
                .setColor(0xa9f6f6)
                .setTitle(`**${interaction.guild.name}** - Point Leaderboard **[${page.length}]**`)
                .setAuthor({ name: 'all the server', iconURL: 'https://i.imgur.com/maxsKSF.png', url: 'http://www.betawolfy.xyz' })
                .setDescription(`${page
                    .map((lb, index) => `${index + 1 + pageIndex * 10} - <@${lb.userID}> - **${lb.money}** point`)
                    .join('\n')}`)
                .setFooter({ text: `Page ${pageIndex + 1} / ${totalPages} | RE: CRYST4LLUM`, iconURL: 'https://i.imgur.com/fsRAPDM.png' });
        }
        // Étape 3: Utilisez les réactions pour naviguer entre les pages
        let currentPageIndex = 0;
        interaction.reply({ embeds: [generateEmbed(pages[currentPageIndex], currentPageIndex, pages.length)], fetchReply: true })
            .then(replyMessage => {
                if (pages.length > 1) {
                    replyMessage.react('⬅️');
                    replyMessage.react('➡️');

                    const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === interaction.user.id;
                    const collector = replyMessage.createReactionCollector({ filter, time: 60000 });

                    collector.on('collect', reaction => {
                        replyMessage.reactions.removeAll().then(async () => {
                            reaction.emoji.name === '⬅️' ? currentPageIndex-- : currentPageIndex++;
                            replyMessage.edit({ embeds: [generateEmbed(pages[currentPageIndex], currentPageIndex, pages.length)] });
                            if (currentPageIndex !== 0) await replyMessage.react('⬅️');
                            if (currentPageIndex + 1 < pages.length) await replyMessage.react('➡️');
                        });
                    });
                }
            });
    } else if (commandName === 'checkifblacklist') {
        const guild = interaction.guild;
        const client = interaction.client;

        // Gal, Lampen, Lennox, Camille, Betawolfy, Lotus, Ancharde, Rook
        if (!authorizedUsers.includes(interaction.user.id)) {
            interaction.reply({ content: '❌ - You are not allowed to use this command', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('user_id');

        const blacklist = require('./blacklist.json');

        if (user.id in blacklist) {
            const reason = blacklist[user.id];
            interaction.reply({ content: `<:0y:1142855575466692789> - The user is blacklisted for the following reason: ${reason}`, ephemeral: false });
        } else {
            interaction.reply({ content: '<:0x:1142855597897830603> - The user is not blacklisted', ephemeral: false });
        }
    } else if (commandName === 'warn-add') {
        // Reading the JSON file to get the data
        if (!authorizedUsers.includes(interaction.user.id)) {
            interaction.reply({ content: '❌ - You are not allowed to use this command', ephemeral: false });
            return;
        }

        let data;
        try {
            data = JSON.parse(fs.readFileSync('warns.json', 'utf8'));
        } catch (err) {
            data = {};
        }

        // take the user_id, reason and comment from the interaction options
        const user = interaction.options.getUser('user_id');
        const reason = interaction.options.getString('reason');
        const comment = interaction.options.getString('comment');

        await interaction.deferReply({ ephemeral: false });

        if (user.id in data) {
            data[user.id].count++;
        } else {
            data[user.id] = {
                count: 1,
                reasons: [],
                dates: [] // Add dates array
            };
        }

        data[user.id].reasons.push(reason);
        data[user.id].dates.push(new Date().toISOString()); // Add current date

        // Écrire les données modifiées dans le fichier JSON
        fs.writeFileSync('warns.json', JSON.stringify(data, null, 2));

        // Pour vérifier le nombre de warns d'un utilisateur
        const warnData = user.id in data ? data[user.id] : { count: 0, reasons: [], dates: [] };
        const warnCount = warnData.count;
        const allWarnReasons = warnData.reasons.join(', ');
        const allWarnDates = warnData.dates.join(', '); // Get all warn dates

        console.log(`User ${user.id} has ${warnCount} warns. Reasons of the warns: ${allWarnReasons}. Dates of the warns: ${allWarnDates}`);

        // Envoyer un message de confirmation

        if (data[user.id].count > 4) {
            await interaction.followUp({ content: `? - The user has been warned for the following reason: ${reason}\nUser ${user.username} has more than 4 warns and according to the strike system, they should be kicked.`, ephemeral: false });
        } else if (data[user.id].count === 4) {
            await interaction.followUp({ content: `? - The user has been warned for the following reason: ${reason}\nUser ${user.username} has more than 3 warns and should be suspended for a week. They cannot participate in any activities during this time.`, ephemeral: false });
        } else {
            if (comment) {
                await interaction.followUp({ content: `? - The user ${user.username} has been warned for the following reason: ${reason}. Added context: ${comment}`, ephemeral: false });
            } else {
                await interaction.followUp({ content: `? - The user ${user.username} has been warned for the following reason: ${reason}`, ephemeral: false });
            }
        }

        let message = `You have been warned for the following reason: ${reason}`;
        if (comment) {
            message += `. Comment: ${comment}`;
        }

        user.send(message).catch(console.error);
    } else if (commandName === 'warn-remove') {
        if (!authorizedUsers.includes(interaction.user.id)) {
            interaction.reply({ content: '❌ - You are not allowed to use this command', ephemeral: false });
            return;
        }

        const user = interaction.options.getUser('user');
        const warnIndex = interaction.options.getInteger('warn_index');

        // Lire le fichier JSON
        let data;
        try {
            data = JSON.parse(fs.readFileSync('warns.json', 'utf8'));
        } catch (err) {
            data = {};
        }

        // Supprimer l'avertissement
        if (user.id in data && data[user.id].count > 0 && warnIndex >= 0 && warnIndex < data[user.id].count) {
            data[user.id].count--;
            data[user.id].reasons.splice(warnIndex, 1); // supprime l'avertissement à l'index spécifié
        } else {
            await interaction.reply({ content: `Invalid warn index for user ${user.username}.`, ephemeral: true });
            return;
        }

        // Écrire les données modifiées dans le fichier JSON
        fs.writeFileSync('warns.json', JSON.stringify(data, null, 2));

        // Envoyer un message de confirmation
        await interaction.reply({ content: `Warn number ${warnIndex + 1} has been removed from user ${user.username}. They now have ${data[user.id].count} warns.`, ephemeral: true });
    } else if (commandName === 'warn-list') {
        const user = interaction.options.getUser('user');

        // Lire le fichier JSON
        let data;
        try {
            data = JSON.parse(fs.readFileSync('warns.json', 'utf8'));
        } catch (err) {
            data = {};
        }

        // Vérifier si l'utilisateur a des avertissements
        if (user.id in data && data[user.id].count > 0) {
            const warnList = data[user.id].reasons.map((reason, index) => `${index + 1}: ${reason} (Date: ${data[user.id].dates[index]})`).join('\n');
            await interaction.reply({ content: `Warns for user ${user.username}:\n${warnList}`, ephemeral: false });
        } else {
            await interaction.reply({ content: `User ${user.username} has no warns.`, ephemeral: false });
        }
    } else if (commandName === 'calculator') {
        simplydjs.calculator(interaction, {
            // options (optional)
            embed: {
                title: "Calculator",
                color: "#406dbc",
                footer: {
                    text: "test footer",
                    iconURL: "https://i.imgur.com/siVDhIZ.png"
                }
            },
            buttons: {
                numbers: ButtonStyle.Secondary,
                symbols: ButtonStyle.Primary,
                delete: ButtonStyle.Danger
            }
        })
    } else if (commandName === 'achievement') {
        const text = interaction.options.getString('text');

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🏆 - Achievement unlocked!')
            .setImage(`https://api.alexflipnote.dev/achievement?text=${encodeURIComponent(text)}`);

        await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'hexcolor') {
        const hexValue = interaction.options.getString('value');

        if (hexValue.length > 6) {
            interaction.reply('⚠ - According to coding law, Hexadecimal colors only have 6 value, from 000000 (black) to FFFFFF (white). first 2 value is red, second 2 value is green, and last 2 value is blue. So if you want complete choma green, you can use 00FF00. So please, give me a valid hex color code.');
            return;
        }
        else if (hexValue.length > 6) {
            interaction.reply('⚠ -  According to coding law, Hexadecimal colors only have 6 value, from 000000 (black) to FFFFFF (white). first 2 value is red, second 2 value is green, and last 2 value is blue. So if you want complete choma green, you can use 00FF00. So please, give me a valid hex color code.');
            return;
        }


        const embed = new EmbedBuilder()
            .setColor(`#${hexValue}`)
            .setTitle(`🎨 - the value you give me is ${hexValue}. Here is your color!`)
            .setImage(`https://api.alexflipnote.dev/colour/image/${encodeURIComponent(hexValue)}`);
        await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'tonetags') {

        const toneDescriptions = require('./toneDescriptions.json');

        const tonetags = interaction.options.getString('tone');

        if (toneDescriptions[tonetags]) {
            const toneNames = (`${tonetags} - ${toneDescriptions[tonetags].name}`);
            const embed = new EmbedBuilder()
                .setTitle(toneNames)
                .setDescription(`${tonetags} means ${toneDescriptions[tonetags].name} - ${toneDescriptions[tonetags].comment}\n exemple : ${toneDescriptions[tonetags].example}`)
                .setFooter({ text: 'Source: AVU guide' });

            await interaction.reply({ embeds: [embed] });
        } else {
            // Gérer le cas où tonetags n'est pas une clé valide dans toneDescriptions
            await interaction.reply({ content: `No tonetag found. ` });
        }
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

    if (member.guild.id !== '1142724602057998338') {
        console.log('The member did not join the specified server.');
        return;
    }

    console.log('The member has joined the specified server.');
    const blacklist = require('./blacklist.json');
    let isBlacklisted = blacklist.hasOwnProperty(member.user.id);
    let message = `New member: ${member.user.username} (${member.displayName})\nAccount creation date: ${member.user.createdAt.toDateString()}\nIs blacklisted: ${isBlacklisted ? 'Yes' : 'No'}`;

    console.log('Message created.');

    // Check if the account is less than a month old
    // If an account is less than a month old, it might be an alt account
    // so adding this security message
    if (new Date() - member.user.createdAt < 1000 * 60 * 60 * 24 * 30) {
        message += '\n:warning: - **This account is less than one month old!** - This might be a alt account.';
        console.log('The account is less than one month old.');
    }
    // Check if the account is less than two weeks old
    // If an account is less than two weeks old, it might be dangerous
    // so adding this security message
    if (new Date() - member.user.createdAt < 1000 * 60 * 60 * 24 * 14) {
        message += '\n<:0x:1142855597897830603> - **This account is less than two weeks old!** - This account might be dangerous!';
        console.log('The account is less than two weeks old.');
    }
    // Check if the account is less than 3 days old
    // If an account is less than 3 days old, it might be dangerous
    // so adding this security message plus might take action???
    if (new Date() - member.user.createdAt < 1000 * 60 * 60 * 24 * 3) {
        message += '\n<:catnay:1201449880829317191> - **This account is less than three days old!** - This account might be dangerous!';
        console.log('The account is less than three days old.');
    }


    const channel = await member.guild.channels.fetch('1211299684123942932');
    console.log('Channel fetched.');

    channel.send(message);
    console.log('Message sent.');
});

//Starboard
client.on('messageReactionAdd', async (reaction, user) => {

    simplydjs.starboard(reaction, {
        channelId: '1208013793460748348', // required
        emoji: '⭐',
        strict: true,
    })
});

// Only once when the bot is ready
client.on('ready', () => {
    const status = "CryOS 3.1"
    var d = new Date();
    const os = require('os');

    // Enregistrez l'heure de d but
    const start = Date.now();
    // Une fois que le bot a d marr 
    const end = Date.now();

    console.log(`${client.user.tag} is starting...\n\nOS Name: ${os.type()} v${os.release()} \nCopyright (c) 2024, APLEBOT team, inc\n\nProcessor: ${os.cpus()[0].model}\nMemory test: ${Math.round(os.totalmem() / 1024 / 1024)} M Ok\n\n Startup time: ${end - start} ms\n current time :` + new Date().toLocaleString() + `\n\nAward Plug and Play BIOS Exension v1.0A\nInictialize Plug and Play Card...\nPnP init Completed\n\nDetecting Primary Master ... ${os.userInfo().username}\nDetecting Primary System ... Ubuntu\nDetecting Secondary Master ... Skip\nDetecting Secondary System ... none_\n\nPress <DEL> to enter SETUP, <ALT-F2> to enter PER-SERVER SETTINGS \n\n\n\n Loading and injecting ${status} custom OS in ${client.user.tag}`);
    console.log(chalk.green(`Ready! Logged in as ${client.user.tag}\nCurrent activity: ${status} with status: ${status}`));


    client.user.setActivity(`${status}`, {
        type: ActivityType.Watching,
    })
    console.log(`actual status of the client: ${status}. `)
})

// Log in to the bot
// require('./server')();
client.login(config.token)