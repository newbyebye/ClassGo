 "use strict";
// dao/lessonDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');


/* table lesson (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    postId          BIGINT NOT NULL,
    status      numeric,
    starttime   TIMESTAMP, AMP,
    updateAt    TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP
*/
// 使用连接池，提升性能
var pool  = mysql.createPool($conf.mysql);

// CRUD SQL语句
var $sql = { 
    insert:'INSERT INTO lesson(id, postId, status, starttime, timeout, lng, lat) VALUES(0,?,?,?,?,?,?)',
    update:'update lesson set status=?, lng=?, lat=? where id=?',
    delete: 'delete from lesson where id=?',
    queryById: 'select * from lesson where id=?',
    queryAll: 'select lesson.id,postId,status,authorId, date(starttime) as startdate from lesson,post where lesson.postId=postId and postId = ?  group by id order by startdate desc',
    queryLessonByPostId: 'select lesson.id,postId,status,authorId,starttime from lesson,post where lesson.postId=postId and date(starttime) = date(?) and postId = ? group by lesson.id',

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
            connection.query($sql.insert, [param.postId, param.status, param.starttime, param.timeout, param.lng, param.lat], function(err, result) {

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
                [param.status, param.lng, param.lat, param.id], function(err, result) {
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
            connection.query($sql.queryAll, param.id, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    queryLessonByPostId: function(param, callback) {
        pool.getConnection(function(err, connection) {
            console.log(err);
            console.log($sql.queryLessonByPostId + param.id + param.date);
            connection.query($sql.queryLessonByPostId, [param.date, param.id], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    }
    
};
