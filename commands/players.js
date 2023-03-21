const { SlashCommandBuilder } = require('discord.js');
const { testCon } = require('../main.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('players')
		.setDescription('Replies with list of currently online players'),
	async execute(interaction)
	{
		await interaction.reply({ content: `Players ${testCon}`, ephemeral: true });
	},
};