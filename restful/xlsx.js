"use strict";

var express = require('express');
var router = express.Router();
var checkToken = require('../routes/checkToken')
var postDao = require('../dao/postDao');
var postUserDao = require('../dao/postUserDao');
var lessonDao = require('../dao/lessonDao');
var signDao = require('../dao/signDao');
var gameDao  = require('../dao/gameDao');
var uuid = require('node-uuid');
var nodeExcel = require('excel-export');
var xl = require('node-xlrd');
var async = require('async');
var userDao = require('../dao/userDao');

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


function insertData(datas, notifyCallback){
    console.log("insertData", datas[0]);
    var count = datas.length;

    var task = []

    task[0] = function(callback){
        callback(null, 0);
    };

    var j = 0;
    for (var i = 1; i <= datas.length ; i++){
        task[i] = function(idx, callback){
            if (typeof idx === 'function'){
                idx = 0;
            }
            var data = datas[idx];
            console.log(idx, data, datas[idx]);
            userDao.queryByStudentNo({fullname:data.fullname, studentNo:data.studentNo}, function(err, result){
                console.log(err, result);
                if (err || result.length == 0){
                    ;
                }
                else{
                    data.userId = result[0].id;
                }
                
                postUserDao.add(data, function(err, result){
                    callback(null, idx+1);
                });
            });
        }
    }

    async.waterfall(task, function(err, result){
          notifyCallback();
      });
}

/*
* upload 
* POST /v1/post/:id/upload
*/
router.post('/post/:id/upload', checkToken, function(req, res, next){
  postDao.queryById({id: req.params.id}, function(err, result){
      if (err || result.length == 0) {
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }

      if (req.api_user.userId != result[0].authorId) {
        var err = new Error('deny access');
        err.status = 401;
        next(err);
        return
      }

      var postId = req.params.id;
      var path = req.files.upload_file.path;
      if (!path.endsWith(".xls")){
          res.status(200).json({errorMsg:"only support *.xls"});
          return;
      }

      var datas = [];
      var dIdx  = 0;
      xl.open(path, function(err,bk){
        if(err) {
            var err = new Error('file error');
            err.status = 502;
            next(err);
            return
        }
        
        var shtCount = bk.sheet.count;
        for(var sIdx = 0; sIdx < shtCount; sIdx++ ){
            //console.log('sheet "%d" ', sIdx);
            //console.log('  check loaded : %s', bk.sheet.loaded(sIdx) );
            var sht = bk.sheets[sIdx],
                rCount = sht.row.count,
                cCount = sht.column.count;
            //console.log('  name = %s; index = %d; rowCount = %d; columnCount = %d', sht.name, sIdx, rCount, cCount);
            for(var rIdx = 0; rIdx < rCount; rIdx++){    // rIdx：行数；cIdx：列数
                
                for (var cIdx = 0; cIdx < 10; cIdx++){
                    var studentNo = sht.cell(rIdx,cIdx);
                    //console.log(typeof studentNo);
                    if (typeof studentNo != "string"){
                        continue;
                    }
                    studentNo = studentNo.trim();
                    //console.log(studentNo);
                    if (studentNo.charAt(0) == 'U' || studentNo.charAt(0) == 'M' || studentNo.charAt(0) == 'D'){
                        var fullname = sht.cell(rIdx,cIdx+1).trim();
                        datas[dIdx] = {'postId':postId, 'userId':"", 'studentNo':studentNo, 'fullname':fullname.trim()};    
                        dIdx++;
                        break;
                    }
                }

                
            }
        }

        //console.log(datas);
        insertData(datas, function(){
            res.status(200).json({"count":dIdx});
        });
        
      });
      
  });
});



/*
* get sign report
* GET /v1/post/:id/report
*/
router.get('/post/:id/report', checkToken, function(req, res, next){
  postDao.queryById({id: req.params.id}, function(err, result){
      if (err || result.length == 0) {
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }

      console.log(req.api_user.userId +":"+ result[0].authorId);

      if (req.api_user.userId != result[0].authorId) {
        var err = new Error('deny access');
        err.status = 401;
        next(err);
        return
      }



      // export xlsx
      var conf ={};
      conf.cols = [
        {caption:"序号", type: "string"},
        {caption:"学号", type: "string"},
        {caption:"姓名", type: "string"},
      ];

      async.waterfall([
        function(callback){
            lessonDao.queryAll({postId: req.params.id}, function(err, result){
                if (err || result.length == 0){
                    callback(err, result);
                    return;
                }

                conf.ucols = {};
                for (var i = 0; i < result.length; i++){
                    conf.cols.push({caption: new Date(result[i].startdate).Format("yyyy-MM-dd"), type: "string"});
                    conf.ucols[new Date(result[i].startdate).Format("yyyy-MM-dd")] = 3 + i;
                }
                conf.cols.push({caption:"签到总数", type: "string"});
                conf.ucols["sum"] = 3 + i;

                callback(null, conf.cols.length);
              
            });
        },

        function(cols, callback){
            postUserDao.queryAll({postId: req.params.id}, function(err, result){
              if (err || result.length == 0) {
                  var err = new Error('deny access');
                  err.status = 501;
                  callback(err);
                  return;
              }

              conf.rows = [];
              conf.urows = {};
              for (var i = 0; i < result.length; i++){
                  var row = [];
                  row[0] = "" + (i + 1);
                  row[1] = result[i].studentNo;
                  row[2] = result[i].fullname;
                  for (var j = 3; j < cols; j++){
                      row[j] = "";
                  }
                  conf.rows.push(row);
                  if (result[i].userId != 0){
                     conf.urows[result[i].userId] = i;
                  }
              }

              callback(null, conf);
            });
        },

        function(c, callback){
            signDao.report({postId: req.params.id}, function(err, result){
                if (err) {
                  var err = new Error('deny access');
                  err.status = 502;
                  callback(err);
                  return;
                }
              
                for (var i = 0; i < result.length; i++){
                    
                    var r = conf.urows[result[i].userId];
                    var c = conf.ucols[new Date(result[i].starttime).Format("yyyy-MM-dd")];
                    console.log(result[i], r, c, new Date(result[i].starttime).Format("yyyy-MM-dd"));
                    if (r != undefined &&  c != undefined){
                        conf.rows[r][c] = result[i].signLng +":" + result[i].signLat;
                    }
                }
                callback(null, result);
            });
        },
      ], function(err, result){
          //console.log(conf);

          for (var i = 0; i < conf.rows.length; i++){
              var count = 0;
              var row = conf.rows[i];
              if (row === undefined){
                 continue;
              }
              for (var j = 3; j < conf.cols.length - 1; j++){
                  if (row[j] != ""){
                      count += 1;
                  }
              }
              conf.rows[i][j] = "" + count; 
          }

          var result = nodeExcel.execute(conf);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats');
          res.setHeader("Content-Disposition", "attachment; filename=ClassGo_report_" + new Date().getTime()+".xlsx");
          res.end(result, 'binary');
      });
  });
});

/*
* get sign report
* GET /v1/post/:id/gamereport
*/
router.get('/post/:id/gamereport', checkToken, function(req, res, next){
  postDao.queryById({id: req.params.id}, function(err, result){
      if (err || result.length == 0) {
          var err = new Error('not found');
          err.status = 501;
          next(err);
          return
      }

      console.log(req.api_user.userId +":"+ result[0].authorId);

      if (req.api_user.userId != result[0].authorId) {
        var err = new Error('deny access');
        err.status = 401;
        next(err);
        return
      }

      // export xlsx
      var conf ={};
      conf.rows = [];
      conf.cols = [
        {caption:"序号", type: "string"},
        {caption:"学号", type: "string"},
        {caption:"姓名", type: "string"},
      ];

      async.waterfall([
        function(callback){
            gameDao.queryGameByPostId({postId: req.params.id}, function(err, result){
              if (err || result.length == 0){
                  callback(err, result);
                  return;
              }

              if (result.length > 0){
                  //console.log(result);
                  //conf.lesson = result;

                  conf.ucols = {};
                  var row0 = [];
                  row0[0] = "";
                  row0[1] = "";
                  row0[2] = "";
                  for (var i = 0; i < result.length; i++){
                      conf.cols.push({caption: new Date(result[i].createAt).Format("yyyy-MM-dd"), type: "string"});
                      conf.ucols[result[i].id] = {"col":3 + i, "type":result[i].type, "subtype":result[i].subtype};
                      row0[3+i] = result[i].name;
                  }
                  conf.cols.push({caption:"签到次数", type: "string"});
                  conf.cols.push({caption:"奖励分数", type: "string"});
                  row0[3+i] = "" + result.length;
                  row0[4+i] = "";
                  conf.rows.push(row0);
                  callback(null, conf.cols.length);
              }
            });
        },

        function(cols, callback){
            postUserDao.queryAll({postId: req.params.id}, function(err, result){
              if (err || result.length == 0) {
                  var err = new Error('deny access');
                  err.status = 501;
                  callback(err);
                  return;
              }

              
              conf.urows = {};
              for (var i = 0; i < result.length; i++){
                  var row = [];
                  row[0] = "" + (i + 1);
                  row[1] = result[i].studentNo;
                  row[2] = result[i].fullname;
                  for (var j = 3; j < cols; j++){
                      row[j] = "";
                  }
                  conf.rows.push(row);
                  if (result[i].userId != 0){
                     conf.urows[result[i].userId] = i + 1;
                  }
              }

              callback(null, conf);
            });
        },

        function(c, callback){
            gameDao.report({postId: req.params.id}, function(err, result){
                if (!err && result.length > 0){
                    for (var i = 0; i < result.length; i++){
                        
                        var r = conf.urows[result[i].userId];
                        var c = conf.ucols[result[i].gameId];
                        console.log(result[i], r, c);                  
                        if (r != undefined &&  c != undefined){
                            var col = c["col"];
                            var type = c["type"];
                            var subtype = c["subtype"];
                            var reward = result[i].reward;
                            if (result[i].isWin){
                                if (conf.rows[r][conf.cols.length - 1] == ""){
                                    conf.rows[r][conf.cols.length - 1] = "" + reward;
                                }
                                else{
                                    conf.rows[r][conf.cols.length - 1] = "" + (parseInt(conf.rows[r][conf.cols.length - 1])+ reward);
                                }
                            }

                            if (type == 2 && subtype == 3){
                                conf.rows[r][col] = ""+result[i].var1 + "/"+result[i].var2;
                            }
                            else{
                                conf.rows[r][col] = ""+result[i].var1;
                            }
                            
                        }
                    }
                    callback(null, result);
                }
                else{
                   callback(err, result);
                }
            });
        },
      ], function(err, result){
          if (err){
             next(err);
             return;
          }

          console.log(conf);

          for (var i = 0; i < conf.rows.length; i++){
              var count = 0;
              var row = conf.rows[i];
              if (row === undefined){
                 continue;
              }
              for (var j = 3; j < conf.cols.length - 2; j++){
                  if (row[j] != ""){
                      count += 1;
                  }
              }
              conf.rows[i][j] = "" + count;
          }

          var result = nodeExcel.execute(conf);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats');
          res.setHeader("Content-Disposition", "attachment; filename=ClassGo_report_" + new Date().getTime()+".xlsx");
          res.end(result, 'binary');
      });
  });
});



module.exports = router;