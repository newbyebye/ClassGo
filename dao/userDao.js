"use strict";
// dao/userDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');

// 使用连接池，提升性能
var pool  = mysql.createPool($conf.mysql);


// CRUD SQL语句
var $user = {
    insert:'INSERT INTO user(id, username, password) VALUES(0,?,?)',
    update:'update user set email=?, emailVerified=?, gender=?, photo=?, fullname=?, mobile=?, region=?, school=?, brief=? where id=?',
    delete: 'delete from user where id=?',
    login: 'select * from user where username=? and password=?',
    queryById: 'select id, username, email, emailVerified, gender, photo, fullname, mobile, region, school, brief, createAt, updateAt from user where id=?',
    queryAll: 'select id, username, email, emailVerified, gender, photo, fullname, mobile, region, school, brief, createAt, updateAt from user'
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
            connection.query($user.insert, [param.username, param.password], function(err, result) {

                callback(err, result);

                // 释放连接 
                connection.release();
            });
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
            connection.query($user.login, [param.username, param.password], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    queryById: function (param, callback) {
        pool.getConnection(function(err, connection) {
            connection.query($user.queryById, param.id, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    queryAll: function (param, callback) {
        pool.getConnection(function(err, connection) {
            connection.query($user.queryAll, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    }
    
};
