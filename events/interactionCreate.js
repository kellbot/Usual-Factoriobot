const { Events } = require('discord.js');
const { Ignored } = require('../storage');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction)
	{
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);
		const { commandName } = interaction;

		if (!command)
		{
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try
		{
			if (commandName === 'ignore')
			{
				const surface = interaction.options.getString('surface');
				
				try 
				{
					const ignore = await Ignored.create(
						{
						surface: surface,
						set_by: interaction.user.usernamme,
						last_updated: Date.now()
						
						});
	
					return interaction.reply(`Silencing warnings for ${surface}`);
				}
				catch (error)
				{
					if (error.name === 'SequelizeUniqueConstraintError') {
						return interaction.reply('That tag already exists.');
					}
		
					return interaction.reply('Something went wrong.');
				}
			}
			if (commandName === 'unignore')
			{
				const surfaceName = interaction.options.getString('surface');
				try
				{
					const rowCount = await Ignored.destroy({where: { surface: surfaceName } });
					if (!rowCount) return interaction.reply(`${surfaceName} wasn't being ignored.`);

					return interaction.reply(`Warnings are now on for ${surfaceName}`);
				}
				catch(error)
				{
					console.log(error);
					return interaction.reply('Something went wrong.');
				}
			}
			
			await command.execute(interaction);
		}
		catch (error)
		{
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};