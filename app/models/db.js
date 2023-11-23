const mysql = require('mysql');
const dbconfig = require('../config/db.config');

const db = mysql.createConnection({
    host: dbconfig.HOST,
    user: dbconfig.USER,
    password: dbconfig.PASSWORD,
    database: dbconfig.DATABASE
});

db.connect(error => {
    if (error) {
        console.log(error);
    } else
        console.log('connect databse successfull...');
})

module.exports = db;