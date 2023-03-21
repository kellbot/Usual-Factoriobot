const Rcon = require('rcon');
const { host, port, password } = require('./config.json');

// connect to factorio
const factorio = new Rcon(host, port, password);
let activeConnection = false;


const testCon = (text) =>
{
	return 'it worked' + text;
};

const factorioInit = () =>
{

	factorio.on('auth', function()
	{
		activeConnection = true;
		console.log('Connected');
	}).on('response', function(str)
	{
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

const getOnlinePlayers = () =>
{
	if (!activeConnection)
	{
		factorioInit();
	}
	factorio.send('/players');

};

module.exports = { testCon, factorio, factorioInit, getOnlinePlayers };