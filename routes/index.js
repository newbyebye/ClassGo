var express = require('express');
var router = express.Router();
var wechat = require('./wechat');
var userDao = require('../dao/userDao');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ClassGo' });
});

router.get('/app', function(req, res, next) {
	res.render('app', {});
});

/* Get wechat login */
router.get('/welogin', function(req, res, next){
	console.log(req.query);
	wechat.getAccessToken(req.query.code, function(err, result){
		console.log(result);
		var refresh = result.refresh_token;
		console.log("refresh token:" + refresh);
		wechat.refreshAccessToken(refresh, function(err, result){
			console.log(result);

			wechat.getUserInfo(result.access_token, result.openid, function(err, result){
				var data = {"username":result.openid, "openID": result.openid, "nickname":result.nickname, "photo":result.headimgurl, "city":result.city, "sex":result.sex};
				userDao.add(data, function(err, result){
			        if (err) {
			            console.log(err);
			            next();
			            return;
			        }

			        res.redirect("/home.html#&pageMeEdit");
			    });

				
				console.log(result);
				
			});					
		})
		
	});

	
});

module.exports = router;
