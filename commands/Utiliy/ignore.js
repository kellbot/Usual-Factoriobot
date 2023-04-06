const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ignore')
		.setDescription('Silence warnings for a given zone')
		.addStringOption(option =>
			option.setName('surface').setDescription('The planet or surface to ignore').setRequired(true)),
	async execute(interaction) {
		const surface =  interaction.options.getString('surface');
		return interaction.reply('Looking at ' + surface);
	},
};