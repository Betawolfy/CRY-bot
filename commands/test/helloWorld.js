const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('helloworld')
        .setDescription('Says hello to the world!'),
    async execute(interaction) {
        await interaction.reply('Hello, world!');
    },
};