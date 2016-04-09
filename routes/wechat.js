'use strict'

var url = require('url');
var crypto = require('crypto');
var request = require('request');

module.exports = {
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
                        "type": "view",
                        "name": "ClassGo",
                        "url": "http://classgo.newbyebye.com"
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