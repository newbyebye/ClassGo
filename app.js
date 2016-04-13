"use strict";

// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

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
app.use(express.static(path.join(__dirname, 'public')));

// wechat msg replay
app.use('/wechat', wechat(config, function(req, res, next){
  var message = req.weixin;

  console.debug(message);

/*
  Text Type msg
  { 
    ToUserName: 'gh_56f773fca953',
    FromUserName: 'o1xOlv3Imod0J4GiufGwrkxP9H6k',
    CreateTime: '1460551418',
    MsgType: 'text',
    Content: '123',
    MsgId: '6273020574844743668' 
  }
  */

  if (message.MsgType === 'text') {
      if (message.Content == "1") {
          res.reply('hehe');
      }
      else if (message.Content == "2") {
          res.reply({
            content: 'text object',
            type: 'text'
          });
      }
      else if (message.Content === "3") {
          res.replay({
          type: "music",
          content: {
            title: "来段音乐吧",
            description: "一无所有",
            musicUrl: "http://mp3.com/xx.mp3",
            hqMusicUrl: "http://mp3.com/xx.mp3",
            thumbMediaId: "thisThumbMediaId"
          }
        });
      }
  }
  else {
      res.replay("help");
  }
  /*
  if (message.FromUserName === 'diaosi') {
      res.replay('hehe');
  } else if (message.FromUserName === 'text') {
      res.replay({
          content: 'text object',
          type: 'text'
      });
  } else if (message.FromUserName === 'hehe') {
      res.replay({
          type: "music",
          content: {
            title: "来段音乐吧",
            description: "一无所有",
            musicUrl: "http://mp3.com/xx.mp3",
            hqMusicUrl: "http://mp3.com/xx.mp3",
            thumbMediaId: "thisThumbMediaId"
          }
      });
  } else {
     res.reply([
      {
        title: '你来我家接我吧',
        description: '这是女神与高富帅之间的对话',
        picurl: 'http://nodeapi.cloudfoundry.com/qrcode.jpg',
        url: 'http://nodeapi.cloudfoundry.com/'
      }
    ]);
  }
  */
}));

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
