var express = require('express');
var router = express.Router();
var wechat = require('./wechat');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ClassGo' });
});

router.get('/home', function(req, res, next) {
  res.render('home', { title: 'ClassGo' });
});

router.get('/app', function(req, res, next) {
	res.render('app', {});
});

/* wechat */
router.get('/wechat', function(req, res, next) {
	wechat.checkSignature(req, res, next);
});

module.exports = router;
