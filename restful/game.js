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
* get game by id
* GET /v1/game/:id
*/
router.get('/game/:id', function(req, res, next){
  gameDao.queryGameById({id: req.params.id}, function(err, result){
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

/*
* get game statisticsVar1 by id
* GET /v1/game/:id/stat1
*/
router.get('/game/:id/stat1', function(req, res, next){
  gameDao.statisticsVar1({id: req.params.id}, function(err, result){
          if (err || result.length == 0) {
              console.log(err);
              res.status(200).json([]);
              return
          }
          res.status(200).json(result);
      });
});

/*
* get game statisticsVar2 by id
* GET /v1/game/:id/stat2
*/
router.get('/game/:id/stat2', function(req, res, next){
  gameDao.statisticsVar2({id: req.params.id}, function(err, result){
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
* get game win by id
* GET /v1/game/:id/win
*/
router.get('/game/:id/win', function(req, res, next){
  gameDao.win({id: req.params.id}, function(err, result){
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

/**
*  post game 
*  POST /v1/game/:id
*  {var1: "", var2: ""}
*/
router.post('/game/:id', checkToken, function(req, res, next){

  req.body.gameId = req.params.id;
  console.log(req.api_user);
  req.body.userId = req.api_user.userId;

  gameDao.queryUserGame(req.body, function(err, result){
      if (err || result.length == 0){
          gameDao.addUserData(req.body, function(err, result){
              if (err) {
                next(err);
                return;
              }

              res.status(200).json({});
          });
      }
      else{
          console.log(result);
          req.body.id = result[0].id;
          gameDao.updateUserGame(req.body, function(err, result){
              if (err) {
                next(err);
                return;
              }

              res.status(200).json({});
          });
      }
  });
  

});

function endgame(gameId){
    gameDao.updateStatus({id: gameId}, function(){
        gameDao.queryGameById({id: gameId}, function(err, result){
          if (err || result.length == 0) {
              console.log(err);
              return
          }

          var game = result[0];
          if (game.type == 1){
            // 猜数字
            gameDao.calcRusultGame1({id:gameId}, function(err, result){
                if (err || result.length == 0) {
                    console.log(err);
                    return
                }

                for (var i = 0; i < result.length; i++){
                    console.log(result[i]);
                    gameDao.updateWin({id:result[i].id}, function(err, result){});
                }
            });
          }
          else if (game.type == 3){
            // 强制性拍卖
          }

        });
    });

    
}


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
      var gameTime = req.body.gameTime;
      gameDao.add(req.body, function(err, result){
          if (err) {
            next(err);
            return;
          }
          
          setTimeout(function(){
              console.log("update game status");
              gameDao.updateStatus({id: result.insertId}, function(){});
              endgame(result.insertId);
          }, gameTime*1000);

          res.status(200).json({id: result.insertId});
      });
    });
});



module.exports = router;