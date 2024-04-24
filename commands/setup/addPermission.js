const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, PermissionFlagsBits } = require('discord.js'); // Import Permissions from discord.js
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-permission')
        .setDescription('Add a permission to a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to add the permission to.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('permission')
                .setDescription('The permission to add. Make sure to use the full permission name.')
                .setRequired(true)
                .addChoices(
                    // Developer permissions
                    { name: 'Developer', value: 'permission.devmode' },
                    // Admin permissions
                    { name: 'All permissions', value: 'permission.bot.all' },
                    // Points permissions
                    { name: 'Add points', value: 'permission.points.add' },
                    { name: 'Remove Points', value: 'permission.points.remove' },
                    // moderations permissions
                    { name: 'Add warn', value: 'permission.warn.add' },
                    { name: 'Remove warn', value: 'permission.warn.remove' },
                    { name: 'BLCKList', value: 'permission.blacklist.submit' },
                    { name: 'ban', value: 'permission.ban' }

                )),
    async execute(interaction) {

        const serverID = interaction.guild.id;
        const user = interaction.options.getUser('user');
        const userID = user.id;
        const permission = interaction.options.getString('permission');

        
        if (!interaction.inGuild()) {
            return await interaction.reply('<:outline_warning_white_36dp:1232681511438909503> - **403** - You can\'t use this command in DM.');
        }

        const member = await interaction.guild.members.fetch(interaction.user.id);
        const permissionsResponse = await axios.get(`http://88.198.66.157:27033/command/getPermissions/${serverID}/${userID}`);
        const userPermissions = permissionsResponse.data.permissions || [];

        if (!userPermissions.includes('permission.devmode') || !userPermissions.includes('permission.admin')) {
            return await interaction.reply('You do not have the required permissions to execute this command.')
        };


        if (permission === 'permission.devmode' && !interaction.user.id === '432116536866766849') {
            return await interaction.reply('<:outline_error_white_36dp:1232681509274517625> - **500** - You can\'t add the developer permission to someone else. Because uuh.. I\'m the developer. I\'m the only one who can have this permission. Sorry. Bye. Bye.\n -the developer-');
        }

        try {
            await axios.put(`http://88.198.66.157:27033/command/addPermission/${serverID}/${userID}/${permission}`);
            await interaction.reply(`<:round_done_white_48dp:1221775452448755852> - **200** - La permission ${permission} has been added ${user.username}.`);
        } catch (error) {
            console.error(error);
            await interaction.reply('<:outline_error_white_36dp:1232681509274517625> - **500** - An error occurred while adding the permission.');
        }
    },
};