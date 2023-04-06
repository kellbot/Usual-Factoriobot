const fs = require('node:fs');
const cron = require('node-cron');
const chokidar = require('chokidar');
const path = require('node:path');
const { factorioInit, relayDiscordMessage, stats } = require('./factorio.js');
const { Client, Collection, Events, GatewayIntentBits, ActivityType  } = require('discord.js');
const { token, channelId, consoleLog, debugId } = require('./config.json');
const { Settings } = require('./storage.js');


// Create a new Discord bot instance
const discord = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent] });

discord.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// This holds the tick of the last CME warning so it doesn't keep firing when the game is paused
let cmeLastWarned = 0;
// This holds the most recent bot stats
let botStatus = 'the factory';

discord.commands = new Collection();

const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			discord.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
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
		if (err)
		{
			console.log(err);
			return false;
		}
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

function calculateTime(seconds)
{
	const days = Math.floor(seconds / (3600 * 24));
	const hours = Math.floor(seconds % (3600 * 24) / 3600);
	const minutes = Math.floor(seconds % 3600 / 60);
	return { days: days, hours: hours, minutes: minutes };
}


function warnCME(cmeData)
{
	// Don't run if we already warned this tick (i.e. the game is paused)
	if (cmeLastWarned == stats.tick) return;

	for (const planet in cmeData)
	{
		// warn at one day, 12 hours, 6 hours, 3 hours, 1 hour
		const sph = 60 * 60;
		const warnIntervals = [sph * 24, sph * 12, sph * 6, sph * 3, sph];

		for (const seconds of warnIntervals)
		{
			// each tick lasts roughly 60 seconds
			const timeToGo = (cmeData[planet][0].tick - stats.tick) / 60;
			if (Math.abs(timeToGo - seconds) < 30)
			{
				const timeLeft = calculateTime(timeToGo);
				relayFactorioMessage(`Warning: CME headed for ${planet} in ${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes`);
				cmeLastWarned = stats.tick;
			}
		}
	}
}



function updateBotStatus(playerCount){
	if (playerCount == '0')
	{
		activityString = "the factory sleep";
	}
	else if (playerCount == '1')
	{
		activityString = `${playerCount} person grow the factory`;
	}
	else
	{
		activityString = `${playerCount} people grow the factory`;
	}
	// no need to update if it's the same
	if (activityString == botStatus) return;

	discord.user.setActivity(activityString, { type: ActivityType.Watching })
}





factorioInit();


discord.on('messageCreate', (message) =>
{
	if (message.flags.has('Ephemeral')) return;
	if (!message.content.length > 0) return;
	if (message.author.bot) return;
	
	console.log(message.content);
	const messageString = `${message.author.username}: ${message.content}`;
	relayDiscordMessage(messageString);
});

// check for CME warnings every minute
cron.schedule('* * * * *', () =>
{
	warnCME(stats.cme);
});

// Update player count every 2 minutes
cron.schedule('* * * * *', () =>
{
	const playerCount = stats.players.charAt(1);
	if (playerCount) updateBotStatus(playerCount);
});

discord.on('ready', () =>
{
	Settings.sync();
	chokidar.watch(consoleLog, { ignored: /(^|[/\\])\../ }).on('all', (event, filepath) =>
	{
		readLastLine(consoleLog);
	});

	warnCME(stats.cme);


});


// connect to discord
discord.login(token);