const Rcon = require('rcon');
const cron = require('node-cron');
const { host, port, password } = require('./config.json');

// connect to factorio
const factorio = new Rcon(host, port, password);
let activeConnection = false;
const stats = {};


const factorioInit = () =>
{

	factorio.on('auth', function()
	{
		activeConnection = true;
		console.log('Connected');
		// update stats
		factorio.send('/players online');
		factorio.send('/silent-command rcon.print("[TICK] " .. game.tick)');
		updateCME();
	}).on('response', function(str)
	{
		parseResponse(str);
		console.log(str);
	}).on('error', function(err)
	{
		console.log('Error: ' + err);
	}).on('end', function()
	{
		activeConnection = false;
		console.log('Connection closed');
	});
	factorio.connect();


	cron.schedule('*/30 * * * *', () =>
	{
		updateCME();
	});
};

// Returns boolean whether there is currently an active connection
const isConnected = () =>
{
	return activeConnection;
};

const updateOnlinePlayers = () =>
{
	if (!activeConnection)
	{
		factorioInit();
	}
	else
	{
		factorio.send('/players online');
	}

};
function updateCME()
{
	if (!activeConnection)
	{
		console.log('Could not run command, no active connection');
		return false;
	}
	const command = '/silent-command rcon.print("[CME] " .. serpent.line(remote.call("space-exploration", "get_solar_flares")))';
	factorio.send(command);
	console.log('CME Updated');

}
function relayDiscordMessage(message)
{
	if (!activeConnection)
	{
		factorioInit();
	}
	const cleanMessage = message.replace(/'/g, '\\\'');
	const command = `/silent-command game.print('[color=#7289DA][Discord]${cleanMessage}[/color]')`;
	factorio.send(command);

}

function parseResponse(string)
{
	const prefixes = { players: 'Online players ', cme:  '[CME] ', tick: '[TICK] ' };
	for (const property in prefixes)
	{
		if (string.startsWith(prefixes[property]))
		{
			stats[property] = string.replace(prefixes[property], '');
		}
	}

}

module.exports = { factorio, factorioInit, updateOnlinePlayers, stats, relayDiscordMessage, isConnected, updateCME };