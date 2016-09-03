 "use strict";
// dao/lessonDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');

/* 
create table sign (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    lessonId        BIGINT NOT NULL,
    userId          BIGINT NOT NULL,
    lng             decimal(10, 7),
    lat             decimal(10, 7),
    createAt        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt        TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/
// 使用连接池，提升性能
var pool  = mysql.createPool($conf.mysql);

// CRUD SQL语句
var $sql = { 
    insert:'INSERT INTO sign(id, lessonId, userId, lng, lat) VALUES(0,?,?,?,?)',
    update:'update sign set lng=?, lat=? where lessonId=? and userId=?',
    delete: 'delete from sign where id=?',
    queryById: 'select * from sign where lessonId=? and userId=?',
    queryAll: 'select * from sign where lessonId=?',
    report: 'select * from view_lesson_sign where postId=?',
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
            connection.query($sql.insert, [param.lessonId, param.userId, param.lng, param.lat], function(err, result) {

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
                [param.lng, param.lat, param.lessonId, param.userId], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    
    queryById: function (param, callback) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryById, [param.lessonId, param.userId], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    queryAll: function (param, callback) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryAll, param.lessonId, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },

    report: function (param, callback) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.report, param.postId, function(err, result) {
                console.log($sql.report, param.postId);
                callback(err, result);
                connection.release();
            });
        });
    },

};
