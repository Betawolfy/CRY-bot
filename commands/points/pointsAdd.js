const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-points')
        .setDescription('Add points to a user.')
        .addUserOption(option =>
            option.setName('userid')
                .setDescription('The user ID.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('points')
                .setDescription('The number of points to add.')
                .setRequired(true)),
    async execute(interaction) {
        const serverID = interaction.guild.id;
        const user = interaction.options.getUser('userid');
        const userID = user ? user.id : null;
        const pointsToAdd = interaction.options.getInteger('points');

        try {
            // Check if the user has the required permissions
            const permissionsResponse = await axios.get(`http://88.198.66.157:27033/command/getPermissions/${serverID}/${userID}`);
            const userPermissions = permissionsResponse.data.permissions || [];

            if (!userPermissions.includes('permission.bot.all') || !userPermissions.includes('permission.points.add')) {
                await interaction.reply('You do not have the required permissions to execute this command.');
                return;
            }

            // Get the current points of the user
            const response = await axios.get(`http://localhost:3000/command/getPoints/${serverID}/${userID}`);
            const currentPoints = response.data.points || 0;

            // Add the new points to the current points
            const newPoints = currentPoints + pointsToAdd;

            // Update the points of the user
            await axios.put(`http://localhost:3000/command/add/${serverID}/${userID}/` + newPoints);

            await interaction.reply(`Points added successfully! New total: ${newPoints}`);
        } catch (error) {
            console.error(error);
            await interaction.reply('Failed to add points.');
        }
    },
};