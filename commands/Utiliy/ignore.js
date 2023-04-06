const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ignore')
		.setDescription('Silence warnings for a given zone'),
	async execute(interaction) {
		return interaction.reply('OK boss');
	},
};