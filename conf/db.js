// conf/db.js
// MySQL数据库联接配置
module.exports = {
    mysql: {
        host: '127.0.0.1', 
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATEBASE, // 前面建的user表位于些数据库中
        port: process.env.MYSQL_PORT
    }
};
