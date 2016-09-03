// serialize to json
$.fn.serializeObject = function() {
	var o = {};
	var a = this.serializeArray();
	$.each(a, function() {
		if (o[this.name]) {
			if (!o[this.name].push) {
				o[this.name] = [ o[this.name] ];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};

// controller
$(function() {
	"use strict";	
	var CG = {};
	window.CG = {};
	var CG = window.CG;
	
	var COMMON_JSON_PATH = '';
	CG.Object = {};
	
	CG.Object.extend = function(source) {
		return $.extend({}, this, source);
	};

	CG.ObjController = CG.Object.extend({
		objName : '',
		// window.localStorage.getItem
        download: function(path, callback, bAsync){
            var isAsyncLoad = true;
            if (typeof (bAsync) != 'undefined') {
                isAsyncLoad = bAsync;
            }
            $.ajax({
                url : path,
                async : isAsyncLoad,
                headers : {"x-access-token":window.sessionStorage.getItem("token"),
                            "Cache-Control":"no-cache",
                            "If-Modified-Since":"0"},
                success : function(data) {
                    callback(null);
                },
                error : function(err, textStatus) {
                    callback(err);
                }
            });
        },
		get : function(path, callback, bAsync) {
			var isAsyncLoad = true;
			if (typeof (bAsync) != 'undefined') {
				isAsyncLoad = bAsync;
			}
			$.ajax({
				url : path,
				dataType : 'json',
				async : isAsyncLoad,
				headers : {"x-access-token":window.sessionStorage.getItem("token"),
							"Cache-Control":"no-cache",
							"If-Modified-Since":"0"},
				/*
				dataFilter : function(data, type) {
					return data;
				},*/
				success : function(data) {
					callback(null, data);
				},
				error : function(err, textStatus) {
					callback(err);
				}
			});
		},

		createSubmitData : function(data) {
			var v, json = {}
			for ( var key in data) {
				if (data.hasOwnProperty(key)) {
					v = data[key];

					if (typeof (v) === "function") {
						continue;
					}

					json[key] = v;
				}
			}
			return $.toJSON(json);
		},

		internalPost: function (path, data, type, callback) {
			var self = this;
			jQuery.ajax({
				url : path,
				type : type,
				data : self.createSubmitData(data),
				dataType : "json",
				contentType : "application/json;charset=UTF-8",
				headers : {"x-access-token":window.sessionStorage.getItem("token")},
				success : function(result) {	
					callback(null, result);	
				},
				error : function(err) {	
					callback(err);
				}
			});
		},

		post : function(path, data, callback) {
			this.internalPost(path, data, "POST", callback);
		},

		put : function(path, data, callback) {
			this.internalPost(path, data, "PUT", callback);
		},

		delete : function(path, data, callback) {
			this.internalPost(path, data, "DELETE", callback);
		},

		submit : function(data, callback) {
			var path = COMMON_JSON_PATH + this.objName;
			this.post(path, data, callback);
		},

		update : function(data, callback) {
			var path = COMMON_JSON_PATH + this.objName;
			this.put(path, data, callback);
		}
	});

	CG.SingleObjController = CG.ObjController.extend({
		content : {},

		afterLoad : function() {

		},

		load : function(callback) {
			var self = this;
			var path = COMMON_JSON_PATH + this.objName;

			this.get(path, function(err, data) {
				if (null == data) {
					return;
				}

				for ( var property in data) {
					self.content[property] = data[property];
				}
				
				if (self.afterLoad) {
					self.afterLoad();
				}

				if (callback) {
					callback(data, self);
				}
			});
		}
	});
});

$(function(){
    "use strict";
	CG.UserLoginController = CG.SingleObjController.extend({
	    objName: "./v1/user/login",
	   
	    login: function(data, callback){
	        var self = this;
	        this.submit(data, callback);
	    }
	});

	CG.PostController = CG.SingleObjController.extend({
		objName: "./v1/post"
	});

	CG.MyController = CG.SingleObjController.extend({
		objName: "./v1/user/" +window.sessionStorage.getItem('userId')
	});

});

function checkCurrentUserId(userId) {
    if (userId == window.sessionStorage.getItem("userId")){
        return true;
    }

    return false;
}

function back(){
    $.mobile.back();
}

function home(){
    $.mobile.changePage("#home");
}

function savePost(){
    var id = $('#create_id').val();
    var data = {title:$(create_title).val(), body:$(create_body).val(), time: $(create_time).val(), address: $(create_address).val()};
    if (id == ''){ 
        CG.PostController.submit(data, function(err, result){   
                back();
            });
    }
    else{
        CG.PostController.put('/v1/post/'+id, data, function(err, result){
            viewHomeDetail(id);
            back();
        });
    }
    
}

function exportPost(){
    var postId = window.sessionStorage.getItem("postId");
    window.location='/v1/post/'+postId+'/report'+"?token="+window.sessionStorage.getItem("token");
}

function exportGame(){
    var postId = window.sessionStorage.getItem("postId");
    window.location='/v1/post/'+postId+'/gamereport'+"?token="+window.sessionStorage.getItem("token");
}

var fileForm = new Object();
function checkFileSize(fileObj) {
    /*
    if(fileObj.value != "") {
        var form = document.forms['upfile_form'];

        //把form的原始数据缓存起来
        fileForm.f = form;
        fileForm.a = form.getAttribute("action"); //form.action 为一个静态的对象，所以这里要使用getAttribute方法取值
        fileForm.t = form.target;

        //请求服务器端
        form.target = "check_file_frame";
        form.action = "./v1/post/"+window.sessionStorage.getItem("postId")+"/upload?token="+window.sessionStorage.getItem("token");
        form.submit(); 
    }
    return false;*/
    console.log("checkFileSize");
    $.ajaxFileUpload({  
            url:"./v1/post/"+window.sessionStorage.getItem("postId")+"/upload?token="+window.sessionStorage.getItem("token"),  
            secureuri:false,
            fileElementId:'upload_file',//file标签的id  
            dataType: 'json',//返回数据的类型  
            success: function (data, status) {  
                if (data.count){
                    $("#upload_msg").text("成功导入"+data.count+"条注册信息");
                }
                else{
                    $("#upload_msg").text("导入失败，请检查文件格式是否正确");
                }
            },  
            error: function (data, status, e) {  
                console.log(e);
                $("#upload_msg").text("导入失败，请检查文件格式是否正确");
            }  
        });  
}  

  function newPost(){
        $('#create_id').val('');
        $.mobile.changePage("#pageAddClass");
  }

	function getRegisterSum(postId) {
        CG.PostController.get('/v1/post/'+postId+'/registersum', function(err, data){
            if (!err){
                $('#detail_sum').text(data.sum);
            }
        });
  }

  function loadOwnerData(photo){
        CG.PostController.get('/v1/post/owner', function(err, data){
            if (err){

                return;
            }
            data.forEach(function(e){
                $(scrollerOwner).append('\
                    <a href="javascript:void(0)" onclick="viewHomeDetail('+ e.id +')" class="wechat-list" >\
                        <img src="'+ photo +'">\
                        <div class="cell">\
                            <div class="wechat-h-time"><h5>'+e.title+'</h5><time>'+$.timeago(e.createAt)+'</time></div>\
                            <p>'+e.body+'</p>\
                        </div>\
                    </a>');
            });
            if (Mobilebone.pages["pageMyFavourite"]){
                Mobilebone.pages["pageMyFavourite"].refresh();
            }
        });
    }

    function loadRegistData(){
        CG.PostController.get('/v1/post/register', function(err, data){
            if (err) {
                return;
            }
            data.forEach(function(e){
                $(scrollerRegister).append('\
                    <a href="javascript:void(0)" onclick="viewHomeDetail('+ e.id +')" class="wechat-list" >\
                        <img src="'+ e.photo +'">\
                        <div class="cell">\
                            <div class="wechat-h-time"><h5>'+e.title+'</h5><time>'+$.timeago(e.createAt)+'</time></div>\
                            <p>'+e.body+'</p>\
                        </div>\
                    </a>');
            });

            if (Mobilebone.pages["pageMyFavourite"]){
                Mobilebone.pages["pageMyFavourite"].refresh();
            }
            
        });
    }

    function loadTodayLesson(postId) {
        CG.PostController.get('/v1/post/'+postId+'/lesson', function(err, data){
            if (!err){
                if (data.status == 1) {
                    $('#detail_lesson_id').val(data.id);
                    getMySignInStatus();
                }
                else{
                    $('#detail_lesson_id').val("");
                }
            }
        });
    }

    function getMySignInStatus() {
        if ($('#detail_lesson_id').val().length == 0){
            return;
        }

        CG.PostController.get('/v1/post/lesson/'+$('#detail_lesson_id').val()+'/sign', function(err, data){
            if (!err){
                if (data.id != 0) {
                    $('#detail_signBtn').html("已签到");
                }            
            }
        });
    }

    function getMyRegisterStatus(postId) {
        $('#detail_registerBtn').html("注册");
        $('#detail_registerBtn').attr('class',"weui_btn weui_btn_mini  weui_btn_primary");
        $('#detail_signBtn').hide();
        CG.PostController.get('/v1/post/'+postId+'/register', function(err, data){
            if (!err){
                $('#detail_registerBtn').html("已注册");
                $('#detail_registerBtn').attr('class',"weui_btn weui_btn_mini weui_btn_disabled weui_btn_default");
                $('#detail_signBtn').show();
            }
        });
    }

	function viewHomeDetail(id){
        $('#detail_info').text("");
        $('#detail_lesson_id').val("");
        //stopRefreshDetail();
        //startRefreshDetail(id);
        loadTodayLesson(id);
        getRegisterSum(id);
        getMyRegisterStatus(id);

        CG.PostController.get('/v1/post/'+id, function(err, data){
            $('#detail_id').val(id);
            $('#detail_author').text(data.fullname + '-'+data.profession);
            $('#detail_photo').attr('src', data.photo);
            $('#detail_title').text(data.title);
            var addr = "";
            var time = "";
            if (data.time){
                time += data.time;
            }
            if (data.address){
                addr += data.address;
            }
            $('#detail_time').text(time);
            $('#detail_address').text(addr);
            $('#detail_body').text(data.body);

            if (data.authorId == window.sessionStorage.getItem("userId")){
                $('#detail_owner').show();
                $('#detail_edit').show();
                $('#detail_other').hide();
            }
            else{
                $('#detail_owner').hide();
                $('#detail_other').show();
                $('#detail_edit').hide();
            }
        });
    }

    function updateMeView(view, data){
        if (data.photo){
            $('#' + view +'_photo').attr('src', data.photo);
        }
        if (data.nickname){
            $('#' + view +'_nickname').text(data.nickname);
        }
        
        $('#' + view +'_fullname').val(data.fullname);
        $('#' + view +'_fullname').text(data.fullname);

        $('#' + view +'_studentNo').val(data.studentNo);
        $('#' + view +'_studentNo').text(data.studentNo);

        $('#' + view +'_profession').val(data.profession);
        $('#' + view +'_profession').text(data.profession);

        $('#' + view +'_school').val(data.school);
        $('#' + view +'_school').text(data.school);
    }

    function saveUserInfo(){
        var data = {fullname:$(me_edit_fullname).val(), studentNo:$(me_edit_studentNo).val(), profession: $(me_edit_profession).val(), school: $(me_edit_school).val()};
        
        CG.MyController.update(data, function(err, result){
                updateMeView('me_show', data);   
                $.mobile.changePage("#pageMe");
        });
    }

    function registerClass() {
        CG.PostController.post('/v1/post/'+$('#detail_id').val()+'/register', {}, function(err, data){
            if (!err){
                $('#detail_info').text("注册成功");
                $('#detail_registerBtn').html("已注册");
                $('#detail_registerBtn').attr('class',"weui_btn weui_btn_mini weui_btn_disabled weui_btn_default");
                $('#detail_signBtn').show();
            }
        });
    }

    function signIn() {
        // /v1/post/lesson/:id/sign
        //{"lng":12312.1231, "lat":1.2342}
        wx.getLocation({
            type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            success: function (res) {
                console.log(res);

                var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                var speed = res.speed; // 速度，以米/每秒计
                var accuracy = res.accuracy; // 位置精度

                var data = {"lng":longitude, "lat":latitude};
                if ($('#detail_lesson_id').val().length == 0){
                    $('#detail_info').text("签名未开启或已结束，无法签到");
                    return;
                }

                CG.PostController.post('/v1/post/lesson/'+$('#detail_lesson_id').val()+'/sign', data, function(err, data){
                    if (!err){
                        $('#detail_info').text("恭喜今日签到成功");
                        $('#detail_signBtn').html("已签到");
                    }
                });
            },
            fail: function(res) {
                console.log(res);
            }
        });
    }

    function startSignIn() {
        
        // {"status": 1, "starttime": "2010-10-05", "timeout": 600, "lng":12312.1231, "lat":1.2342}
        wx.getLocation({
            type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            success: function (res) {
                var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                var speed = res.speed; // 速度，以米/每秒计
                var accuracy = res.accuracy; // 位置精度

                var data = {"status": 1, "starttime": new Date(), "timeout": 600, "lng":longitude, "lat":latitude};
                CG.PostController.post('/v1/post/'+$('#detail_id').val()+'/lesson', data, function(err, data){
                    if (!err){
                        $('#detail_lesson_id').val(data.id);
                        $('#detail_info').text("签名已开始,请通知学员开始签到，10分钟后签到会自动关闭。");
                    }
                });
            },
            fail: function(res) {
                console.log(res);
            }
        });
    }

    function viewSign(){
        $.mobile.changePage("#pageStudents");
    }

    function editPost(){
        var id = $('#detail_id').val();
        $('#create_id').val(id);
        CG.PostController.get('/v1/post/'+id, function(err, data){
            $('#create_title').val(data.title);
            $('#create_body').val(data.body);
            $('#create_time').val(data.time);
            $('#create_address').val(data.address);
            $.mobile.changePage("#pageAddClass");
        });  
    }

  

// The Mobile Safari Forms Assistant pushes the page up if it needs to scroll, but jQuery Mobile
// doesn't scroll the page back down. This code corrects that.
//
// I decided this should not be incorporated into jquery.mobile.iscrollview.js itself, since it
// really isn't related to iScroll - it is an issue that occurs when using pages that are sized
// to match full-height on mobile device.
//
// There is still code in jquery.mobile.iscrollview.js that deal with a similar issue with
// the address bar, and I think it really doesn't belong there.
//
// IDEA: Create a new plug-in to deal with such concerns: e.g. jquery.mobile.fullheight.
(function mobileSafariFormsAssistantHack($) {
  "use strict";
  $(document).bind("pageinit",
    function installDelegation(pageEvent) {
      var $page = $(pageEvent.target);
      $page.delegate("input,textarea,select", "blur",
        function onBlur(inputEvent) {
          setTimeout(function onAllBlurred() {  // Need this timeout for .ui-focus to clear
            // Are all of the input elements on the page blurred (not focused)?
            if ($page.find("input.ui-focus,textarea.ui-focus,select.ui-focus").length === 0) {
              $.mobile.silentScroll(0);        // If so, scroll to top
              }
            },
          0);
        });
    });
  }(jQuery));

$(document).bind("mobileinit", function() {
  $.mobile.defaultPageTransition = "slide";
  });

// Simple fast-click implementation
// This serves two purposes:
// - Eliminates 400mSec click latency on iOS
// - using $.mobile.changePage prevents the iOS address bar from coming down
// We use data-href instead of href, and data-ajax="false" on links to prevent
// default browser and JQM Ajax action on all JQM versions. since we use $.mobile.changePage,
// it uses Ajax page changes.
$(document).delegate(".fastclick", "vclick click", function(event) {
  var
    $btn = $(this),
    href = $btn.jqmData("href");
  event.preventDefault();
  if ( event === "click" ) { return; }
  $.mobile.changePage(href);
});

/*jslint browser: true, sloppy: true, white: true, nomen: true, plusplus:true, maxerr: 50, indent: 2 */
/*global jQuery:false, iScroll:false */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true,
         undef:true, curly:true, browser:true, jquery:true, indent:2, maxerr:50,
         white:false, nomen:false */
// $.mobile.changePage
//-------------------------------------------------------
// Pull-Up and Pull-Down callbacks for "Pull" page
//-------------------------------------------------------
(function pullPagePullImplementation($) {
  "use strict";
  var pullDownGeneratedCount = 0,
      pullUpGeneratedCount = 0,
      limit = 20,
      listSelector = "div.home-page ul.ui-listview",
      lastItemSelector = listSelector + " > li:last-child";

   function gotHomeData(skip, callback){
    	CG.PostController.get('/v1/post?filter={"order":"createAt","skip":'+skip+',"limit":'+limit+'}', function(err, data){
	        callback(err, data);
    	});
	}

	function initData() {
		gotHomeData(0, function(err, content){
			gotPullDownData(null, null, content);
		});
	}
    
  /* For this example, I prepend three rows to the list with the pull-down, and append
   * 3 rows to the list with the pull-up. This is only to make a clear illustration that the
   * action has been performed. A pull-down or pull-up might prepend, append, replace or modify
   * the list in some other way, modify some other page content, or may not change the page 
   * at all. It just performs whatever action you'd like to perform when the gesture has been 
   * completed by the user.
   */
  function gotPullDownData(event, data, content) {
    var i,
        newContent = "";

    content.forEach(function(e){
    	var html = '<li data-icon="false"><a href="#pageDetail?id='+ e.id +'">';
    	html += '<img src="'+ e.photo +'">';
    	html += '<h2>' + e.title + '</h2>';
    	html += '<span class="ui-li-count">'+$.timeago(e.createAt)+'</span></a></li>'
    	newContent = html + newContent;
    }); 

    pullDownGeneratedCount += content.length;
    
    $(listSelector).prepend(newContent).listview("refresh");  // Prepend new content and refresh listview
    	if (data) {
    		data.iscrollview.refresh();    // Refresh the iscrollview
    	}
    }
  
  function gotPullUpData(event, data) {
    var i,
        iscrollview = data.iscrollview,
        newContent = "";
    for (i=0; i<3; i+=1) { 
      newContent += "<li>Pullup-generated row " + (++pullUpGeneratedCount) + "</li>";
      }
    $(listSelector).append(newContent).listview("refresh");
  
    // The refresh is a bit different for the pull-up, because I want to demonstrate the use
    // of refresh() callbacks. The refresh() function has optional pre and post-refresh callbacks.
    // Here, I use a post-refresh callback to do a timed scroll to the bottom of the list
    // after the new elements are added. The scroller will smoothly scroll to the bottom over
    // a 400mSec period. It's important to use the refresh() callback to insure that the scroll
    // isn't started until the scroller has first been refreshed.
    iscrollview.refresh(null, null,
      $.proxy(function afterRefreshCallback(iscrollview) { 
        this.scrollToElement(lastItemSelector, 400); 
        }, iscrollview) ); 
    }
  
  // This is the callback that is called when the user has completed the pull-down gesture.
  // Your code should initiate retrieving data from a server, local database, etc.
  // Typically, you will call some function like jQuery.ajax() that will make a callback
  // once data has been retrieved.
  //
  // For demo, we just use timeout to simulate the time required to complete the operation.
  function onPullDown (event, data) {
  	gotHomeData(pullDownGeneratedCount, function(err, content){
  		if (err){
  			return;
  		}
  		gotPullDownData(event, data, content);
  	});
  }    

  // Called when the user completes the pull-up gesture.
  function onPullUp (event, data) { 
    setTimeout(function fakeRetrieveDataTimeout() {
      gotPullUpData(event, data);
      }, 
      1500); 
    }    
  
  // Set-up jQuery event callbacks
  $(document).delegate("div.home-page", "pageinit", 
    function bindPullPagePullCallbacks(event) {
      $(".iscroll-wrapper", this).bind( {
      iscroll_onpulldown : onPullDown,
      iscroll_onpullup   : onPullUp
      } );
    } );  

  

  $(document).ready(function(){
  	initData();
  });

  }(jQuery));


// pageMyFavourite
(function pullPagePullImplementation($) {
  "use strict";
  var pullDownGeneratedCount = 0,
      pullUpGeneratedCount = 0,
      limit = 20,
      listSelector = "div.favourite-page ul.ui-listview",
      lastItemSelector = listSelector + " > li:last-child";

   function gotFavouriteData(skip, callback){
        CG.PostController.get('/v1/post/register?filter={"order":"createAt","skip":'+skip+',"limit":'+limit+'}', function(err, data){
            callback(err, data);
        });
    }

    function initData() {
        if ($(listSelector) && $(listSelector).html() && $(listSelector).html().length > 0){
            ;
        }
        else {
            gotFavouriteData(0, function(err, content){
                gotPullDownData(null, null, content);
            });
        }
    }
    
  /* For this example, I prepend three rows to the list with the pull-down, and append
   * 3 rows to the list with the pull-up. This is only to make a clear illustration that the
   * action has been performed. A pull-down or pull-up might prepend, append, replace or modify
   * the list in some other way, modify some other page content, or may not change the page 
   * at all. It just performs whatever action you'd like to perform when the gesture has been 
   * completed by the user.
   */
  function gotPullDownData(event, data, content) {
    var i,
        newContent = "";

    content.forEach(function(e){
        var html = '<li data-icon="false"><a href="#pageDetail?id='+ e.id +'">';
        html += '<img src="'+ e.photo +'">';
        html += '<h2>' + e.title + '</h2>';
        html += '<span class="ui-li-count">'+$.timeago(e.createAt)+'</span></a></li>'
        newContent = html + newContent;
    }); 

    pullDownGeneratedCount += content.length;
    
    $(listSelector).prepend(newContent).listview("refresh");  // Prepend new content and refresh listview
        if (data) {
            data.iscrollview.refresh();    // Refresh the iscrollview
        }
    }
  
  function gotPullUpData(event, data) {
    var i,
        iscrollview = data.iscrollview,
        newContent = "";
    for (i=0; i<3; i+=1) { 
      newContent += "<li>Pullup-generated row " + (++pullUpGeneratedCount) + "</li>";
      }
    $(listSelector).append(newContent).listview("refresh");
  
    // The refresh is a bit different for the pull-up, because I want to demonstrate the use
    // of refresh() callbacks. The refresh() function has optional pre and post-refresh callbacks.
    // Here, I use a post-refresh callback to do a timed scroll to the bottom of the list
    // after the new elements are added. The scroller will smoothly scroll to the bottom over
    // a 400mSec period. It's important to use the refresh() callback to insure that the scroll
    // isn't started until the scroller has first been refreshed.
    iscrollview.refresh(null, null,
      $.proxy(function afterRefreshCallback(iscrollview) { 
        this.scrollToElement(lastItemSelector, 400); 
        }, iscrollview) ); 
    }
  
  // This is the callback that is called when the user has completed the pull-down gesture.
  // Your code should initiate retrieving data from a server, local database, etc.
  // Typically, you will call some function like jQuery.ajax() that will make a callback
  // once data has been retrieved.
  //
  // For demo, we just use timeout to simulate the time required to complete the operation.
  function onPullDown (event, data) {
    gotHomeData(pullDownGeneratedCount, function(err, content){
        if (err){
            return;
        }
        gotPullDownData(event, data, content);
    });
  }    

  // Called when the user completes the pull-up gesture.
  function onPullUp (event, data) { 
    setTimeout(function fakeRetrieveDataTimeout() {
      gotPullUpData(event, data);
      }, 
      1500); 
    }    
  
  // Set-up jQuery event callbacks
  $(document).delegate("div.favourite-page", "pageinit", 
    function bindPullPagePullCallbacks(event) {
      $(".iscroll-wrapper", this).bind( {
      iscroll_onpulldown : onPullDown,
      iscroll_onpullup   : onPullUp
      } );
    } );  

  $(document).on("pagebeforechange", function(e, f){
    if (typeof f.toPage !== "string"){
        return;
    }
    
    var hashs = $.mobile.path.parseUrl(f.absUrl).hash.split("?");
    var hash = hashs[0];

    if (hash === "#pageMyFavourite"){
        initData();
    }
    
    console.log("pageMyFavourite pagebeforechange");
    
  });

  }(jQuery));


// pageMyClass
(function pullPagePullImplementation($) {
  "use strict";
  var pullDownGeneratedCount = 0,
      pullUpGeneratedCount = 0,
      limit = 20,
      listSelector = "div.class-page ul.ui-listview",
      lastItemSelector = listSelector + " > li:last-child";

   function gotMyClassData(skip, callback){
        CG.PostController.get('/v1/post/owner?filter={"order":"createAt","skip":'+skip+',"limit":'+limit+'}', function(err, data){
            callback(err, data);
        });
    }

    function initData() {
        if ($(listSelector) && $(listSelector).html() && $(listSelector).html().length > 0){
            ;
        }
        else {
            gotMyClassData(0, function(err, content){
                if (!err){
                    gotPullDownData(null, null, content);
                }
            });
        }
    }
    
  /* For this example, I prepend three rows to the list with the pull-down, and append
   * 3 rows to the list with the pull-up. This is only to make a clear illustration that the
   * action has been performed. A pull-down or pull-up might prepend, append, replace or modify
   * the list in some other way, modify some other page content, or may not change the page 
   * at all. It just performs whatever action you'd like to perform when the gesture has been 
   * completed by the user.
   */
  function gotPullDownData(event, data, content) {
    var i,
        newContent = "";
        
    content.forEach(function(e){
        var html = '<li data-icon="false"><a href="#pageDetail?id='+ e.id +'">';
        //html += '<img src="'+ e.photo +'">';
        html += '<h2>' + e.title + '</h2>';
        html += '<span class="ui-li-count">'+$.timeago(e.createAt)+'</span></a></li>'
        newContent = html + newContent;
    }); 

    pullDownGeneratedCount += content.length;
    
    $(listSelector).prepend(newContent).listview("refresh");  // Prepend new content and refresh listview
        if (data) {
            data.iscrollview.refresh();    // Refresh the iscrollview
        }
    }
  
  function gotPullUpData(event, data) {
    var i,
        iscrollview = data.iscrollview,
        newContent = "";
    for (i=0; i<3; i+=1) { 
      newContent += "<li>Pullup-generated row " + (++pullUpGeneratedCount) + "</li>";
      }
    $(listSelector).append(newContent).listview("refresh");
  
    // The refresh is a bit different for the pull-up, because I want to demonstrate the use
    // of refresh() callbacks. The refresh() function has optional pre and post-refresh callbacks.
    // Here, I use a post-refresh callback to do a timed scroll to the bottom of the list
    // after the new elements are added. The scroller will smoothly scroll to the bottom over
    // a 400mSec period. It's important to use the refresh() callback to insure that the scroll
    // isn't started until the scroller has first been refreshed.
    iscrollview.refresh(null, null,
      $.proxy(function afterRefreshCallback(iscrollview) { 
        this.scrollToElement(lastItemSelector, 400); 
        }, iscrollview) ); 
    }
  
  // This is the callback that is called when the user has completed the pull-down gesture.
  // Your code should initiate retrieving data from a server, local database, etc.
  // Typically, you will call some function like jQuery.ajax() that will make a callback
  // once data has been retrieved.
  //
  // For demo, we just use timeout to simulate the time required to complete the operation.
  function onPullDown (event, data) {
    gotHomeData(pullDownGeneratedCount, function(err, content){
        if (err){
            return;
        }
        gotPullDownData(event, data, content);
    });
  }    

  // Called when the user completes the pull-up gesture.
  function onPullUp (event, data) { 
    setTimeout(function fakeRetrieveDataTimeout() {
      gotPullUpData(event, data);
      }, 
      1500); 
    }    
  
  // Set-up jQuery event callbacks
  $(document).delegate("div.class-page", "pageinit", 
    function bindPullPagePullCallbacks(event) {
      $(".iscroll-wrapper", this).bind( {
      iscroll_onpulldown : onPullDown,
      iscroll_onpullup   : onPullUp
      } );
    } );  

  $(document).ready(function(){
    initData();
  });

  $(document).on("pagebeforechange", function(e, f){
    if (typeof f.toPage !== "string"){
        return;
    }

    var hashs = $.mobile.path.parseUrl(f.absUrl).hash.split("?");
    var hash = hashs[0];

    if (hash === "#pageMyClass"){
        initData();
    }
    
    console.log("pageMyClass pagebeforechange");
    
  });

  }(jQuery));


//pageStudents
(function pullPagePullImplementation($) {
  "use strict";

var $table = $('#table'),
        $remove = $('#remove'),
        selections = [];

    function initTable() {
        $table.bootstrapTable({
            height: getHeight(),
            columns: [
                [
                    {
                        field: 'state',
                        checkbox: true,
                        rowspan: 2,
                        align: 'center',
                        valign: 'middle'
                    }, {
                        title: 'Item ID',
                        field: 'id',
                        rowspan: 2,
                        align: 'center',
                        valign: 'middle',
                        sortable: true,
                        footerFormatter: totalTextFormatter
                    }, {
                        title: 'Item Detail',
                        colspan: 3,
                        align: 'center'
                    }
                ],
                [
                    {
                        field: 'name',
                        title: 'Item Name',
                        sortable: true,
                        editable: true,
                        footerFormatter: totalNameFormatter,
                        align: 'center'
                    }, {
                        field: 'price',
                        title: 'Item Price',
                        sortable: true,
                        align: 'center',
                        editable: {
                            type: 'text',
                            title: 'Item Price',
                            validate: function (value) {
                                value = $.trim(value);
                                if (!value) {
                                    return 'This field is required';
                                }
                                if (!/^\$/.test(value)) {
                                    return 'This field needs to start width $.'
                                }
                                var data = $table.bootstrapTable('getData'),
                                    index = $(this).parents('tr').data('index');
                                console.log(data[index]);
                                return '';
                            }
                        },
                        footerFormatter: totalPriceFormatter
                    }, {
                        field: 'operate',
                        title: 'Item Operate',
                        align: 'center',
                        events: operateEvents,
                        formatter: operateFormatter
                    }
                ]
            ]
        });
        // sometimes footer render error.
        setTimeout(function () {
            $table.bootstrapTable('resetView');
        }, 200);
        $table.on('check.bs.table uncheck.bs.table ' +
                'check-all.bs.table uncheck-all.bs.table', function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);

            // save your data, here just save the current page
            selections = getIdSelections();
            // push or splice the selections if you want to save all data selections
        });
        $table.on('expand-row.bs.table', function (e, index, row, $detail) {
            if (index % 2 == 1) {
                $detail.html('Loading from ajax request...');
                $.get('LICENSE', function (res) {
                    $detail.html(res.replace(/\n/g, '<br>'));
                });
            }
        });
        $table.on('all.bs.table', function (e, name, args) {
            console.log(name, args);
        });
        $remove.click(function () {
            var ids = getIdSelections();
            $table.bootstrapTable('remove', {
                field: 'id',
                values: ids
            });
            $remove.prop('disabled', true);
        });
        $(window).resize(function () {
            $table.bootstrapTable('resetView', {
                height: getHeight()
            });
        });
    }

    function getIdSelections() {
        return $.map($table.bootstrapTable('getSelections'), function (row) {
            return row.id
        });
    }

    function responseHandler(res) {
        $.each(res.rows, function (i, row) {
            row.state = $.inArray(row.id, selections) !== -1;
        });
        return res;
    }

    function detailFormatter(index, row) {
        var html = [];
        $.each(row, function (key, value) {
            html.push('<p><b>' + key + ':</b> ' + value + '</p>');
        });
        return html.join('');
    }

    function operateFormatter(value, row, index) {
        return [
            '<a class="like" href="javascript:void(0)" title="Like">',
            '<i class="glyphicon glyphicon-heart"></i>',
            '</a>  ',
            '<a class="remove" href="javascript:void(0)" title="Remove">',
            '<i class="glyphicon glyphicon-remove"></i>',
            '</a>'
        ].join('');
    }

    window.operateEvents = {
        'click .like': function (e, value, row, index) {
            alert('You click like action, row: ' + JSON.stringify(row));
        },
        'click .remove': function (e, value, row, index) {
            $table.bootstrapTable('remove', {
                field: 'id',
                values: [row.id]
            });
        }
    };

    function totalTextFormatter(data) {
        return 'Total';
    }

    function totalNameFormatter(data) {
        return data.length;
    }

    function totalPriceFormatter(data) {
        var total = 0;
        $.each(data, function (i, row) {
            total += +(row.price.substring(1));
        });
        return '$' + total;
    }

    function getHeight() {
        return $(window).height() - $('h1').outerHeight(true);
    }

    $(function () {
        var scripts = [
                location.search.substring(1) || 'lib/bootstrap/bootstrap-table.js'
            ],
            eachSeries = function (arr, iterator, callback) {
                callback = callback || function () {};
                if (!arr.length) {
                    return callback();
                }
                var completed = 0;
                var iterate = function () {
                    iterator(arr[completed], function (err) {
                        if (err) {
                            callback(err);
                            callback = function () {};
                        }
                        else {
                            completed += 1;
                            if (completed >= arr.length) {
                                callback(null);
                            }
                            else {
                                iterate();
                            }
                        }
                    });
                };
                iterate();
            };

        eachSeries(scripts, getScript, initTable);
    });

    function getScript(url, callback) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.src = url;

        var done = false;
        // Attach handlers for all browsers
        script.onload = script.onreadystatechange = function() {
            if (!done && (!this.readyState ||
                    this.readyState == 'loaded' || this.readyState == 'complete')) {
                done = true;
                if (callback)
                    callback();

                // Handle memory leak in IE
                script.onload = script.onreadystatechange = null;
            }
        };

        head.appendChild(script);

        // We handle everything using the script element injection
        return undefined;
    }

  $(document).on("pagebeforechange", function(e, f){
    if (typeof f.toPage !== "string"){
        return;
    }

    var hashs = $.mobile.path.parseUrl(f.absUrl).hash.split("?");
    var hash = hashs[0];

    if (hash === "#pageStudents"){
        initTable();
    }
    
  });

  }(jQuery));

(function pullPagePullImplementation($) {
  "use strict";

  function wxinit(){
        var timestamp=Math.round(new Date().getTime()/1000);
        var noncestr='2nDgiWM7gCxhL8v087';
        var url = window.location.origin + window.location.pathname;

        CG.PostController.post('/v1/wechat/signature', {url:url, timestamp: timestamp, noncestr:noncestr}, function(err, data){
        if (err){
            console.log(err);
            return;
        }

        wx.config({
          debug: false,
          appId: 'wxf4802f2b0504b7b3',
          timestamp: timestamp,
          nonceStr: noncestr,
          signature: data.signature,
          jsApiList: [
            'checkJsApi',
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'onMenuShareQQ',
            'onMenuShareWeibo',
            'hideMenuItems',
            'showMenuItems',
            'hideAllNonBaseMenuItem',
            'showAllNonBaseMenuItem',
            'translateVoice',
            'startRecord',
            'stopRecord',
            'onRecordEnd',
            'playVoice',
            'pauseVoice',
            'stopVoice',
            'uploadVoice',
            'downloadVoice',
            'chooseImage',
            'previewImage',
            'uploadImage',
            'downloadImage',
            'getNetworkType',
            'openLocation',
            'getLocation',
            'hideOptionMenu',
            'showOptionMenu',
            'closeWindow',
            'scanQRCode',
            'chooseWXPay',
            'openProductSpecificView',
            'addCard',
            'chooseCard',
            'openCard'
          ]
      });});
  }

  
  $(document).ready(function(){
    wxinit();
  });

  $(document).on("pagebeforechange", function(e, f){
    if (typeof f.toPage !== "string"){
        return;
    }

    var hashs = $.mobile.path.parseUrl(f.absUrl).hash.split("?");
    var hash = hashs[0];
    var search = hashs[1];
    window.sessionStorage.setItem("detail-search", search);
    window.location.mysearch = search;

    if (hash === "#pageDetail"){
      if (search){
        var id = search.split("=")[1];
        window.sessionStorage.setItem("postId", id);
        viewHomeDetail(id);
      }
    }
    else if (hash === "#pageMe" || hash === "#pageMeEdit" || hash === "#pageStep1" ) {
        CG.MyController.load(function(data){
            updateMeView('me_edit', data);
            updateMeView('me_show', data);
            updateMeView('me_step', data);
        });
    }

    console.log("default pagebeforechange");
    
  });

}(jQuery));









