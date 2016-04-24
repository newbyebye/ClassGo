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
    update:'update user set fullname=?, studentNo=?, profession=?, school=?, brief=?, role=? where id=?',
    delete: 'delete from user where id=?',
    login: 'select * from user where username=? and password=?',
    queryById: 'select id, username, profession, sex, photo, fullname, mobile, nickname, studentNo, city, school, brief, createAt, updateAt, role, verify from user where id=?',
    //queryAll: 'select id, username, profession, sex, photo, fullname, mobile, nickname, studentNo, city, school, brief, createAt, updateAt from user',
    queryByOpenID: 'select * from user where openID=?',
};

function createUpdateSql(param){
    // fullname=?, studentNo=?, profession=?, school=?, brief=? 
    console.log(param);

    var retval = {sql:"", params:[]};

    if (param.fullname) {
        retval.sql += "fullname=?, ";
        retval.params[retval.params.length] = param.fullname;
    }
    if (param.studentNo) {
        retval.sql += "studentNo=?, ";
        retval.params[retval.params.length] = param.studentNo;
    }
    if (param.profession) {
        retval.sql += "profession=?, ";
        retval.params[retval.params.length] = param.profession;
    }
    if (param.school) {
        retval.sql += "school=?, ";
        retval.params[retval.params.length] = param.school;
    }
    if (param.brief) {
        retval.sql += "brief=?, ";
        retval.params[retval.params.length] = param.brief;
    }
    if (param.role) {
        retval.sql += "role=?, ";
        retval.params[retval.params.length] = param.role;
    }

    retval.sql = retval.sql.substr(0, retval.sql.length - 2);

    return retval;
}

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
                        var role = result[0].role;
                        var verify = result[0].verify;
                        // update user
                        // TODO: 如果有定义值则更新
                        var sql = "update user set nickname=?, photo=?, sex=?,city=? where openID=?";
                        console.log(sql);
                        connection.query(sql, [param.nickname, param.photo, param.sex, param.city, param.openID], function(err, result) {
                            result.insertId = userId;
                            result.update = true;
                            result.role = role;
                            result.verify = verify;
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

            var sqlParams = createUpdateSql(param);
            sqlParams.params[sqlParams.params.length] = param.id;
            
            console.log(sqlParams.sql);
            // update user set fullname=?, studentNo=?, profession=?, school=?, brief=? where id=?
            connection.query("update user set " + sqlParams.sql + " where id=?", 
                sqlParams.params, function(err, result) {
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
    /*
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
    }*/
    
};
