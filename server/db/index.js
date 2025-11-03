
const dotenv = require('dotenv');
dotenv.config();

let dbManager = null;

if (process.env.DB_MANAGER === 'postgres') {
    console.log("Using PostgreSQL DatabaseManager");
    dbManager = require('./postgresql');
} else {
    console.log("Using MongoDB DatabaseManager");
    dbManager = require('./mongodb');
}

module.exports = dbManager;


