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
router.get('/game/:id', checkToken, function(req, res, next){
  gameDao.queryGameById({id: req.params.id}, function(err, result){
          if (err || result.length == 0) {
              console.log(err);
              var err = new Error('not found');
              err.status = 501;
              next(err);
              return
          }
          var game = result[0];
          postDao.queryById({id: result[0].postId}, function(err, result){
              if (err || result.length == 0) {
                  var err = new Error('not found');
                  err.status = 501;
                  next(err);
                  return
              }

              if (req.api_user.userId == result[0].authorId ) {
                  game.showResult = 1;
              }

              res.status(200).json(game);
          });
          
      });
});

/*
* get game statisticsVar1 by id
* GET /v1/game/:id/stat1
*/
router.get('/game/:id/stat1', checkToken, function(req, res, next){
  gameDao.queryGameById({id: req.params.id}, function(err, result){
      if (err || result.length == 0) {
          console.log(err);
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }
      
      var showResult = result[0].showResult;
      postDao.queryById({id: result[0].postId}, function(err, result){
          if (err || result.length == 0) {
              var err = new Error('not found');
              err.status = 501;
              next(err);
              return
          }

          if (req.api_user.userId != result[0].authorId && showResult == 0) {
              res.status(200).json([]);
              return
          }

          gameDao.statisticsVar1({id: req.params.id}, function(err, result){
              if (err || result.length == 0) {
                  console.log(err);
                  res.status(200).json([]);
                  return
              }
              res.status(200).json(result);
          });
      });
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

function updateWinner(gameId, var1){
    gameDao.calcRusultGame({id:gameId, var1: var1}, function(err, result){
        if (err || result.length == 0) {
            console.log(err);
            return
        }

        for (var i = 0; i < result.length; i++){
            console.log(result[i]);
            gameDao.updateWin({win:1, id:result[i].id}, function(err, result){});
        }
    });
}

Array.prototype.shuffle = function() {
  var input = this;
  for (var i = input.length-1; i >=0; i--) {
  var randomIndex = Math.floor(Math.random()*(i+1)); 
  var itemAtIndex = input[randomIndex]; 
  input[randomIndex] = input[i]; 
  input[i] = itemAtIndex;
  }
  return input;
}  

function game4(gameId, subtype){
    gameDao.queryResultGame({id: gameId}, function(err, result){
        if (err || result.length == 0) {
            console.log(err);
            return
        }

        if (result.length < 2){
            return;
        }

        var count = Math.ceil(result.length * 0.1);
        result.shuffle();
        if (subtype == 1){
           // 随机取count组，如果2人数字相加为100则该组2人获胜
           for (var i = 0; i < count; i++){
              if (result[i*2].var1 + result[i*2+1].var1 == 100){
                 // 获胜
                 gameDao.updateWin({win:1, id:result[i*2].id}, function(err, result){});
                 gameDao.updateWin({win:1, id:result[i*2+1].id}, function(err, result){});
              }
           }
        }
        else{
            // 随机取count组，如果2人数字相同则该组2人获胜
            for (var i = 0; i < count; i++){
              if (result[i*2].var1 == result[i*2+1].var1){
                 // 获胜
                 gameDao.updateWin({win:1, id:result[i*2].id}, function(err, result){});
                 gameDao.updateWin({win:1, id:result[i*2+1].id}, function(err, result){});
              }
           }
        }

    });
}

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
            gameDao.calcRusultGameSum({id:gameId}, function(err, result){
                if (err || result.length == 0) {
                    console.log(err);
                    return
                }

                if (result[0].sum == 0){
                    updateWinner(gameId, 0);
                }
                else{
                    gameDao.calcRusultGame1({id:gameId}, function(err, result){
                        if (err || result.length == 0) {
                            console.log(err);
                            return
                        }

                        for (var i = 0; i < result.length; i++){
                            console.log(result[i]);
                            gameDao.updateWin({win:1, id:result[i].id}, function(err, result){});
                        }
                    });
                }
            });
            
          }
          else if (game.type == 3){
            // 强制性拍卖
            gameDao.calcRusultGame3({id:gameId}, function(err, result){
                if (err || result.length == 0) {
                    console.log(err);
                    return
                }
                var max = result[0].var1;
                var maxIdx = 0;
                for (var i = 0; i < result.length; i++){
                  if (result[i].var1 != max){
                    break;
                  }
                  else{
                    maxIdx++;
                  }
                }
                var ownIdx = Math.floor(Math.random()*(maxIdx));
                gameDao.updateWin({win:2, id:result[ownIdx].id}, function(err, result){});
                // 最大值获得书
                var ownVar = result[ownIdx].var1 - 25;
                var winIdx = ownIdx;
                if (result[result.length - 1].var1 > ownVar){
                    gameDao.updateWin({win:1, id:result[ownIdx].id}, function(err, result){});
                }
                else{
                    var min = result[result.length - 1].var1;
                    for (var i = result.length - 1; i >= 0; i--){              
                        if (result[i].var1 != min){
                            break;
                        }
                        gameDao.updateWin({win:1, id:result[i].id}, function(err, result){});
                    }
                }

                
                
            

            });
          }
          else if (game.type == 4){
            // 均衡多重性
            game4(gameId, game.subtype);
          }
          else if (game.type == 5){
            // 多数派游戏
            gameDao.calcRusultGame5_6({id:gameId, order:'count desc'}, function(err, result){
                if (err || result.length == 0) {
                    console.log(err);
                    return;
                }

                // 最大值为1 没有胜者
                if (result[0].count == 1){
                    console.log("game "+gameId + " no win.");
                    return;
                }

                var var1 = result[0].var1;
                updateWinner(gameId, var1);
            });
          }
          else if (game.type == 6){
            // 少数派游戏
            gameDao.calcRusultGame5_6({id:gameId, order:'count asc'}, function(err, result){
                if (err || result.length == 0) {
                    console.log(err);
                    return;
                }

                // 最大值为1 没有胜者
                if (result[0].count == 1){
                    console.log("game "+gameId + " no win.");
                    return;
                }

                var min = result[0].count;

                for (var i = 0; i < result.length; i++){
                    if (min == result[i].count){
                        updateWinner(gameId, result[i].var1);
                    }
                    else{
                        break;
                    }
                }
            });
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