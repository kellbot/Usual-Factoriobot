const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'data/database.sqlite',
});

const Ignored = sequelize.define('ignored', {
    key: {
        type: Sequelize.STRING,
        unique: true,
    },
    surface: Sequelize.TEXT,
    set_by: Sequelize.STRING,
    last_updated: Sequelize.DATE
});

module.exports = { Ignored };
