const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-permissions')
        .setDescription('Show the permissions of a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get the permissions of.')
                .setRequired(false)),
    async execute(interaction) {
        const serverID = interaction.guild.id;
        const user = interaction.options.getUser('user') || interaction.user;
        const userID = user.id;

        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || !interaction.user.id === '432116536866766849') {
            return await interaction.reply('<:outline_cancel_white_48dp:1232680902283497482> - **401** - You can\'t use this command.');
        }

        try {
        
            const permissionsResponse = await axios.get(`http://88.198.66.157:27033/command/getPermissions/${serverID}/${userID}`);
            const userPermissions = permissionsResponse.data.permissions || [];

            if (!userPermissions.includes('permission.bot.all') || !userPermissions.includes('permission.devmode')) {
                await interaction.reply('You do not have the required permissions to execute this command.');
                return;
            }

            const response = await axios.get(`http://88.198.66.157:27033/command/getPermissions/${serverID}/${userID}`);
            const permissions = response.data.permissions;
            await interaction.reply(`${user.username} a les permissions suivantes : ${permissions.join(', ')}`);
        } catch (error) {
            console.error(error);
            await interaction.reply('Une erreur est survenue lors de la récupération des permissions.');
        }
    },
};