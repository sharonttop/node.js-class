require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,//最大連線數量
    queueLimit: 0,//超過連線數量，限制排幾個，此處沒限制。
});

module.exports = pool.promise();//匯出promise