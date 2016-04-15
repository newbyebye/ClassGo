'use strict'

var url = require('url');
var crypto = require('crypto');
var request = require('request');
var userDao = require('../dao/userDao');

// wechat 
var wechat = require('wechat');
var config = {
    token: process.env.WECHAT_TOKEN,
    appid: process.env.WECHAT_APPID,
    encodingAESKey: process.env.WECHAT_AESKEY
};

// wechat msg reply
var List = wechat.List;

List.add('help', [
  ['回复{0} 姓名,学号 实名注册', function (info, req, res){
      res.reply('已注册');
  }],
  ['回复{1}创建猜数字游戏', function (info, req, res){
      res.reply('已创建');
  }]
]);

module.exports = {

    middleware: wechat(config).text(function (message, req, res, next) {
        console.log(message);

        // 账号注册
        if ((message.Content.indexOf('1 ') == 0) && (message.Content.indexOf(',') > 0)) {
            var str = message.Content.substr(2).trim();
            var a = str.splite(',');
            if (a.length != 2) {
                res.reply('输入错误\r\n回复{0} 姓名,学号 实名注册');
                return;
            }

            var data = {"username":message.FromUserName, "openID": message.FromUserName, "fullname":a[0], "studentNo":a[1]};
            userDao.add(data, function(err, result){
                if (err) {
                    console.log(err);
                    res.reply("账号注册失败");
                    return;
                }

                res.reply("恭喜，账号注册成功");
            });

        }
        else {
              res.wait('help');
          }
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

        request.get(tokenUrl, function(error, response, body) {
            if (error) {
                callback(error);
            }
            else {

                try {
                    var token = JSON.parse(body).access_token;
                    callback(null, token);
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
                        "name": "注册",
                        sub_button: [
                            {
                                "type": "click",
                                "name": "注册",
                                "key" : "MENU_REG_1"
                            },
                            {
                                "type": "location_select",
                                "name": "签到",
                                "key" : "MENU_REG_2"
                            },
                        ]
                    },
                    {
                        "name": "创建游戏",
                        "sub_button":[
                            {
                                "type": "click",
                                "name": "猜数字",
                                "key" : "MENU_GAME_1"
                            },
                        ]
                    },
                    {
                        "name":"更多",
                        "sub_button": [
                            {
                                "type": "click",
                                "name": "帮助",
                                "key" : "MENU_ABOUT_1"
                            },
                            {
                                "type": "view",
                                "name": "ClassGo",
                                "url": "http://classgo.newbyebye.com/home.html"
                            },
                            {
                                "type": "view",
                                "name": "About",
                                "url": "http://classgo.newbyebye.com/app"
                            },
                        ]
                    }
                    
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