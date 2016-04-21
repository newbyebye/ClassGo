 "use strict";
// dao/postUserDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');


/*  table postUser (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    postId          BIGINT NOT NULL,
    userId    BIGINT NOT NULL,
    isAssistant  boolean,
    createAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt     TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
*/
//select post.*,count(postId) as sum from post left join postUser on post.id = postUser.postId group by postId;
//select username,nickname,fullname,lessonId,postId,studentNo, sign.updateAt, sign.createAt, sign.id from user,postUser left join sign on postUser.userId = sign.userId where user.id = postUser.userId and postId=3 and (lessonId= 13 or lessonId is null) group by id;
// 使用连接池，提升性能
var pool  = mysql.createPool($conf.mysql);

// CRUD SQL语句
var $sql = { 
    insert:'INSERT INTO postUser(id, postId, userId, isAssistant) VALUES(0,?,?,?)',
    delete: 'delete from postUser where postId=? and userId=?',
    queryById: 'select * from postUser where postId=? and userId=?',
    queryAll: 'select postUser.*,user.fullname,user.studentNo from postUser,user where postId=? and user.id = postUser.userId',
    querySum: 'select count(*) as sum from postUser where postId=?',
    queryAllInfo:'select sign.id, username,nickname,fullname,lessonId,postId,studentNo,sign.updateAt, sign.createAt from user,postUser left join sign on postUser.userId = sign.userId where user.id = postUser.userId and postId=? and (lessonId= ? or lessonId is null) group by id',
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
            connection.query($sql.insert, [param.postId, param.userId, param.isAssistant], function(err, result) {

                callback(err, result);

                // 释放连接 
                connection.release();
            });
        });
    },
    
    delete: function (param, callback) {
        // delete by Id
        pool.getConnection(function(err, connection) {
            connection.query($sql.delete, [param.postId, param.userId], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    
    queryById: function (param, callback) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryById, [param.postId, param.userId], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    queryAll: function (param, callback) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryAll, param.postId, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    querySum: function(param, callback) {
        pool.getConnection(function(err, connection) {
            console.log($sql.querySum);
            connection.query($sql.querySum, param.postId, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    queryAllInfo: function (param, callback) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryAllInfo, [param.postId, param.lessonId], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    
};
