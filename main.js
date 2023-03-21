const fs = require('node:fs');
const path = require('node:path');
const Rcon = require('rcon');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token, host, port, password } = require('./config.json');

// Create a new Discord bot instance
const discord = new Client({ intents: [GatewayIntentBits.Guilds] });
// connect to factorio
const factorio = new Rcon(host, port, password);

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


factorio.on('auth', function()
{
	// You must wait until this event is fired before sending any commands,
	// otherwise those commands will fail.
	console.log('Authenticated');
	console.log('Sending command: help');
	factorio.send('/help');
}).on('response', function(str)
{
	console.log('Response: ' + str);
}).on('error', function(err)
{
	console.log('Error: ' + err);
}).on('end', function()
{
	console.log('Connection closed');
	process.exit();
});

factorio.connect();

const testCon = () =>
{
	return 'it worked';
};

module.exports = { testCon };