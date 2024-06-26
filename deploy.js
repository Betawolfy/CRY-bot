const { REST, Routes } = require('discord.js');
const { clientId, guildIds, token } = require('./config.json'); // guildIds should be an array
//const config = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const foldersPath = path.join(__dirname, './commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    for (const guildId of guildIds) {
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
      console.log(`Successfully reloaded ${data.length} application (/) commands for guild ${guildId}.`);
    }
  } catch (error) {
    console.error(error);
  }
})();

// // const fs = require('fs');
// // const { REST } = require('@discordjs/rest');
// // const { Routes } = require('discord-api-types/v9');
// // const { clientId, guildId, token } = require('./config.json');

// // const commands = [];
// // const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// // for (const file of commandFiles) {
// //   const command = require(`./commands/${file}`);
// //   commands.push(command.data);
// // }

// // const rest = new REST({ version: '9' }).setToken(token);

// // (async () => {
// //   try {
// //     console.log('Started refreshing application (/) commands.');

// //     await rest.put(
// //       Routes.applicationGuildCommands(clientId, guildId),
// //       { body: commands },
// //     );

// //     console.log('Successfully reloaded application (/) commands.');
// //   } catch (error) {
// //     console.error(error);
// //   }
// // })();

// const fs = require('fs');
// const { SlashCommandBuilder } = require('@discordjs/builders');
// const { REST } = require('@discordjs/rest');
// const { Routes } = require('discord-api-types/v9');
// const { clientId, guildIds, token } = require('./config.json');

// const commands = [
//     new SlashCommandBuilder().setName('help').setDescription('Show the help message'),
//     new SlashCommandBuilder().setName('ping').setDescription('Makes hard calcuations to show the bot is alive and well!'),
//     new SlashCommandBuilder().setName('add-permission').setDescription('Ajoute une permission à un utilisateur.').addUserOption(option => option.setName('user').setDescription('L\'utilisateur à qui ajouter la permission.')
//         .setRequired(true)).addStringOption(option => option.setName('permission').setDescription('La permission à ajouter.').setRequired(true)
//             .addChoices(
//                 // Developer permissions
//                 { name: 'Developer', value: 'permission.devmode' },
//                 // Admin permissions
//                 { name: 'All permissions', value: 'permission.bot.all' },
//                 // Points permissions
//                 { name: 'Add points', value: 'permission.points.add' },
//                 { name: 'Remove Points', value: 'permission.points.remove' },
//                 // moderations permissions
//                 { name: 'Add warn', value: 'permission.warn.add' },
//                 { name: 'Remove warn', value: 'permission.warn.remove' },
//                 { name: 'BLCKList', value: 'permission.blacklist.submit' },
//                 { name: 'ban', value: 'permission.ban' }

//             ))
//     // new SlashCommandBuilder().setName('add').setDescription('Adds points to the user.').addUserOption(option => option.setName('user').setDescription('L\'utilisateur cible').setRequired(true)).addIntegerOption(option => option.setName('amount').setDescription('Le nombre de points à ajouter').setRequired(true)),
//     // new SlashCommandBuilder().setName('remove').setDescription('Removes points to the user.').addUserOption(option => option.setName('user').setDescription('L\'utilisateur cible').setRequired(true)).addIntegerOption(option => option.setName('amount').setDescription('Le nombre de points à retirer').setRequired(true)),
//     // new SlashCommandBuilder().setName('points').setDescription('Shows peoples points.').addUserOption(option => option.setName('user').setDescription('L\'utilisateur cible').setRequired(true)),
//     // new SlashCommandBuilder().setName('cowsay').setDescription('Make a cow say something.').addStringOption(option =>option.setName('text').setDescription('The text the cow should say').setRequired(true)),
//     // new SlashCommandBuilder().setName('didyoumean').setDescription('send a meme like google believe you say something wrong').addStringOption(option => option.setName('top').setDescription('The top text in the searchbar').setRequired(true)).addStringOption(option => option.setName('bottom').setDescription('The bottom text the did you mean thing').setRequired(true)),
//     // new SlashCommandBuilder().setName('howmuch').setDescription('Shows how much point left before the next rank.').addStringOption(option =>option.setName('career').setDescription('S lectionnez une carri re').setRequired(true).addChoices({ name: 'Normal', value: 'normal' })).addStringOption(option =>option.setName('current').setDescription('Votre nombre actuel de points').setRequired(true)).addUserOption(option => option.setName('user').setDescription('L\'utilisateur cible').setRequired(true)),
//     // new SlashCommandBuilder().setName('leaderboard').setDescription('Shows the leaderboard of the server.'),
//     // new SlashCommandBuilder().setName('checkifblacklist').setDescription('Check if a user is blacklisted').addUserOption(option =>option.setName('user_id').setDescription('the user ID you want to check').setRequired(true)),
//     // new SlashCommandBuilder().setName('warn-add').setDescription('Warn a user').addUserOption(option =>option.setName('user_id').setDescription('the user ID you want to warn').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('the reason for the warn').setRequired(true)).addStringOption(option => option.setName('comment').setDescription('a comment for the warn').setRequired(false)),
//     // new SlashCommandBuilder().setName('warn-remove').setDescription('Remove a specific warn from a user').addUserOption(option => option.setName('user').setDescription('The user to remove the warn from').setRequired(true)).addIntegerOption(option => option.setName('warn_index').setDescription('The index of the warn to remove').setRequired(true)),
//     // new SlashCommandBuilder().setName('warn-list').setDescription('Show the warns of a user').addUserOption(option =>option.setName('user').setDescription('the user Dyou want to see the warns').setRequired(true)),
//     // new SlashCommandBuilder().setName('calculator').setDescription('for lazy people who don\'t want to use their brain'),
//     // new SlashCommandBuilder().setName('achievement').setDescription('Generates a "Minecraft Achievement" meme ').addStringOption(option => option.setName('text').setDescription('The text to display on the achievement').setRequired(true)),
//     // new SlashCommandBuilder().setName('hexcolor').setDescription('Give a hex color code and get a preview of it.').addStringOption(option => option.setName('value').setDescription('Your hex color code.').setRequired(true)),
//     // new SlashCommandBuilder().setName('tonetags').setDescription('Displays a list of tone tags.').addStringOption(option =>option.setName('tone').setDescription('The tone tag you want to see. don\'t forget the slash.').setRequired(true)),
//     // new SlashCommandBuilder().setName('banid').setDescription('Ban a user by their ID').addStringOption(option => option.setName('user_id').setDescription('The user ID you want to ban').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('The reason for the ban').setRequired(true)),
//     // Ajoutez ici d'autres commandes
// ].map(command => command.toJSON());

// const rest = new REST({ version: '9' }).setToken(token);

// (async () => {
//     try {
//         console.log(`Started refreshing ${commands.length} application (/) commands.`);
//         for (const guildId of guildIds) {
//             const data = await rest.put(
//                 Routes.applicationGuildCommands(clientId, guildId),
//                 { body: commands },
//             );
//             console.log(`Successfully reloaded ${data.length} application (/) commands for guild ${guildId}.`);
//         }
//     } catch (error) {
//         console.error(error);
//     }
// })();