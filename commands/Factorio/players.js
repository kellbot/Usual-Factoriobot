const { SlashCommandBuilder } = require('discord.js');
const { updateOnlinePlayers, stats } = require('../../factorio.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('players')
		.setDescription('Replies with list of currently online players'),
	async execute(interaction)
	{
		updateOnlinePlayers();
		await interaction.deferReply({ ephemeral: true });
		await wait(500);
		await interaction.editReply({ content: stats.players, ephemeral: true });
	},
};