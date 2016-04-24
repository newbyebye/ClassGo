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
var compression = require('compression');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var wechat   = require('./routes/wechat');

//wechat.createMenu();

// restful api
var users = require('./restful/users');
var posts = require('./restful/posts');




var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(compression());
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

app.use('/wechat', wechat.middleware);


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
