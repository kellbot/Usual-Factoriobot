const Rcon = require('rcon');
const { host, port, password } = require('./config.json');

// connect to factorio
const factorio = new Rcon(host, port, password);
let activeConnection = false;
const stats = { playerString: 'Please try that again' };


const factorioInit = () =>
{

	factorio.on('auth', function()
	{
		activeConnection = true;
		console.log('Connected');
		// update stats
		factorio.send('/players online');
	}).on('response', function(str)
	{
		stats.playerString = parseResponse(str);
		console.log(str);
	}).on('error', function(err)
	{
		console.log('Error: ' + err);
	}).on('end', function()
	{
		console.log('Connection closed');
	});
	factorio.connect();
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
	return string;
}

module.exports = { factorio, factorioInit, updateOnlinePlayers, stats, relayDiscordMessage, isConnected };