'use strict'

var url = require('url');
var crypto = require('crypto');
var request = require('request');
var userDao = require('../dao/userDao');
var gameDao  = require('../dao/gameDao');
var cache    = require('memory-cache');

// wechat 
var wechat = require('wechat');
var config = {
    token: process.env.WECHAT_TOKEN,
    appid: process.env.WECHAT_APPID,
    encodingAESKey: process.env.WECHAT_AESKEY
};

function defaultRegistUser(data, req, callback){
    userDao.add(data, function(err, result){
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        if (req.wxsession){
            req.wxsession.user = {id:result.insertId};
        }
        
        callback(err, result);
    });
}

function registUser(message, req, res){
    var str = message.Content.substr(2).trim();
    var a = str.split(',');
    if (a.length != 2) {
        res.reply('输入错误\r\n回复{0} 姓名,学号 实名注册');
        return;
    }
    
    var data = {"username":message.FromUserName, "openID": message.FromUserName, "fullname":a[0], "studentNo":a[1]};
    defaultRegistUser(data, req, function(err, result){
        if (err) {
            console.log(err);
            res.reply("账号注册失败");
            return;
        }
        res.reply("恭喜"+ a[0] +"，账号注册成功");
    });
}

function createNumberGame(message, req, res) {
    console.log(req.wxsession);

    if (req.wxsession && req.wxsession.game) {
        res.reply('您游戏创建的游戏正在进行中！请把房号告诉参与的同学。\n房号：' + req.wxsession.game.code + '\n请认真选取1～100里的任意一个自然数，如果你选择的\
        数字与全班的平均数的70%最为接近，那你就说获胜者。\n\n回复[s]查询游戏状态\n回复[e]结束游戏,查看游戏结果');
        return;
    }

    if (!req.wxsession.user){
        defaultRegistUser({"username":message.FromUserName, "openID": message.FromUserName}, req, function(err, callback){
                gameDao.add({type:1, userId:req.wxsession.user.id}, function(err, result){
                if (err) {
                    console.log(err);
                    res.reply("游戏创建失败");
                    return;
                }
                console.log(result);
                req.wxsession.game = {id: result.insertId, code: result.code, status: "create"};
                
                res.reply('游戏创建成功！请把房号告诉参与的同学。\n房号：' + result.code + '\n请认真选取1～100里的任意一个自然数，如果你选择的\
            数字与全班的平均数的70%最为接近，那你就说获胜者。\n\n回复[s]查询游戏状态\n回复[e]结束游戏,查看游戏结果');
            });
        });
    }
    else{
        gameDao.add({type:1, userId:req.wxsession.user.id}, function(err, result){
            if (err) {
                console.log(err);
                res.reply("游戏创建失败");
                return;
            }
            console.log(result);
            req.wxsession.game = {id: result.insertId, code: result.code};
            
            res.reply('游戏创建成功！请把房号告诉参与的同学。\n房号：' + result.code + '\n请认真选取1～100里的任意一个自然数，如果你选择的\
        数字与全班的平均数的70%最为接近，那你就说获胜者。\n\n回复[s]查询游戏状态\n回复[e]结束游戏,查看游戏结果');
        });
    }
}

function endGame(message, req, res) {
    if (!req.wxsession.game){
        res.reply("没有正在进行的游戏");
        return;
    }

    gameDao.update({id:req.wxsession.game.id, status:0}, function(err, result){
        if (err){
            res.reply("游戏结束失败");
            return;
        }

        // TODO: 统计游戏结果
        /*
            参与的人数，获胜者姓名 学号，结果
        */
        req.wxsession.game = undefined;
        res.reply('游戏结束');
    });
}

function statusGame(message, req, res) {
    if (!req.wxsession.game){
        res.reply("没有正在进行的游戏");
        return;
    }

    // TODO: 统计当前游戏结果, 如果所有人都已经提交数据则直接结束游戏
    /*
        参与的人数，提交人数, 获胜者姓名 学号，结果
    */
}

// wechat msg reply
var List = wechat.List;

List.add('help', [
  ['回复{0} 姓名,学号 实名注册', function (info, req, res){
      res.reply('输入错误\r\n回复{0} 姓名,学号 实名注册');
  }],
  ['回复{1}创建猜数字游戏', function (info, req, res){
      createNumberGame(info, req, res);
  }]
]);

module.exports = {

    middleware: wechat(config).text(function (message, req, res, next) {
        console.log(message);
            res.reply([
              {
                title: '欢迎使用ClassGo',
                description: '课程正在进行，赶快加入吧',
                picurl: 'http://www.lib.hust.edu.cn/upload/ckfinder/images/nandamen.jpg',
                url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf4802f2b0504b7b3&redirect_uri=https%3a%2f%2fclassgo.newbyebye.com%2fwelogin&response_type=code&scope=snsapi_userinfo&state=111#wechat_redirect'
              },
              {
                title:'课程正在进行，赶快加入吧',
                picurl:'http://classgo.newbyebye.com/img/qrcode.jpg',
                url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf4802f2b0504b7b3&redirect_uri=https%3a%2f%2fclassgo.newbyebye.com%2fwelogin&response_type=code&scope=snsapi_userinfo&state=111#wechat_redirect'
              }  
            ]);
        }).image(function (message, req, res, next) {
          
        }).voice(function (message, req, res, next) {
          // TODO
        }).video(function (message, req, res, next) {
          // TODO
        }).location(function (message, req, res, next) {
          // TODO
        }).link(function (message, req, res, next) {
          // TODO
        }).event(function (message, req, res, next) {
            if (message.Event == 'subscribe'){
                res.reply([
                  {
                    title: '欢迎使用ClassGo',
                    description: '课程正在进行，赶快加入吧',
                    picurl: 'http://www.lib.hust.edu.cn/upload/ckfinder/images/nandamen.jpg',
                    url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf4802f2b0504b7b3&redirect_uri=https%3a%2f%2fclassgo.newbyebye.com%2fwelogin&response_type=code&scope=snsapi_userinfo&state=111#wechat_redirect'
                  },
                  {
                    title:'课程正在进行，赶快加入吧',
                    picurl:'http://classgo.newbyebye.com/img/qrcode.jpg',
                    url: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf4802f2b0504b7b3&redirect_uri=https%3a%2f%2fclassgo.newbyebye.com%2fwelogin&response_type=code&scope=snsapi_userinfo&state=111#wechat_redirect'
                  }    
                ]);
            }
          // TODO
        }).device_text(function (message, req, res, next) {
          // TODO
        }).device_event(function (message, req, res, next) {
          // TODO
        }).middlewarify(),

    checkSignature: function(req, res, next){
        console.log('checkSignature');
        req.query = url.parse(req.url, true).query;

        if (req.query.getsignature) {
            console.log('req.query.getsignature');
            return next();
        }

        if (!req.query.signature) {
            return res.end('Access Denied!');
        }
        var tmp = [process.env.WECHAT_TOKEN, req.query.timestamp, req.query.nonce].sort().join('');
        var signature = crypto.createHash('sha1').update(tmp).digest('hex');
        if (req.query.signature != signature) {
            console.log('req.query.signature != signature');
            return res.end('Auth failed!'); // 指纹码不匹配时返回错误信息，禁止后面的消息接受及发送
        }
        if (req.query.echostr) {
            console.log('req.query.echostr');
            return res.end(req.query.echostr); // 添加公众号接口地址时，返回查询字符串echostr表示验证通过
        }
        // 消息真实性验证通过，继续后面的处理
        return next();
    },

    getToken: function(callback) {
        var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appId=' + process.env.WECHAT_APPID + '&secret=' + process.env.WECHAT_SCRET;
        if (cache.get("WECHAT_TOKEN")){
            callback(null, cache.get("WECHAT_TOKEN"));
            return;
        }

        request.get(tokenUrl, function(error, response, body) {
            if (error) {
                callback(error);
            }
            else {

                try {
                    var token = JSON.parse(body).access_token;
                    cache.put("WECHAT_TOKEN", token, 7100*1000);
                    
                    callback(null, token);
                }
                catch (e) {
                    callback(e);
                }
            }
        });
    },

    getTicket: function(callback) {
        if (cache.get("WECHAT_TICKET")) {
            callback(null, cache.get("WECHAT_TICKET"));
            return;
        }

        console.log("************ ticket is timeout **************");
        this.getToken(function(err, token){
            var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token="+token+"&type=jsapi";
            request.get(url, function(error, response, body) {
                if (error) {
                    callback(error);
                }
                else {
                    try {
                        console.log(body);
                        var response = JSON.parse(body);
                        if (response.errcode == 0) {
                            var ticket = response.ticket;
                            cache.put("WECHAT_TICKET", ticket, 7100*1000);
                            
                            callback(null, ticket);
                            return;
                        }
                        callback(response);
                    }
                    catch (e) {
                        callback(e);
                    }
                }
            });
        })    
    },

    getAccessToken: function(code, callback) {
        var tokenUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='+process.env.WECHAT_APPID+'&secret='+process.env.WECHAT_SCRET+'&code='+code+'&grant_type=authorization_code';
    
        request.get(tokenUrl, function(error, response, body) {
            if (error) {
                callback(error);
            }
            else {
                try {
                    callback(error, JSON.parse(body));
                }
                catch (e) {
                    callback(e);
                }
            }
        });
    },

    refreshAccessToken: function(refreshToken, callback) {
        var url = 'https://api.weixin.qq.com/sns/oauth2/refresh_token?appid='+process.env.WECHAT_APPID+'&grant_type=refresh_token&refresh_token=' + refreshToken;
        
        request.get(url, function(error, response, body) {
            if (error) {
                callback(error);
            }
            else {
                try {
                    callback(error, JSON.parse(body));
                }
                catch (e) {
                    callback(e);
                }
            }
        });
    },

    getUserInfo: function(accessToken, openID, callback) {
        var url = 'https://api.weixin.qq.com/sns/userinfo?access_token='+accessToken+'&openid='+openID+'&lang=zh_CN';

        request.get(url, function(error, response, body) {
            if (error) {
                callback(error);
            }
            else {
                try {
                    callback(undefined, JSON.parse(body));
                }
                catch (e) {
                    callback(e);
                }
            }
        });
    },

    createMenu: function() {
        this.getToken(function(error, token){
            if (error) {
                console.log(error);
                return;
            }

            var data = {
                "button" :[
                    {
                        "type": "view",
                        "name": "ClassGo",
                        "url": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf4802f2b0504b7b3&redirect_uri=https%3a%2f%2fclassgo.newbyebye.com%2fwelogin&response_type=code&scope=snsapi_userinfo&state=111#wechat_redirect"
                    },

                    {
                        "type": "view",
                        "name": "About",
                        "url": "http://classgo.newbyebye.com/app"
                    },
                ]
            }

            var options = {
                headers: {"Connection": "close"},
                url: 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token='+token,
                method: 'POST',
                json: true,
                body: data
            };
            request(options, function(error, response, body) {
                console.log(response);
            });
        });
    }
};