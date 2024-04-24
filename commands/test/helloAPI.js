const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello-api')
        .setDescription('Says hello to the API!'),
    async execute(interaction) {
        const response = await axios.get('http://localhost:3000/ping');
        const data = response.data;

        interaction.reply(`API response: ${data}`);
    },
};