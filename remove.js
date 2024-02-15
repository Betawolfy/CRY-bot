const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Début de la suppression des commandes slash.');

        // Récupérer toutes les commandes slash
        const commands = await rest.get(
            Routes.applicationGuildCommands(clientId, guildId),
        );

        // Supprimer toutes les commandes slash
        for (const command of commands) {
            await rest.delete(
                Routes.applicationGuildCommand(clientId, guildId, command.id),
            );
        }

        console.log('Suppression des commandes slash terminée.');
    } catch (error) {
        console.error(error);
    }
})();