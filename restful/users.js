"use strict";

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var checkToken = require('../routes/checkToken')
var userDao = require('../dao/userDao');
var accessTokenDao = require('../dao/accessTokenDao');


/* 
*  regist new user
*  POST /v1/user
*  body {"username":"demo", "password":"demo", "fullname":"fullname", "openID": "openID"}
*  
*  success {"token":"sadfasdf", "ttl":1209600, userId:1}
*  fail {"error":{"name":"Error", "status":500, "message":"login failed", "statusCode":401}}
*/
router.post('/user', function(req, res, next) {
  	userDao.add(req.body, function(err, result){
  		if (err) {
  			next(err);
  			return;
  		}

  		// return token
      var userId = result.insertId;
  		var token = jwt.sign({userId: userId}, process.env.JWT_SECRET);
  		accessTokenDao.add({userId: userId, ttl: 1209600, token: token, ipAddr:req.connection.remoteAddress}, function(err, result){
  			if (err) {
  				// 回滚user add
          userDao.delete({id:userId}, function(err, result){
              if(result.affectedRows > 0) {
                  result = {
                      code: 200,
                      msg:'删除成功'
                  };
              } else {
                    result = void 0;
              }
          });

  				next(err);
  				return;
  			}

  			res.status(200).json({
  				token: token,
				  ttl: 1209600,
				  userId: userId
  			});
  		});
  		
  	});
});


/*
*  user login
*  POST /v1/user/login
*  body {"username":"xxx", "password":"xxxx"}
* 
*  success {"token":"xx", "ttl":1209600,"userId":"sdfasdf"}
*
*  fail {"error":{"name":"Error", "status":401, "message":"login failed", "statusCode":401}}
*/
router.post('/user/login', function(req, res, next){
  userDao.login(req.body, function(err, result){
      if (err || result.length == 0) {
          console.log(err);
          var err = new Error('login failed');
          err.status = 401;
          next(err);
          return
      }

      var userId = result[0].id;
      var role = result[0].role;
      var token = jwt.sign({userId: userId, role: role}, process.env.JWT_SECRET);
      accessTokenDao.add({userId: userId, ttl: 1209600, token: token, ipAddr:req.connection.remoteAddress}, function(err, result){
        if (err) {
          next(err);
          return;
        }

        res.status(200).json({
          token: token,
          ttl: 1209600,
          userId: userId,
          role: role,
        });
      });
  });
});


/*
*  user logout
*  POST /v1/user/logout
*  body {"token":"xxx"}
*
*  success {}
*
*  fail {"error":{"name":"Error", "status":400, "message":"laccess_token is a required arg", "statusCode":400}}
*/
router.post('/user/logout', checkToken, function(req, res, next){
  accessTokenDao.delete({userId: req.api_user, token: req.body.token}, function(err, result){
      if (err) {
        next(err);
        return;
      }

      res.status(200).json({});
  });
});

/*
*   get user info
*  	GET /v1/user/:id
*   get user info    
*
*/
router.get('/user/:id', function(req, res, next){
  var id = req.params.id;
  console.log(id);
  userDao.queryById({id: req.params.id}, function(err, result){
      console.log(err);
      if (err || result.length == 0) {
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }

      res.status(200).json(result[0]);
  });

});

/**
*   update user info
*	  PUT /v1/user/:id
*   update user
* 
*/
router.put('/user/:id', checkToken, function(req, res, next){
    console.log(req.api_user, req.params.id);
    if (req.api_user.userId != req.params.id) {
        var err = new Error('deny access');
        err.status = 401;
        next(err);
        return
    }

    req.body.id = req.api_user.userId;
    userDao.update(req.body, function(err, result){
        if (err) {
          next(err);
          return;
        }

        res.status(200).json({});
    });
});


module.exports = router;