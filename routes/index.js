var express = require('express');
var router = express.Router();
var wechat = require('./wechat');
var userDao = require('../dao/userDao');
var jwt = require('jsonwebtoken');
var accessTokenDao = require('../dao/accessTokenDao');
var crypto = require('crypto');
var checkToken = require('../routes/checkToken')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {wechat:false});
});

router.get('/app', function(req, res, next) {
	res.render('app', {wechat:true});
});


/* Get wechat login */
router.get('/welogin', function(req, res, next){

	wechat.getAccessToken(req.query.code, function(err, result){
		var refresh = result.refresh_token;

		wechat.refreshAccessToken(refresh, function(err, result){
			//nsole.log(result);

			wechat.getUserInfo(result.access_token, result.openid, function(err, result){
				var data = {"username":result.openid, "openID": result.openid, "nickname":result.nickname, "photo":result.headimgurl, "city":result.city, "sex":result.sex};
				userDao.add(data, function(err, result){
			        if (err) {
			            console.log(err);
			            next();
			            return;
			        }

			        if (req.session){
            			req.session.user = {id:result.insertId, openID: data.openID};
        			}

        			var userId = result.insertId;
        			var update = result.update;
        			var role = result.role;
        			var verify = 0;
        			if (result.verify){
        				verify = result.verify;
        			}
        			
			      	var token = jwt.sign({userId: userId, role:role, verify:verify}, process.env.JWT_SECRET);

			      	accessTokenDao.add({userId: userId, ttl: 1209600, token: token, ipAddr:req.connection.remoteAddress}, function(err, result){
				        if (err) {
				          	next(err);
				          	return;
				        }

				        res.render('index', {
				        	wechat: true,
				          	token: token,
				          	ttl: 1209600,
				          	userId: userId,
				          	role: role,
				          	update: update
				        });
				    });

			        //res.redirect("/home.html#&pageMeEdit");
			    });
				console.log(result);
				
			});					
		})
		
	});

	
});

module.exports = router;
