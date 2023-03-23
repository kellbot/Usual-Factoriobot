const fs = require('node:fs');
const chokidar = require('chokidar');
const path = require('node:path');
const { factorioInit, relayDiscordMessage } = require('./factorio.js');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token, channelId, consoleLog, debugId } = require('./config.json');

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

function readLastLine(filepath)
{
	fs.readFile(filepath, 'utf-8', function(err, data)
	{
		// get last line of file.
		if (err) throw err;
		const lines = data.trim().split('\n');
		const lastLine = lines.slice(-1)[0];

		parseMessage(lastLine);
	});


}

function parseMessage(msg)
{
	const index = msg.indexOf(']');
	const indexName = msg.indexOf(': ');
	const newMsg = '`' + msg.slice(index + 2, indexName) + '`' + msg.slice(indexName);

	if (msg.length && index > 1)
	{
		if (msg.slice(1, index).includes('CHAT') && !msg.includes('<server>'))
		{
			relayFactorioMessage(newMsg);
		}
		else if (!msg.includes('<server>'))
		{
			// Send incoming message from the server, which has no category or user to the Discord console channel
			console.log(msg);
		}
	}
}

function relayFactorioMessage(message)
{
	const channel = discord.channels.cache.get(channelId);
	channel.send(message);
//	discord.users.send(debugId, message);
}

// connect to discord
discord.login(token);
discord.on('messageCreate', (message) =>
{
	if (message.flags.has('Ephemeral')) return;
	console.log(message.content);
	const messageString = `${message.author.username}: ${message.content}`;
	relayDiscordMessage(messageString);
});

discord.on('ready', () =>
{
	chokidar.watch(consoleLog, { ignored: /(^|[/\\])\../ }).on('all', (event, filepath) =>
	{
		readLastLine(consoleLog);
	});

});

factorioInit();