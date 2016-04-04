"use strict";
// dao/userDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');

// 使用连接池，提升性能
var pool  = mysql.createPool($conf.mysql);

// CRUD SQL语句
var $sql = {
    insert:'INSERT INTO post(id, title, body, authorId) VALUES(0,?,?,?)',
    update:'update post set title=?, body=? where id=?',
    delete: 'delete from post where id=?',
    queryById: 'select * from post where id=?',
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
            connection.query($sql.insert, [param.title, param.body, param.authorId], function(err, result) {

                callback(err, result);

                // 释放连接 
                connection.release();
            });
        });
    },
    
    delete: function (param, callback) {
        // delete by Id
        pool.getConnection(function(err, connection) {
            connection.query($sql.delete, param.id, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },

    update: function (param, callback) {
        
        pool.getConnection(function(err, connection) {
            connection.query($sql.update, 
                [param.title, param.body, param.id], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    
    queryById: function (param, callback) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryById, param.id, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    queryAll: function (param, callback) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryAll, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    }
    
};
