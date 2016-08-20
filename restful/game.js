"use strict";

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var checkToken = require('../routes/checkToken')
var userDao = require('../dao/userDao');
var accessTokenDao = require('../dao/accessTokenDao');
var postDao = require('../dao/postDao');
var gameDao  = require('../dao/gameDao');

/*
* get game list
* GET /v1/game/template
*/
router.get('/game/template', function(req, res, next){
  gameDao.queryGameTemplate(function(err, result){
          console.log(err);
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

/*
* get game list
* GET /v1/game/template/:id
*/
router.get('/game/template/:id', function(req, res, next){
  gameDao.queryGameTemplateId({id: req.params.id}, function(err, result){
          if (err || result.length == 0) {
              console.log(err);
              var err = new Error('not found');
              err.status = 501;
              next(err);
              return
          }
        var game = result[0];

        gameDao.queryGameTemplateType({type:game.type}, function(err, result){
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

/*
* get game list
* GET /v1/post/:id/game
*/
router.get('/post/:id/game', function(req, res, next){
  gameDao.queryGameByPostId({postId: req.params.id}, function(err, result){
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


/*
* new game
* POST /v1/post/:id/game
* body {"templateId":1, "reward":5, "gameTime":120, "playerNum":10,  "showResult":1}
* 
*/
router.post('/post/:id/game', checkToken, function(req, res, next) {

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

      req.body.postId = req.params.id;
      req.body.userId = req.api_user.userId;
      gameDao.add(req.body, function(err, result){
          if (err) {
            next(err);
            return;
          }

          res.status(200).json({});
      });
    });
});



module.exports = router;