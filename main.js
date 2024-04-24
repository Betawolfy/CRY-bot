const config = require('./config')
const { Client, ActivityType, OAuth2Scopes, EmbedBuilder, ButtonBuilder, ButtonStyle, Collection, Events} = require('discord.js')
const logger = require("./logger");
const ecologger = require("./economy");
const msgLogger = require("./msgLogger");
const fs = require('fs');
const path = require('node:path');
//const fs = require('fs').promises;
const cowsay = require('cowsay');
let chalk;
const _ = require('lodash');
const { cli } = require('winston/lib/winston/config');
const pagination = require('discord.js-pagination');

import('chalk').then((module) => {
    chalk = module.default;
});

const simplydjs = require('simply-djs')
const axios = require('axios');

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

const API = "88.198.66.157:27033";

// Only once when the bot is ready
client.on('ready', () => {
    const status = "Devmode"
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
});

// command handler

client.commands = new Collection();

client.categories = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const commandsFolder = path.join(__dirname, "commands");
const categories = fs.readdirSync(commandsFolder);

for (const category of categories) {
    const details = require(`${commandsFolder}/${category}/details.json`);
    console.log(category);
    const categoryFolderContent = fs.readdirSync(path.join(commandsFolder, category));
    const commandFiles = categoryFolderContent.filter(file => file.endsWith(".js"));
    const commandsName = [];

    for (const commandFile of commandFiles) {
        const commandName = commandFile.replace(".js", "");
        /** @type {import("../types/command")} */
        const command = require(`${commandsFolder}/${category}/${commandFile}`);

        // On ajoute la commande à la catégorie.
        commandsName.push(commandName);

        // On ajoute la catégorie a la collection.
        client.commands.set(commandName, {
            category,
            ...command
        });

        console.log(`La commande ${commandName} a bien été chargée !`);
    }

    // On définit toutes les commandes dans cette catégorie.
    client.categories.set(category, {
        details,
        commandsName
    });
    console.log(`La catégorie ${category} a bien été chargée !`);
}

// Load events
client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isCommand()) {
        /**
         * Log message containing the date, channel ID, executed command, and user tag.
         * @type {string}
         */
        const logMessage = `Date: ${new Date().toISOString()}, server: ${interaction.guild.name} (${interaction.guildId}) Canal: ${interaction.channelId}, Command executed: ${interaction.commandName} par ${interaction.user.tag} (${interaction.user.id})\n`;
        fs.appendFile('./logs/logs.txt', logMessage, err => {
            if (err) {
                console.error('Erreur lors de l\' criture du fichier de log:', err);
            }
        });
    }

    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {

            const errorImages = [
                'https://i.imgur.com/ee6uxBE.png',
                'https://i.imgur.com/G9MPjzA.png',
                'https://i.imgur.com/7wBeubr.png'
            ];

            const randomImage = errorImages[Math.floor(Math.random() * errorImages.length)];



            await interaction.followUp({ content: `e`, ephemeral: true });
        } else {

            const errorImages = [
                'https://i.imgur.com/ee6uxBE.png',
                'https://i.imgur.com/G9MPjzA.png'
            ];

            const specialImage = 'https://tinyface.net/img/emotes/tinycode.png';

            // Cr er un tableau de 50 images, o  49 sont des images d'erreur normales et 1 est l'image sp ciale
            const images = [];
            for (let i = 0; i < 28; i++) {
                images.push(errorImages[i % errorImages.length]);
            }
            images.push(specialImage);

            // S lectionner une image au hasard
            const randomImage = images[Math.floor(Math.random() * images.length)];

            const errorMessages = [
                `There was an error while executing this command!\n ${randomImage}`,
                `An error occurred while executing this command!\n ${randomImage}`,
                `I'm sorry, what the actual frick you mean?\n ${randomImage}`
            ]

            const randomMessages = errorMessages[Math.floor(Math.random() * errorMessages.length)];

            await interaction.reply({ content: `<:BOOT_msg_warning0:1175379265743761428> - ${randomMessages}`, ephemeral: true });
        }
    }
});


// Log in to the bot
// require('./server')();
client.login(config.token)