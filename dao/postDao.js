"use strict";
// dao/userDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');

// 使用连接池，提升性能
var pool  = mysql.createPool($conf.mysql);

// CRUD SQL语句
var $sql = {
    insert:'INSERT INTO post(id, title, body, address, time, authorId) VALUES(0,?,?,?,?,?)',
    update:'update post set title=?, body=?, time=?, address=? where id=?',
    delete: 'delete from post where id=?',
    queryById: 'select post.id, title, authorId, time, address,post.createAt, post.updateAt, post.body, user.photo, user.profession, user.fullname, user.nickname from post,user where post.authorId = user.id and post.id=?',
    queryAll: 'select post.id, title, authorId, time, address,post.createAt, post.updateAt, post.body, user.photo, user.fullname, user.nickname from post,user where post.authorId = user.id',
    queryAllCount: 'select count(*) as count from post',
    queryOwner: 'select post.*, count(postId) as sum from post left join postUser on post.id = postUser.postId where post.authorId = ? group by post.id ',
    queryRegister: 'select post.id, title, authorId, time, address,post.createAt, post.updateAt, post.body, user.photo, user.fullname, user.nickname,postUser.userId from post,user,postUser where post.authorId = user.id and post.id = postUser.postId and postUser.userId=? group by post.id',
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
            connection.query($sql.insert, [param.title, param.body, param.address, param.time, param.authorId], function(err, result) {

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
                [param.title, param.body, param.time, param.address, param.id], function(err, result) {
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
    // /v1/post?filter={"where":{},"order":"ASC/DESC","skip":21,"limit":20}
    // select * from post where authorId=1 order by updateAt desc limit 5,5 ; + " order by ? DESC limit ?, ?", [param.order, param.skip, param.limit],
    queryAll: function (param, callback) {
        console.log(param.order, param.skip, param.limit);
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryAll + " order by ? limit ?, ?", [param.order, param.skip, param.limit], function(err, result) {
                console.log($sql.queryAll + " order by " + param.order + " limit " + param.skip + " , " + param.limit);
                callback(err, result);
                connection.release();
            });
        });
    },

    queryAllCount: function(callback) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryAllCount, {}, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },

    queryOwnerCount: function(param, callback){
        pool.getConnection(function(err, connection) {
            var sql = "select count(*) as count from post where post.authorId = ?";
            if (param.role == 0){//学生
                sql = "select count(*) as count from postUser where userId = ?;";
            }            

            connection.query(sql, param.userId, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },

    // 
    queryOwner: function(param, callback) {
        //console.log($sql.queryOwner, param.authorId);
        var sql = $sql.queryOwner + " order by ? limit ?, ?"
        if (param.role == 0){
            sql = "select post.* from postUser, post where postUser.postId = post.id and  userId = ? order by ? limit ?, ?";
        }

        pool.getConnection(function(err, connection) {
            connection.query(sql, [param.userId, param.order, param.skip, param.limit], function(err, result) {
                console.log(sql, param.userId, param.order, param.skip, param.limit);
                callback(err, result);
                connection.release();
            });
        });
    },

    queryRegister: function(param, callback) {
        pool.getConnection(function(err, connection) {
            console.log($sql.queryRegister + " order by createAt desc limit ?, ?");
            connection.query($sql.queryRegister + " order by createAt desc limit ?, ?", [param.userId, param.skip, param.limit], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    }
    
};
