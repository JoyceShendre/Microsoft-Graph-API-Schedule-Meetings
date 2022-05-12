const mysql = require('mysql');
let db = {};

db.connection = mysql.createConnection({
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database
})
db.connection.connect(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    } else {
        console.log('connection built successfully.')
    }
})
module.exports = db;