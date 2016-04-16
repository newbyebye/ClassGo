var express = require('express');
var router = express.Router();
var wechat = require('./wechat');


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
				console.log(result);
				res.redirect("/home.html#&pageMeEdit");
			});					
		})
		
	});

	
});

module.exports = router;
