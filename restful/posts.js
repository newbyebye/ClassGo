"use strict";

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var checkToken = require('../routes/checkToken')
var userDao = require('../dao/userDao');
var accessTokenDao = require('../dao/accessTokenDao');
var postDao = require('../dao/postDao');
var lessonDao = require('../dao/lessonDao');
var signDao = require('../dao/signDao');


/* 
*  create new class
*  POST /v1/post
*  body {"title":"demo", "body":"demo"}
*  
*  success {"id":1}
*  fail {"error":{"name":"Error", "status":500, "message":"login failed", "statusCode":401}}
*/
router.post('/post', checkToken, function(req, res, next) {
    req.body.authorId = req.api_user.userId;
  	postDao.add(req.body, function(err, result){
  		if (err) {
  			next(err);
  			return;
  		}
  		
  		res.status(200).json({
				  id: result.insertId
  			});
  	});
});


/*
*   get class info
*  	GET /v1/post/:id
*
*/
router.get('/post/:id', function(req, res, next){
  postDao.queryById({id: req.params.id}, function(err, result){
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
*   update class info
*	  PUT /v1/post/:id
* 
*/
router.put('/post/:id', checkToken, function(req, res, next){
    postDao.queryById({id: req.params.id}, function(err, result){
      if (err || result.length == 0) {
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }

      if (req.api_user.userId != result[0].authorId) {
        var err = new Error('deny access');
        err.status = 401;
        next(err);
        return
      }

      req.body.id = req.params.id;
      postDao.update(req.body, function(err, result){
          if (err) {
            next(err);
            return;
          }

          res.status(200).json({});
      });
    });

    
});

/**
*   delete post info
*   DELETE /v1/post/:id
* 
*/
router.delete('/post/:id', checkToken, function(req, res, next){
    postDao.queryById({id: req.params.id}, function(err, result){
      if (err || result.length == 0) {
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }

      if (req.api_user.userId != result[0].authorId) {
        var err = new Error('deny access');
        err.status = 401;
        next(err);
        return
      }

      req.body.id = req.params.id;
      postDao.delete(req.body, function(err, result){
          if (err) {
            next(err);
            return;
          }

          res.status(200).json({});
      });
    });
});


/**
*  start lesson
*  POST /v1/post/:id/lesson
*  BODY: {"status": 1, "starttime": "2010-10-05", "timeout": 600, "lng":12312.1231, "lat":1.2342} 
*  success: {"id":1}
*/
router.post('/post/:id/lesson', checkToken, function(req, res, next){
    postDao.queryById({id: req.params.id}, function(err, result){
      if (err || result.length == 0) {
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }

      /*
      if (req.api_user.userId != result[0].authorId) {
        var err = new Error('deny access');
        err.status = 401;
        next(err);
        return
      }
      */

      req.body.postId = req.params.id;
      lessonDao.add(req.body, function(err, result){
          if (err) {
            next(err);
            return;
          }

          res.status(200).json({
            id: result.insertId
          });
      });
    });
});

/**
*  stop lesson
*  PUT /v1/post/lesson/:id
*  BODY: {"status": 2, "lng":12312.1231, "lat":1.2342} 
*/
router.put('/post/lesson/:id', checkToken, function(req, res, next){
    lessonDao.queryById({id: req.params.id}, function(err, result){
      if (err || result.length == 0) {
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }

      /*
      // TODO:
      if (req.api_user.userId != result[0].authorId) {
        var err = new Error('deny access');
        err.status = 401;
        next(err);
        return
      }*/

      req.body.id = req.params.id;
      lessonDao.update(req.body, function(err, result){
          if (err) {
            next(err);
            return;
          }

          res.status(200).json({});
      });
    });
});

/**
* student sign
* POST /v1/post/lesson/:id/sign
* BODY: {"lng":12312.1231, "lat":1.2342}
*/
router.post('/post/lesson/:id/sign', checkToken, function(req, res, next){
    lessonDao.queryById({id: req.params.id}, function(err, result){
      if (err || result.length == 0) {
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }

    /*
      if (req.api_user.userId != result[0].authorId) {
        var err = new Error('deny access');
        err.status = 401;
        next(err);
        return
      }
    */

      req.body.lessonId = req.params.id;
      req.body.userId = req.api_user.userId;
      signDao.add(req.body, function(err, result){
          if (err) {
            next(err);
            return;
          }

          res.status(200).json({
            id: result.insertId
          });
      });
    });
});


module.exports = router;