var fs = require('fs');
var uglifyjs = require('uglify-js');


var ALL_JS_FILES =[
"public/js/iscroll-lite.js",
"public/lib/jquery/jquery-1.10.2.js",
"public/lib/jquery/jquery.timeago.js",
"public/lib/jquery/jquery.json-2.4.js",
"public/js/mobilebone.js",
"public/js/classgo.js",
"public/js/jweixin-1.0.0.js",
"public/js/crypto-js.js",
];

var result = uglifyjs.minify(ALL_JS_FILES);

fs.writeFile('public/js/classgo.mini.js', result.code, function(err){
	if (err) throw err;

	console.log('minify js success, public/js/classgo.mini.js is update.');
});



var exec = require('child_process').exec; 

var ALL_CSS_FILES = [
"public/css/mobilebone.css",
"public/css/wechat.css",
"public/lib/weui/weui.min.css"
]
exec("uglifycss " + ALL_CSS_FILES.join(" ") + ">public/css/classgo.mini.css", function(err, stdout, stderr){
	if (err) throw err;

	console.log("minify css success, public/css/classgo.mini.css is update.");
});


/*
var sprite = require('css-sprite');
sprite.create({
  src       : ['web/icon/*.png'],  //小图标所在目录
  out       : 'web/img',           //大图标所在目录
  name      : 'icons',             //大图标名称
  style     : 'web/css/icons.css', //样式文件
  prefix    : 'icon',   //样式前辍
  processor : 'css',    //文件格式： css; 支持less,sass,scss,stylus等扩展样式语言
  cssPath   : '../img', //css文件相对于图标文件的相对路径
  margin    : 10        //图片间隔，默认垂直排列
}, function () {
  console.log('done');
});
*/
