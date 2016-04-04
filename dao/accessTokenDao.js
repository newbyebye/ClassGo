// dao/userDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');

// 使用连接池，提升性能
var pool  = mysql.createPool($conf.mysql);

// CRUD SQL语句
var accessToken = {
    insert:'INSERT INTO accessToken(id, userId, token, ttl, ipAddr) VALUES(0,?,?,?,?)',
    update:'update user set name=?, age=? where id=?',
    delete: 'delete from accessToken where userId=? and token=?',
    queryById: 'select * from user where id=?',
    queryAll: 'select * from user'
};


module.exports = {
    add: function (param, callback) {
        pool.getConnection(function(err, connection) {
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                callback(err);
                return;
            }   

            // 建立连接，向表中插入值
            // 'INSERT INTO user(id, username, password) VALUES(0,?,?)',
            connection.query(accessToken.insert, [param.userId, param.token, param.ttl, param.ipAddr], function(err, result) {

                callback(err, result);
                
                // 释放连接 
                connection.release();
            });
        });
    },

    delete: function (param, callback) {
        // delete by Id
        pool.getConnection(function(err, connection) {
            connection.query($sql.delete, [param.userId, param.token], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    }
};
