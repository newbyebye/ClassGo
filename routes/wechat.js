'use strict'

var url = require('url');
var crypto = require('crypto');


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
    }
};