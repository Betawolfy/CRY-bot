// const fs = require('fs');
// const { REST } = require('@discordjs/rest');
// const { Routes } = require('discord-api-types/v9');
// const { clientId, guildId, token } = require('./config.json');

// const commands = [];
// const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// for (const file of commandFiles) {
//   const command = require(`./commands/${file}`);
//   commands.push(command.data);
// }

// const rest = new REST({ version: '9' }).setToken(token);

// (async () => {
//   try {
//     console.log('Started refreshing application (/) commands.');

//     await rest.put(
//       Routes.applicationGuildCommands(clientId, guildId),
//       { body: commands },
//     );

//     console.log('Successfully reloaded application (/) commands.');
//   } catch (error) {
//     console.error(error);
//   }
// })();

const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
    new SlashCommandBuilder().setName('help').setDescription('Show the help message'),
    new SlashCommandBuilder().setName('ping').setDescription('Makes hard calcuations to show the bot is alive and well!'),
    new SlashCommandBuilder().setName('add').setDescription('Adds points to the user.').addUserOption(option => option.setName('user').setDescription('L\'utilisateur cible').setRequired(true)).addIntegerOption(option => option.setName('amount').setDescription('Le nombre de points à ajouter').setRequired(true)),
    new SlashCommandBuilder().setName('remove').setDescription('Removes points to the user.').addUserOption(option => option.setName('user').setDescription('L\'utilisateur cible').setRequired(true)).addIntegerOption(option => option.setName('amount').setDescription('Le nombre de points à retirer').setRequired(true)),
    new SlashCommandBuilder().setName('points').setDescription('Shows peoples points.').addUserOption(option => option.setName('user').setDescription('L\'utilisateur cible').setRequired(true)),
    new SlashCommandBuilder().setName('cowsay').setDescription('Make a cow say something.').addStringOption(option =>option.setName('text').setDescription('The text the cow should say').setRequired(true)),
    new SlashCommandBuilder().setName('didyoumean').setDescription('send a meme like google believe you say something wrong').addStringOption(option => option.setName('top').setDescription('The top text in the searchbar').setRequired(true)).addStringOption(option => option.setName('bottom').setDescription('The bottom text the did you mean thing').setRequired(true)),
    new SlashCommandBuilder().setName('howmuch').setDescription('Shows how much point left before the next rank.').addStringOption(option =>option.setName('career').setDescription('S lectionnez une carri re').setRequired(true).addChoices({ name: 'Normal', value: 'normal' })).addStringOption(option =>option.setName('current').setDescription('Votre nombre actuel de points').setRequired(true)).addUserOption(option => option.setName('user').setDescription('L\'utilisateur cible').setRequired(true)),
    // Ajoutez ici d'autres commandes
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Début du rechargement des commandes slash.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Rechargement des commandes slash terminé.');
    } catch (error) {
        console.error(error);
    }
})();