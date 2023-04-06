const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

const Settings = sequelize.define('settings', {
    key: {
        type: Sequelize.STRING,
        unique: true,
    },
    value: Sequelize.TEXT,
    set_by: Sequelize.STRING,
    last_updated: Sequelize.DATE
});

module.exports = { Settings };
