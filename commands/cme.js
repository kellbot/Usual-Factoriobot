const { SlashCommandBuilder } = require('discord.js');
const { updateCME, stats } = require('../factorio.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cme')
		.setDescription('Replies with information about the upcoming CMEs'),
	async execute(interaction)
	{
		let response = 'No response from server';
		updateCME();
		await interaction.deferReply({ ephemeral: true });
		await wait(500);
		// remove the CME prefix
		if (stats.cme)
		{
			response = 'Upcoming CMEs: \n';
			let responseString = stats.cme;
			// convert = to : for json parsing
			responseString = responseString.replace(/=/g, ':');
			responseString = responseString.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3').replace(/{{/g, '[{').replace(/}}/g, '}]');
			console.log(responseString);
			const cmeData = JSON.parse(responseString);
			for (const planet in cmeData)
			{
				const secondsRemaining = (cmeData[planet][0].tick - stats.tick) / 60;
				console.log(stats.tick);
				const timeRemaining = formatTime(secondsRemaining);
				response += `${planet}: ${timeRemaining} \n`;
			}
		}

		await interaction.editReply({ content: response, ephemeral: true });
	},
};

function formatTime(seconds)
{
	const days = Math.floor(seconds / (3600 * 24));
	const hours = Math.floor(seconds % (3600 * 24) / 3600);
	const minutes = Math.floor(seconds % 3600 / 60);
	return `${days} days, ${hours} hours, ${minutes} minutes`;
}
