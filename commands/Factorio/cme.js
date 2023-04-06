const { SlashCommandBuilder } = require('discord.js');
const { updateCME, stats } = require('../../factorio.js');
const { Ignored } = require('../../storage.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cme')
		.setDescription('Replies with information about the upcoming CMEs'),
	async execute(interaction)
	{
		let response = 'No response from server';
		let ignored = [];
		updateCME();
		await interaction.deferReply({ ephemeral: true });
		await wait(500);
		// remove the CME prefix
		if (stats.cme)
		{
			const surfaceList = await Ignored.findAll({ attributes: ['surface']});
			
			response = 'Upcoming CMEs: \n';
			const responseString = stats.cme;

			const cmeData = responseString;
			for (const planet in cmeData)
			{
				//we are ignoring this surface
				if (surfaceList.some((obj) => obj.surface === planet))
				{
					ignored.push(planet);
				}
				else
				{
					const secondsRemaining = (cmeData[planet][0].tick - stats.tick) / 60;
					const timeRemaining = formatTime(secondsRemaining);
					response += `${planet}: ${timeRemaining} \n`;
				}
			}
			if (ignored.length > 0) 
			{
				const ignoreString = ignored.join(", ");
				response += `Ignoring warnings from: ${ignoreString}`;
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
