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
var postUserDao = require('../dao/postUserDao');
var gameDao  = require('../dao/gameDao');


/* 
*  create new class
*  POST /v1/post
*  body {"title":"demo", "body":"demo", "address": "", "time": ""}
*  
*  success {"id":1}
*  fail {"error":{"name":"Error", "status":500, "message":"login failed", "statusCode":401}}
*/
router.post('/post', checkToken, function(req, res, next) {
    // 1 teacher
    if (req.api_user.role != 1 ) {
      var err = new Error('deny access');
      err.status = 401;
      next(err);
      return
    }

    req.body.authorId = req.api_user.userId;
    console.log(req.body);
  	postDao.add(req.body, function(err, result){
  		if (err) {
        console.log(err);
  			next(err);
  			return;
  		}
  		
  		res.status(200).json({
				  id: result.insertId
  			});
  	});
});

/**
*   get all class info
*   GET /v1/post/owner/count
*/
router.get('/post/owner/count', checkToken, function(req, res, next){

  postDao.queryOwnerCount({userId:req.api_user.userId, role:req.api_user.role}, function(err, result){
      if (err) {
          console.log(err);
          next(err);
          return
      }
      
      res.status(200).json(result[0]);
  });
});

/**
*
* queryOwner
* GET /v1/post/owner?filter={"fields":{},"where":{},"order":"a ASC","skip":21,"limit":20,"include":{},"includefilter":{}}
*/
router.get('/post/owner', checkToken, function(req, res, next){
  var data = JSON.parse(req.query.filter);
  data.userId = req.api_user.userId;
  data.role = req.api_user.role;
  postDao.queryOwner(data, function(err, result){
      if (err){
          console.log(err);
          next(err);
          return
      }
      res.status(200).json(result);
  });
});

/**
*
* queryOwner
*/
router.get('/post/register', checkToken, function(req, res, next){
  var data = JSON.parse(req.query.filter);
  data.userId = req.api_user.userId;
  postDao.queryRegister(data, function(err, result){
      if (err) {
          console.log(err);
          next(err);
          return
      }     
      res.status(200).json(result);
  });
});

/**
*   get all class info
*   GET /v1/post/count
*/
router.get('/post/count', function(req, res, next){

  postDao.queryAllCount(function(err, result){
      if (err) {
          console.log(err);
          next(err);
          return
      }
      
      res.status(200).json(result[0]);
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
          console.log(err);
          var err = new Error('not found');
          err.status = 501;
          next(err);

          return
      }

      res.status(200).json(result[0]);
  });

});


/**
*   get all class info
*   GET /v1/post?filter={"fields":{},"where":{},"order":"a ASC","skip":21,"limit":20,"include":{},"includefilter":{}}
*/
router.get('/post', function(req, res, next){

  postDao.queryAll(JSON.parse(req.query.filter), function(err, result){
      if (err) {
          console.log(err);
          next(err);
          return
      }
      
      res.status(200).json(result);
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
      console.log(req.body);
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
* get post today lesson
* GET /v1/post/:id/lesson
* success: {"id":1, "status":1}
*/
router.get('/post/:id/lesson/all', function(req, res, next){
    var data = {id: req.params.id};
    lessonDao.queryAll(data, function(err, result){
      if (err) {
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }
      res.status(200).json(result);
    });
});

/**
* get post today lesson
* GET /v1/post/:id/lesson
* success: {"id":1, "status":1}
*/
router.get('/post/:id/lesson', function(req, res, next){
    var data = {id: req.params.id, date:new Date()};
    lessonDao.queryLessonByPostId(data, function(err, result){
      if (err ) {
          console.log(err);
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }

      if (result.length == 0){
          res.status(200).json({});
          return;
      }
      res.status(200).json(result[0]);
    });
});



/**
*  start lesson
*  POST /v1/post/:id/lesson
*  BODY: {"status": 1, "timeout": 600, "lng":12312.1231, "lat":1.2342} 
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
      
      if (req.api_user.userId != result[0].authorId) {
        var err = new Error('deny access');
        err.status = 401;
        next(err);
        return
      }

      var data = {id: req.params.id, date:new Date()};
      lessonDao.queryLessonByPostId(data, function(err, result){
        if (err || result.length == 0) {
            console.log(err);
            
            req.body.starttime = new Date();
            req.body.postId = req.params.id;
            lessonDao.add(req.body, function(err, result){
                if (err) {
                  next(err);
                  return;
                }

                setTimeout(function(){
                    console.log("update lesson status");
                    lessonDao.update({"id": result.insertId, "status": 2}, function(){});
                }, 180*60*1000);

                res.status(200).json({
                  id: result.insertId
                });
            });
            return
        }
        else{
            var id = result[0].id;
            req.body.id = id;
            lessonDao.update(req.body, function(err, result){
                if (err) {
                  next(err);
                  return;
                }
                res.status(200).json({id: id});
            });
        }
        
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

      
      // TODO:
      if (req.api_user.userId != result[0].authorId) {
        var err = new Error('deny access');
        err.status = 401;
        next(err);
        return
      }

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
* GET /v1/post/lesson/:id/sign
* 
* id = 0 unsigned
*/
router.get('/post/lesson/:id/sign', checkToken, function(req, res, next){
      req.body.lessonId = req.params.id;
      req.body.userId = req.api_user.userId;
      signDao.queryById(req.body, function(err, result){
          if (err || result.length == 0) {
              res.status(200).json({id:0});
              return;
          }
          else{
              res.status(200).json(result[0]);
              return;
          }
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

      if (result[0].status != 1){
          var err = new Error('lesson is closed');
          err.status = 502;
          next(err);
          return;
      }

      req.body.lessonId = req.params.id;
      req.body.userId = req.api_user.userId;
      signDao.queryById(req.body, function(err, result){
          if (err || result.length == 0) {
              signDao.add(req.body, function(err, result){
                  if (err) {
                    next(err);
                    return;
                  }

                  res.status(200).json({
                    id: result.insertId
                  });
              });
              return;
          }
          else{
              var id = result[0].id;
              signDao.update(req.body, function(err, result){
                  if (err) {
                    next(err);
                    return;
                  }

                  res.status(200).json({
                    id: id
                  });
              });
              return;
          }
      });
      
    });
});

/**
*  register class
*  POST /v1/post/:id/register
*  BODY: {"isAssistant": 1, "userId":1} 
*  success: {"id":1}
*/
router.post('/post/:id/register', checkToken, function(req, res, next){
    postDao.queryById({id: req.params.id}, function(err, result){
      console.log(err);
      if (err || result.length == 0) {
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }

      // add assistant check authorId
      if (req.body.isAssistant == 1){
          if (req.api_user.userId != result[0].authorId) {
            var err = new Error('deny access');
            err.status = 401;
            next(err);
            return
          }
      }
      else{
          req.body.userId = req.api_user.userId;
          req.body.isAssistant = 0;
      }
      

      req.body.postId = req.params.id;
      postUserDao.add(req.body, function(err, result){
          console.log(err);
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
*  delete class
*  DELETE /v1/post/:id/register
*  BODY: {"isAssistant": 1, "userId":1} 
*  success: {"id":1}
*/
router.delete('/post/:id/register', checkToken, function(req, res, next){
    postDao.queryById({id: req.params.id}, function(err, result){
      if (err || result.length == 0) {
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }

      // add assistant check authorId
      if (req.body.isAssistant == 1){
          if (req.api_user.userId != result[0].authorId) {
            var err = new Error('deny access');
            err.status = 401;
            next(err);
            return
          }
      }
      else{
          req.body.userId = req.api_user.userId;
          eq.body.isAssistant = 0;
      }

      req.body.postId = req.params.id;
      postUserDao.delete(req.body, function(err, result){
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


/*
*   get register info
*   GET /v1/post/:id/register
*
*/
router.get('/post/:id/register', checkToken, function(req, res, next){
  postUserDao.queryById({postId: req.params.id, userId: req.api_user.userId}, function(err, result){
      if (err ) {
          console.log(err);
          var err = new Error('not found');
          err.status = 501;
          next(err);

          return;
      }

      if (result.length == 0){
          res.status(200).json({});
          return;
      }

      res.status(200).json(result[0]);
  });

});

/*
*   get all register info
*   GET /v1/post/:id/registerall
*
*/
router.get('/post/:id/registerall', checkToken, function(req, res, next){
  postDao.queryById({id: req.params.id}, function(err, result){
      if (err || result.length == 0) {
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }

      // add assistant check authorId     
      if (req.api_user.userId != result[0].authorId) {
        var err = new Error('deny access');
        err.status = 401;
        next(err);
        return
      }

      postUserDao.queryAll({postId: req.params.id}, function(err, result){
          if (err || result.length == 0) {
              console.log(err);
              var err = new Error('not found');
              err.status = 501;
              next(err);

              return
          }
        res.status(200).json(result);
      });
      
    });
});

//queryAllInfo

/*
*   get all register info
*   GET /v1/post/:id/registerallInfo?filter={"where":{"date":"2016-05-17"}}
*   
*/
router.get('/post/:id/registerallInfo', checkToken, function(req, res, next){
  
  var filter = JSON.parse(req.query.filter);
  lessonDao.queryLessonByPostId({id: req.params.id, date:filter.where.date}, function(err, result){
      if (err || result.length == 0) {
          console.log(err);
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }

      // add assistant check authorId     
      if (req.api_user.userId != result[0].authorId) {
        var err = new Error('deny access');
        err.status = 401;
        next(err);
        return
      }

      var data = {postId:req.params.id, lessonId:result[0].id};
      postUserDao.queryAllInfo(data, function(err, result){
          if (err ) {
              console.log(err);
              next(err);
              return
          }

          var registerUsers = result;
          signDao.queryAll(data, function(err, result){
              if (err ) {
                console.log(err);
                res.status(200).json(registerUsers);
                return
              }

              for (var i = 0; i < registerUsers.length; i++){
                  for (var j = 0; j < result.length; j++){
                      if (registerUsers[i].userId == result[j].userId){
                          registerUsers[i].signAt = result[j].createAt;
                          registerUsers[i].lat = result[j].lat;
                          registerUsers[i].lng = result[j].lng;
                      }
                  }
              }
              res.status(200).json(registerUsers);
          });
        
      });
      
    });
});

/*
*   get all register info
*   GET /v1/post/:id/registerall
*
*/
router.get('/post/:id/registersum', function(req, res, next){
  postDao.queryById({id: req.params.id}, function(err, result){
      console.log(err);
      if (err || result.length == 0) {
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }

      postUserDao.querySum({postId: req.params.id}, function(err, result){
          console.log(err);
          if (err || result.length == 0) {
              console.log(err);
              var err = new Error('not found');
              err.status = 501;
              next(err);

              return
          }
        res.status(200).json(result[0]);
      });
      
    });
});


module.exports = router;