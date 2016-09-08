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

create table userGame (
    id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    userId          BIGINT NOT NULL,
    gameId          BIGINT NOT NULL,

    var1         int,
    var2         int,
    isWin        boolean,

    createAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt       TIMESTAMP NOT NULL 
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

*/

// CRUD SQL语句
var $sql = {
    insert:'INSERT INTO game(id, status, postId, userId, gameTemplateId, reward, gameTime, playerNum, showResult) VALUES(0,1,?,?,?,?,?,?,?)',
    updateStatus:'update game set status=0 where id=?',
    insertUserGame: 'INSERT INTO userGame(id, gameId, userId, var1, var2) VALUES(0, ?, ?, ?, ?)',
    updateUserGame: 'update userGame set var1=?, var2=? where id=?',
    queryUserGame: 'select * from userGame where gameId=? and userId=?',
    queryGameTemplate: 'select id,name, type from gameTemplate group by type order by id desc',
    queryGameTemplateId: 'select * from gameTemplate where id=?',
    queryGameTemplateType: 'select * from gameTemplate where type=?',
    queryGameByPostId: 'select game.*, gameTime - time_to_sec(timediff(now(),game.createAt)) as restTime, gameTemplate.name, gameTemplate.type, gameTemplate.subname, gameTemplate.subtype, gameTemplate.ruleLabel,\
                   gameTemplate.var1Label, gameTemplate.var1Help, gameTemplate.var1Type, gameTemplate.var1Range, gameTemplate.var1Select, \
                   gameTemplate.var2Label, gameTemplate.var2Help, gameTemplate.var2Type, gameTemplate.var2Range, gameTemplate.var2Select from game,gameTemplate where postId=? and game.gameTemplateId = gameTemplate.id',
    queryGameById: 'select game.*, gameTime - time_to_sec(timediff(now(),game.createAt)) as restTime, gameTemplate.name, gameTemplate.type, gameTemplate.subname, gameTemplate.subtype, gameTemplate.ruleLabel,\
                   gameTemplate.var1Label, gameTemplate.var1Help, gameTemplate.var1Type, gameTemplate.var1Range, gameTemplate.var1Select, \
                   gameTemplate.var2Label, gameTemplate.var2Help, gameTemplate.var2Type, gameTemplate.var2Range, gameTemplate.var2Select from game,gameTemplate where game.id=? and game.gameTemplateId = gameTemplate.id',
    updateWin: 'update userGame set isWin = ? where id=?',

    win: 'select userId,var1,fullname as name,studentNo, isWin from userGame,user where gameId = ? and isWin > 0 and user.id = userGame.userId',

    statisticsVar1: 'select var1,count(var1) as count from userGame where gameId = ? group by var1',
    statisticsVar2: 'select var2,count(var2) as count from userGame where gameId = ? group by var2',

    report:'select userGame.*, game.postId, game.reward from userGame, game where userGame.gameId = game.id and postId = ?',

    queryResultGame:'select * from userGame where gameId=?',

    // 
    calcRusultGame: 'select * from userGame where gameId =? and var1 = ?',

    // 猜数字游戏
    calcRusultGame1:'select * from userGame where gameId =? and var1 = (select max(var1) from userGame where gameId = ? and var1 <(select sum(var1)*0.7/count(*) from userGame where gameId = ?));',
    calcRusultGameSum: 'select sum(var1) as sum from userGame where gameId=?',

    // 强制性拍卖
    calcRusultGame3: 'select * from userGame where gameId = ? order by var1 desc',

    // 多数派游戏
    calcRusultGame5_6: 'select var1, count(var1) as count from userGame where gameId = ? group by var1 order by ?',
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

    updateStatus: function(param, callback) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.updateStatus, param.id, function(err, result) {
                
                callback(err, result);
    
                connection.release();
            });
        });
    },

    updateWin: function(param, callback) {
        pool.getConnection(function(err, connection) {
            connection.query($sql.updateWin, [param.win, param.id], function(err, result) {
                
                callback(err, result);
    
                connection.release();
            });
        });
    },

    updateUserGame: function(param, callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.updateUserGame, [param.var1, param.var2, param.id], function(err, result) {
                
                callback(err, result);
    
                connection.release();
            });
        });
    },
    

    queryResultGame: function(param, callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryResultGame, param.id, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },

    calcRusultGame: function(param, callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.calcRusultGame, [param.id, param.var1], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },

    // 猜数字游戏
    calcRusultGame1: function(param, callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.calcRusultGame1, [param.id, param.id, param.id], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },

    calcRusultGameSum: function(param, callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.calcRusultGameSum, [param.id, param.id, param.id], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },

    // 强制性拍卖
    calcRusultGame3: function(param, callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.calcRusultGame3, [param.id], function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },

    

    // 少数派 多数派游戏
    calcRusultGame5_6: function(param, callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.calcRusultGame5_6, [param.id, param.order], function(err, result) {
                callback(err, result);
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

    queryUserGame: function(param, callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.queryUserGame, [param.gameId, param.userId], function(err, result) {
                callback(err, result);
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

    statisticsVar1: function(param, callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.statisticsVar1, param.id, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },
    
    statisticsVar2: function(param, callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.statisticsVar2, param.id, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },

    win: function(param, callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.win, param.id, function(err, result) {
                callback(err, result);
                connection.release();
            });
        });
    },

    report: function(param, callback){
        pool.getConnection(function(err, connection) {
            connection.query($sql.report, param.postId, function(err, result) {
                console.log($sql.report + param.postId);
                callback(err, result);
                connection.release();
            });
        });
    }
};
