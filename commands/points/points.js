const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('points')
        .setDescription('Affiche le nombre de points que vous avez.')
        .addUserOption(option => 
            option.setName('user')
            .setDescription('L\'utilisateur pour lequel afficher les points')
            .setRequired(false)
        ),
    async execute(interaction) {
        const serverID = interaction.guild.id;
        const user = interaction.options.getUser('user') || interaction.user;
        const userID = user.id;

        try {
            const response = await axios.get(`http://88.198.66.157:27033/command/getPoints/${serverID}/${userID}`);
            const points = response.data.points;
            await interaction.reply(`${user.username} a ${points} points.`);
        } catch (error) {
            console.error(error);
            await interaction.reply('Une erreur est survenue lors de la récupération des points.');
        }
    },
};