const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-points')
        .setDescription('Retire des points à un utilisateur.')
        .addUserOption(option =>
            option.setName('userid')
                .setDescription('L\'ID de l\'utilisateur.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('points')
                .setDescription('Le nombre de points à retirer.')
                .setRequired(true)),
    async execute(interaction) {
        const serverID = interaction.guild.id;
        const user = interaction.options.getUser('userid');
        const userID = user ? user.id : null;
        const pointsToRemove = interaction.options.getInteger('points');

        try {
            // Retirez les points de l'utilisateur
            await axios.put(`http://88.198.66.157:27033/command/remove/${serverID}/${userID}/${pointsToRemove}`);

            // Obtenez les points actuels de l'utilisateur
            const response = await axios.get(`http://88.198.66.157:27033/command/getPoints/${serverID}/${userID}`);
            const newPoints = response.data.points || 0;

            await interaction.reply(`Points retirés avec succès ! Nouveau total : ${newPoints}`);
        } catch (error) {
            console.error(error);
            await interaction.reply('Échec du retrait des points.');
        }
    },
};