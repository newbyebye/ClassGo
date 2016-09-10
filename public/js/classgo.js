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

    CG.PullDownRefresh = CG.Object.extend({
        pullDownGeneratedCount: 0,
        pullUpGeneratedCount: 0,
        PAGE_SIZE: 20,

        //costomer define
        listSelector:"",
        loadData: function(skip, limit, callback){

        },

        getCount: function(callback){

        },

        showData: function(item){

        },

        initData: function(){
            var self = this;
            self.getCount(function(err, data){
                if(!err){
                    if (data.count < self.PAGE_SIZE){
                        self.pullDownGeneratedCount = 0;
                    }
                    else{
                        self.pullDownGeneratedCount = data.count - self.PAGE_SIZE;
                    }
                    
                    self.pullUpGeneratedCount = self.pullDownGeneratedCount;

                    self.loadData(self.pullDownGeneratedCount, self.PAGE_SIZE, function(err, content){
                        self.gotPullDownData(null, null, content);
                    });
                }
            });
        },

        gotPullDownData: function(event, data, content) {
            var newContent = "";
            var self = this;
            content.forEach(function(item){
                newContent = self.showData(item) + newContent;
            }); 

            self.pullDownGeneratedCount += content.length;
    
            $(self.listSelector).prepend(newContent).listview("refresh");  // Prepend new content and refresh listview
            if (data) {
                data.iscrollview.refresh();    // Refresh the iscrollview
            }
        },

        gotPullUpData: function(event, data, content) {
            var newContent = "";
            var self = this;
            content.forEach(function(item){
                newContent = self.showData(item) + newContent;
            }); 
    
            $(self.listSelector).append(newContent).listview("refresh");  // Prepend new content and refresh listview
            if (data) {
                data.iscrollview.refresh();    // Refresh the iscrollview
            }
        },

        onPullDown: function(event, data){
            var self = this;
            self.loadData(self.pullDownGeneratedCount, self.PAGE_SIZE, function(err, content){
                if (err){
                    return self.gotPullDownData(event, data, []);
                }
                self.gotPullDownData(event, data, content);
            });
        },

        onPullUp: function(event, data){
            var self = this;
            var limit = self.PAGE_SIZE;
            if (self.pullUpGeneratedCount == 0){
                self.gotPullUpData(event, data, []);
                return;
            }
            if (self.pullUpGeneratedCount - self.PAGE_SIZE > 0){
                self.pullUpGeneratedCount = self.pullUpGeneratedCount - self.PAGE_SIZE;
            }
            else{
                limit = self.pullUpGeneratedCount;
                self.pullUpGeneratedCount = 0;
            }
            self.loadData(self.pullUpGeneratedCount, limit, function(err, content){
                self.gotPullUpData(event, data, content);
            }); 
        }
    });

    CG.HomePullDownRefresh = CG.PullDownRefresh.extend({
        //costomer define
        listSelector:"div.home-page ul.ui-listview",
        loadData: function(skip, limit, callback){
            CG.PostController.get('/v1/post?filter={"order":"createAt ASC","skip":'+skip+',"limit":'+limit+'}', function(err, data){
                callback(err, data);
            });
        },

        getCount: function(callback){
            CG.PostController.get('/v1/post/count', function(err, content){
                callback(err, content);
            });
        },

        showData: function(item){
            var html = '<li data-icon="false"><a href="#pageDetail?id='+ item.id +'">';
            html += '<img src="'+ item.photo +'">';
            html += '<h2>' + item.title + '</h2>';
            html += '<p class="ui-li-aside"><strong>'+$.timeago(item.createAt)+'</strong></p></a><hr></li>';
            return html;
        }
    });

    CG.MyClassPullDownRefresh = CG.PullDownRefresh.extend({
        //costomer define
        listSelector:"div.class-page ul.ui-listview",
        loadData: function(skip, limit, callback){
            CG.PostController.get('/v1/post/owner?filter={"order":"createAt ASC","skip":'+skip+',"limit":'+limit+'}', function(err, data){
                callback(err, data);
            });
        },

        getCount: function(callback){
            CG.PostController.get('/v1/post/owner/count', function(err, content){
                callback(err, content);
            });
        },

        showData: function(item){
            var html = '<li data-icon="false"><a href="#pageDetail?id='+ item.id +'">';
            html += '<h2>' + item.title + '</h2>';
            html += '<span class="ui-li-count">'+$.timeago(item.createAt)+'</span></a><hr></li>'
            return html;
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

function step1(){
    if ($("input[name='checkbox1']:checked").val() == "0"){
        $("#me_step_studentNo_view").show();
        $("#me_step_info").show();           
    }
    else{
        $("#me_step_studentNo_view").hide();
        $("#me_step_info").hide();
    }
    window.location = '#pageStep2';
}

function delayHideStepError(){
   setTimeout(function(){
      $("#step_error_div").hide();
   }, 5000);
}

function saveStepInfo(){
    var data = {fullname:$(me_step_fullname).val(),              
                mobile: $(me_step_mobile).val(), 
                password: CryptoJS.SHA256($(me_step_password).val()).toString(),
                role: $("input[name='checkbox1']:checked").val()
            };

    var pwd = $(me_step_password).val();
    if (pwd.length == 0 || pwd.length > 30 || $(me_step_password).val() != $(me_step_password_confirm).val()){
        $("#step_error_msg").text("密码输入不合法，请确认2次输入密码是否相同");
        $("#step_error_div").show();
        delayHideStepError();
        return;
    }

    if ($(me_step_mobile).val().length != 11){
        $("#step_error_msg").text("请输入合法手机号");
        $("#step_error_div").show();
        delayHideStepError();
        return;
    }

    var role = $("input[name='checkbox1']:checked").val();

    if (role == 0){
        if ($(me_step_studentNo).val().length == 0){
            $("#step_error_msg").text("请输入学号");
            $("#step_error_div").show();
            delayHideStepError();
            return;
        }

        data.studentNo = $(me_step_studentNo).val();
    }

    if ($(me_step_fullname).val().length == 0){
        $("#step_error_msg").text("请输入姓名");
        $("#step_error_div").show();
        delayHideStepError();
        return;
    }

    CG.MyController.update(data, function(err, result){
            updateMeView('me_show', data);   
            window.location = "./home.html";
    });
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
    $.ajaxFileUpload({  
            url:"./v1/post/"+window.sessionStorage.getItem("postId")+"/upload?token="+window.sessionStorage.getItem("token"),  
            secureuri:false,
            fileElementId:'upload_file',//file标签的id  
            dataType: 'json',//返回数据的类型  
            success: function (data, status) {  
                if (data.count){
                    $("#upload_msg").text("成功导入"+filterXSS("" + data.count)+"条注册信息");
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
            $('#detail_sum').text(filterXSS("" + data.sum));
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
                            <div class="wechat-h-time"><h5>'+filterXSS(e.title)+'</h5><time>'+$.timeago(e.createAt)+'</time></div>\
                            <p>'+filterXSS(e.body)+'</p>\
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
                        <img src="'+ filterXSS(e.photo) +'">\
                        <div class="cell">\
                            <div class="wechat-h-time"><h5>'+filterXSS(e.title)+'</h5><time>'+$.timeago(e.createAt)+'</time></div>\
                            <p>'+filterXSS(e.body)+'</p>\
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
                    $("#startSignIn").text("关闭签到");
                }
                else{
                    $('#detail_lesson_id').val("");
                    $("#startSignIn").text("开启签到");
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
        loadTodayLesson(id);
        getRegisterSum(id);
        getMyRegisterStatus(id);

        CG.PostController.get('/v1/post/'+id, function(err, data){
            $('#detail_id').val(id);
            $('#detail_author').text(filterXSS(data.fullname + '-'+data.profession));
            $('#detail_photo').attr('src', filterXSS(data.photo));
            $('#detail_title').text(filterXSS(data.title));
            var addr = "";
            var time = "";
            if (data.time){
                time += data.time;
            }
            if (data.address){
                addr += data.address;
            }
            $('#detail_time').text(filterXSS(time));
            $('#detail_address').text(filterXSS(addr));
            $('#detail_body').text(filterXSS(data.body));

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
            $('#' + view +'_photo').attr('src', filterXSS(data.photo));
        }
        if (data.nickname){
            $('#' + view +'_nickname').text(filterXSS(data.nickname));
        }
        
        $('#' + view +'_fullname').val(filterXSS(data.fullname));
        $('#' + view +'_fullname').text(filterXSS(data.fullname));

        $('#' + view +'_studentNo').val(filterXSS(data.studentNo));
        $('#' + view +'_studentNo').text(filterXSS(data.studentNo));

        if (data.profession){
            $('#' + view +'_profession').val(filterXSS(data.profession));
            $('#' + view +'_profession').text(filterXSS(data.profession));
        }
        
        if (data.school){
            $('#' + view +'_school').val(filterXSS(data.school));
            $('#' + view +'_school').text(filterXSS(data.school));
        }

        if (data.role != undefined){
            if (data.role == 1 || data.role == "1"){
                $('#' + view +'_studentNo_div').hide();
            }
            else{
                $('#' + view +'_studentNo_div').show();
            }
        }
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
        var text = $("#startSignIn").text();
        var status = 1;
        if("开启签到" == text){
            status = 1;
        }
        else{
            status = 2;
        }

        wx.getLocation({
            type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            success: function (res) {
                var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                var speed = res.speed; // 速度，以米/每秒计
                var accuracy = res.accuracy; // 位置精度

                var data = {"status": status, "starttime": new Date(), "timeout": 180*60, "lng":longitude, "lat":latitude};
                CG.PostController.post('/v1/post/'+$('#detail_id').val()+'/lesson', data, function(err, data){
                    if (!err){
                        $('#detail_lesson_id').val(data.id);
                        if(status == 1){
                            $('#detail_info').text("签名已开始,请通知学员开始签到，180分钟后签到会自动关闭。");
                            $("#startSignIn").text("关闭签到");
                        }
                        else{
                            $("#startSignIn").text("开启签到");
                        }
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
            $('#create_title').val(filterXSS(data.title));
            $('#create_body').val(filterXSS(data.body));
            $('#create_time').val(filterXSS(data.time));
            $('#create_address').val(filterXSS(data.address));
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


(function pullPagePullImplementation($) {
  "use strict";

    function onPullDown (event, data) {
        CG.HomePullDownRefresh.onPullDown(event, data);
    }    

  // Called when the user completes the pull-up gesture.
    function onPullUp (event, data) {
        CG.HomePullDownRefresh.onPullUp(event, data);
    }

    function initData() {
        CG.HomePullDownRefresh.initData();
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


// pageMyClass
(function pullPagePullImplementation($) {
  "use strict";
    function onPullDown (event, data) {
        CG.MyClassPullDownRefresh.onPullDown(event, data);
    }    

  // Called when the user completes the pull-up gesture.
    function onPullUp (event, data) {
        CG.MyClassPullDownRefresh.onPullUp(event, data);
    }

    function initData() {
        CG.MyClassPullDownRefresh.initData();
    }
  
  // Set-up jQuery event callbacks
  $(document).delegate("div.class-page", "pageinit", 
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

    if (hash === "#pageMyClass"){
        initData();
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
    else if (hash === "#pageStudents"){
        console.log("pageStudents");
        CG.PostController.get("/v1/post/"+window.sessionStorage.getItem("postId")+"/minireport", function(err, result){
            //var $table = $('#info_table');
            //$table.bootstrapTable('destroy');
            if (err){
                return;
            }
            $("#student_numbers").text(filterXSS(""+result.count) + "人签到");
            /*
            $table.bootstrapTable({data: result.rows, 
                  columns: [{
                    field: 'studentNo',
                    title: '学号'
                  },
                  {
                    field: 'fullname',
                    title: '姓名'
                  },
                  {
                    field: result.ucols,
                    title: result.ucols
                  }]
                });*/
        });
    }    
  });

}(jQuery));









