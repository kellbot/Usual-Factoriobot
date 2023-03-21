const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('players')
		.setDescription('Replies with list of currently online players'),
	async execute(interaction)
	{
		await interaction.reply({ content: 'Players shown here', ephemeral: true });
	},
};