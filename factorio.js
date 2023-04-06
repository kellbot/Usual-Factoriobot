const Rcon = require('rcon');
const cron = require('node-cron');
const { host, port, password } = require('./data/config.json');
const { format, parse } = require('lua-json');

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
	}).on('error', function(err)
	{
		console.log('Error: ' + err);
	}).on('end', function()
	{
		activeConnection = false;
		console.log('Connection closed');
	});
	factorio.connect();

	// This data doesn't actually change very often so every 6 hours is plenty
	cron.schedule('0 */6 * * *', () =>
	{
		updateCME();
	});
	// because ticks can vary in length we need to update the current tick regularly
	cron.schedule('* * * * *', () =>
	{
		factorio.send('/silent-command rcon.print("[TICK] " .. game.tick)');
		factorio.send('/players online');
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

	// update the current tick as well
	factorio.send('/silent-command rcon.print("[TICK] " .. game.tick)');

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
			let data = string.replace(prefixes[property], '');
			if (property == 'cme')
			{
				console.log(data);
				// convert = to : for json parsing
				data = parse('return ' + data);

			}
			stats[property] = data;

		}
	}

}


module.exports = { factorio, factorioInit, updateOnlinePlayers, stats, relayDiscordMessage, isConnected, updateCME };