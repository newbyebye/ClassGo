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

create table gameTemplate (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
         
    name           varchar(32) NOT NULL,
    type           int,
    subtype        int DEFAULT '0',
    subname        varchar(32),

    ruleLabel      text,

    var1Label       varchar(128),
    var1Help        varchar(128),
    var1Type        int,
    var1Range       varchar(32),
    var1Select      varchar(256),

    var2Label       varchar(128),
    var2Help        varchar(128),
    var2Type        int,
    var2Select      varchar(256),
    var2Range       varchar(32),

    createAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt       TIMESTAMP NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


create table game (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    userId          BIGINT NOT NULL,
    postId          BIGINT NOT NULL,
    gameTemplateId  BIGINT NOT NULL,

    status         int,
    reward         int,
    gameTime       int,
    playerNum      int,
    showResult     boolean,

    createAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt       TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

*/

// CRUD SQL语句
var $sql = {
    insert:'INSERT INTO game(id, status, postId, userId, gameTemplateId, reward, gameTime, playerNum, showResult) VALUES(0,1,?,?,?,?,?,?,?)',
    insertUserGame: 'INSERT INTO userGame(id, gameId, userId, var1, var2) VALUES(0, ?, ?, ?, ?)',
    queryGameTemplate: 'select id,name, type from gameTemplate group by type order by id desc',
    queryGameTemplateId: 'select * from gameTemplate where id=?',
    queryGameTemplateType: 'select * from gameTemplate where type=?',
    queryGameByPostId: 'select game.*, gameTime - time_to_sec(timediff(now(),game.createAt)) as restTime, gameTemplate.name, gameTemplate.type, gameTemplate.subname, gameTemplate.subtype, gameTemplate.ruleLabel,\
                   gameTemplate.var1Label, gameTemplate.var1Help, gameTemplate.var1Type, gameTemplate.var1Range, gameTemplate.var1Select, \
                   gameTemplate.var2Label, gameTemplate.var2Help, gameTemplate.var2Type, gameTemplate.var2Range, gameTemplate.var2Select from game,gameTemplate where postId=? and game.gameTemplateId = gameTemplate.id',
    queryGameById: 'select game.*, gameTime - time_to_sec(timediff(now(),game.createAt)) as restTime, gameTemplate.name, gameTemplate.type, gameTemplate.subname, gameTemplate.subtype, gameTemplate.ruleLabel,\
                   gameTemplate.var1Label, gameTemplate.var1Help, gameTemplate.var1Type, gameTemplate.var1Range, gameTemplate.var1Select, \
                   gameTemplate.var2Label, gameTemplate.var2Help, gameTemplate.var2Type, gameTemplate.var2Range, gameTemplate.var2Select from game,gameTemplate where game.id=? and game.gameTemplateId = gameTemplate.id',
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

            // 建立连接，向表中插入值
            connection.query($sql.insert, [param.postId, param.userId, param.templateId, param.reward, param.gameTime, param.playerNum, param.showResult], function(err, result) {
                callback(err, result);

                // 释放连接 
                connection.release();
            });
        });
    },

    addUserData: function(param, callback){
        pool.getConnection(function(err, connection) {
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                callback(err);
                return;
            }

            // 建立连接，向表中插入值
            connection.query($sql.insertUserGame, [param.gameId, param.userId, param.var1, param.var2], function(err, result) {
                callback(err, result);

                // 释放连接 
                connection.release();
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
    
    queryGameTemplateId: function (param, callback) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryGameTemplateId, param.id, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },

    queryGameTemplate: function(callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryGameTemplate, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },

    queryGameTemplateType: function(param, callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryGameTemplateType, param.type, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },

    queryGameByPostId: function(param, callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryGameByPostId, param.postId, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },

    queryGameById: function(param, callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryGameById, param.id, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    
};
