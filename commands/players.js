const { SlashCommandBuilder } = require('discord.js');
const { getOnlinePlayers } = require('../factorio.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('players')
		.setDescription('Replies with list of currently online players'),
	async execute(interaction)
	{
		getOnlinePlayers();
		await interaction.reply({ content: 'Tried Things', ephemeral: true });
	},
};