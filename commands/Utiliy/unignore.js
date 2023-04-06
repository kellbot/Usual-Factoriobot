const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unignore')
		.setDescription('Re-enable warnings for a given zone')
		.addStringOption(option =>
			option.setName('surface').setDescription('The planet or surface to unignore').setRequired(true)),
	async execute(interaction) {
		const surface =  interaction.options.getString('surface');
		return interaction.reply('Enabled warnings for ' + surface);
	},
};