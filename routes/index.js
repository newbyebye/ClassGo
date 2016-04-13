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

module.exports = router;
