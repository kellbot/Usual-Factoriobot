# Usual-Factoriobot

This is a Discord bot to provide an interface between a Discord channel and Factorio via RCON. It does not require any mods for the bot, but is designed for use with the Space Exploration mod.

## Installation

This package was designed to be used by myself, and is offered without support or warranty. You can grab the [Docker image](https://hub.docker.com/r/kellbot/usual-factoriobot), 
for which it was designed, or attempt to build it from source.

You will need a folder to store persistent data (settings data, config). 
Once config_example.json into this folder and fill with your own values.

If your server does not output the console log to this folder you will need to add it as a volume.

### Example docker compose
```
  bot:
    image: "kellbot/usual-factoriobot:latest"
    volumes:
      - /opt/botdata:/opt/Factoriobot/data
      - /opt/factorio/console.log:/opt/Factoribot/data/console.log
```



## Features

The bot will monitor your channel and relay any messages posted there to the Factorio server chat. 
If you enable console logging it will also relay in-game chat to Discord.

The bot will warn about upcoming Coronal Mass Ejections at 1 day, 12 hour, 6 hour, 3 hour, and 1 hour increments.

## Commands

* `/cme` responds with the times of upcoming Coronal Mass Ejections
* `/players` reports the players currently on the server
* `/ignore [surface name]` will turn off CME warnings for the given surface while `/unignore [surface name]` turns them back on. 
