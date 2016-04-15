"use strict";

// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var menu   = require('./routes/wechat');

//menu.createMenu();

// restful api
var users = require('./restful/users');
var posts = require('./restful/posts');

// wechat 
var wechat = require('wechat');
var config = {
    token: process.env.WECHAT_TOKEN,
    appid: process.env.WECHAT_APPID,
    encodingAESKey: process.env.WECHAT_AESKEY
};


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session(
    {
      secret: process.env.JWT_SECRET, 
      cookie: {maxAge:60000}, 
      resave: false,
      saveUninitialized: true
    }));

app.use(express.static(path.join(__dirname, 'public')));


// wechat msg reply

var List = wechat.List;

List.add('help', [
  ['回复{0} 姓名,学号 注册', function (info, req, res){
      res.reply('已注册');
  }],
  ['回复{1}创建猜数字游戏', function (info, req, res){
      res.reply('已创建');
  }]
]);

List.add('view', [
  ['回复{a}查看我的性别', function (info, req, res) {
    res.reply('我是个妹纸哟');
  }],
  ['回复{b}查看我的年龄', function (info, req, res) {
    res.reply('我今年18岁');
  }],
  ['回复{c}查看我的性取向', '这样的事情怎么好意思告诉你啦- -']
]);

app.use('/wechat', wechat(config).text(function (message, req, res, next) {
  // 
  if (message.Content === 'list') {
      res.wait('view');
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
}).middlewarify());


app.use('/', routes);
app.use('/v1', users);
app.use('/v1', posts);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.status(err.status || 500).json({
      error:{
        name:"Error",
        status: err.status || 500, 
        message: err.message,
        statusCode: err.status || 500
      }
    });
/*
  res.render('error', {
    message: err.message,
    error: {}
  });*/
});


module.exports = app;
