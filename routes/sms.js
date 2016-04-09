'use strict'

var http = require('http');
var querystring = require('querystring');

module.exports = {
    sendVerifyCode: function(mobile, code, callback) {
        ar postData = {
            uid:process.env.WEIMI_UID,
            pas:process.env.WEIMI_PAS,
            mob:mobile
            con:'【ClassGo】您的验证码是：'+code+'，10分钟内有效。如非您本人操作，可忽略本消息。',
            type:'json'
        };
        var content = querystring.stringify(postData);
        var options = {
            host:'api.weimi.cc',
            path:'/2/sms/send.html',
            method:'POST',
            agent:false,
            rejectUnauthorized : false,
            headers:{
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Content-Length' :content.length
            }
        };
        var req = http.request(options,function(res){
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log(JSON.parse(chunk));
            });
            res.on('end',function(){
                console.log('over');
            });
        });
        req.write(content);
        req.end();
    }
};