"use strict";
// dao/gameDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');

// 使用连接池，提升性能
var pool  = mysql.createPool($conf.mysql);


/*
    type: 
        1: 猜数字游戏
*/

// CRUD SQL语句
var $sql = {
    insert:'INSERT INTO game(id, postId, userId, status, code, type) VALUES(0,?,?,1,?,?)',
    update:'update game set status=? where id=?',
    queryById: 'select * from game where id=?',
    queryUniqueCode: 'select * from game where status = 1 and code = ?',
};

function getRandomCode(connection, callback){
    var size = 4;

    require('crypto').randomBytes(16, function(ex, buf) {  
        var token = buf.toString('hex');
        var code = "";
        for (var i = 0; i < token.length; i++){
            if (token.charAt(i) >= '0' && token.charAt(i) <= '9'){
                code += token.charAt(i);
            }
            if (code.length == 4) {
                break;
            }
        }

        connection.query($sql.queryUniqueCode, code, function(err, result) {
            if (err){
                callback(err);
                return;
            }
            if (result.length == 0){
                callback(err, code);
                return;
            }

            getRandomCode(connection, callback);        
        }); 
    });
}

module.exports = {
    add: function (param, callback) {
        pool.getConnection(function(err, connection) {
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                callback(err);
                return;
            }

            getRandomCode(connection, function(err, code){
                if (err) {
                    console.log('[INSERT ERROR] - ', err.message);
                    callback(err);
                    return;
                }

                // 建立连接，向表中插入值
                connection.query($sql.insert, [param.postId, param.userId, code, param.type], function(err, result) {
                    result.code = code;
                    callback(err, result);

                    // 释放连接 
                    connection.release();
                });
            });
        });
    },

    update: function (param, callback) {
        
        pool.getConnection(function(err, connection) {
            connection.query($sql.update, 
                [param.status, param.id], function(err, result) {
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

    queryUniqueCode: function (param, callback) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryUniqueCode, param.code, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    }
    
};
