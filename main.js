const fs = require('node:fs');
const path = require('node:path');
const { factorioInit, relayDiscordMessage } = require('./factorio.js');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new Discord bot instance
const discord = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent] });

discord.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));


for (const file of commandFiles)
{
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command)
	{
		discord.commands.set(command.data.name, command);
	}
	else
	{
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}


for (const file of eventFiles)
{
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once)
	{
		discord.once(event.name, (...args) => event.execute(...args));
	}
	else
	{
		discord.on(event.name, (...args) => event.execute(...args));
	}
}


// connect to discord
discord.login(token);
discord.on('messageCreate', (message) =>
{
	console.log(message.content);
	const messageString = `${message.author.username}: ${message.content}`;
	relayDiscordMessage(messageString);
});
factorioInit();