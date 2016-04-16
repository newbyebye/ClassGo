"use strict";
// dao/userDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');

// 使用连接池，提升性能
var pool  = mysql.createPool($conf.mysql);


// CRUD SQL语句{"username":"demo", "password":"demo", "fullname":"fullname", "openID": "openID"}
var $user = {
    insert:'INSERT INTO user(id, username, password, openID, fullname, nickname, studentNo, city, photo) VALUES(0,?,?,?,?,?,?,?,?)',
    update:'update user set email=?, emailVerified=?, gender=?, photo=?, fullname=?, mobile=?, region=?, school=?, brief=? where id=?',
    delete: 'delete from user where id=?',
    login: 'select * from user where username=? and password=?',
    queryById: 'select id, username, email, emailVerified, gender, photo, fullname, mobile, region, school, brief, createAt, updateAt from user where id=?',
    queryAll: 'select id, username, email, emailVerified, gender, photo, fullname, mobile, region, school, brief, createAt, updateAt from user',
    queryByOpenID: 'select * from user where openID=?',
};

module.exports = {
    add: function (param, callback) {

        pool.getConnection(function(err, connection) {
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                callback(err);
                return;
            }

            if (param.openID){
                // reg from wechat
                connection.query($user.queryByOpenID, param.openID, function(err, result) {
                    if (err || result.length == 0){
                        // new user
                        connection.query($user.insert, [param.username, param.password, param.openID, param.fullname, param.nickname, param.studentNo, param.city, param.photo], function(err, result) {
                            callback(err, result);
                            // 释放连接 
                            connection.release();
                        });

                        return;
                    }
                    else{
                        var userId = result[0].id;
                        // update user
                        // TODO: 如果有定义值则更新
                        connection.query('update user set username=?,password=?,fullname=?,studentNo=? where openID=?', [param.username, param.password, param.fullname, param.studentNo,param.openID], function(err, result) {
                            result.insertId = userId;
                            callback(err, result);
                            // 释放连接 
                            connection.release();
                        });

                        return;
                    }
                });
            }
            else {
                // new user
                connection.query($user.insert, [param.username, param.password, param.openID, param.fullname, param.nickname, param.studentNo, param.city, param.photo], function(err, result) {
                    callback(err, result);
                    // 释放连接 
                    connection.release();
                });
            }          
        });
    },
    /*
    delete: function (param, callback) {
        // delete by Id
        pool.getConnection(function(err, connection) {
            connection.query($user.delete, param.id, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },*/
    update: function (param, callback) {
        
        pool.getConnection(function(err, connection) {
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                callback(err);
                return;
            }
            // email=? emailVerified=? gender=? photo=? fullname=? mobile=? region=? school=? brief=? where id=?
            connection.query($user.update, 
                [param.email, param.emailVerified, param.gender, param.photo, param.fullname, 
                    param.mobile, param.region, param.school, param.brief, param.id], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });

    },
    login: function(param, callback) {
        pool.getConnection(function(err, connection) {
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                callback(err);
                return;
            }

            connection.query($user.login, [param.username, param.password], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    queryById: function (param, callback) {
        pool.getConnection(function(err, connection) {
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                callback(err);
                return;
            }

            connection.query($user.queryById, param.id, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    queryAll: function (param, callback) {
        pool.getConnection(function(err, connection) {
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                callback(err);
                return;
            }
            
            connection.query($user.queryAll, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    }
    
};
