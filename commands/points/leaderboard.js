const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const axios = require('axios');
const pagination = require('discord.js-pagination');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Display the point leaderboard.'),
    async execute(interaction) {
        const serverID = interaction.guild.id;

        let leaderboard;
        try {
            const response = await axios.get(`http://88.198.66.157:27033/leaderboard/${serverID}`);
            leaderboard = Object.entries(response.data).map(([userID, points]) => ({ userID, points }));
        } catch (error) {
            console.error(error);
            return interaction.reply('Failed to fetch leaderboard data.');
        }

        if (!Array.isArray(leaderboard)) {
            return interaction.reply('Leaderboard data is not available.');
        }

        const pages = [];
        for (let i = 0; i < leaderboard.length; i += 10) {
            pages.push(leaderboard.slice(i, i + 10));
        }

        function generateEmbed(page, pageIndex, totalPages) {
            return new EmbedBuilder()
                .setColor(0xa9f6f6)
                .setTitle(`**${interaction.guild.name}** - Point Leaderboard **[${page.length}]**`)
                .setAuthor({ name: 'all the server', iconURL: 'https://i.imgur.com/maxsKSF.png', url: 'http://www.betawolfy.xyz' })
                .setDescription(`${page
                    .map((lb, index) => `${index + 1 + pageIndex * 10} - <@${lb.userID}> - **${lb.points}** point`)
                    .join('\n')}`)
                .setFooter({ text: `Page ${pageIndex + 1} / ${totalPages} | A`, iconURL: 'https://i.imgur.com/fsRAPDM.png' });
        }

        let currentPageIndex = 0;
        interaction.reply({ embeds: [generateEmbed(pages[currentPageIndex], currentPageIndex, pages.length)], fetchReply: true })
            .then(replyMessage => {
                if (pages.length > 1) {
                    replyMessage.react('⬅️');
                    replyMessage.react('➡️');

                    const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === interaction.user.id;
                    const collector = replyMessage.createReactionCollector({ filter, time: 60000 });

                    collector.on('collect', reaction => {
                        replyMessage.reactions.removeAll().then(async () => {
                            reaction.emoji.name === '⬅️' ? currentPageIndex-- : currentPageIndex++;
                            replyMessage.edit({ embeds: [generateEmbed(pages[currentPageIndex], currentPageIndex, pages.length)] });
                            if (currentPageIndex !== 0) await replyMessage.react('⬅️');
                            if (currentPageIndex + 1 < pages.length) await replyMessage.react('➡️');
                        });
                    });
                }
            });
    },
};