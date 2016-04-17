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
		get : function(path, successProc, errorProc, bAsync) {
			var isAsyncLoad = true;
			if (typeof (bAsync) != 'undefined') {
				isAsyncLoad = bAsync;
			}
			$.ajax({
				url : path,
				dataType : 'json',
				async : isAsyncLoad,
				headers : {"x-access-token":window.localStorage.getItem("token")},
				/*
				dataFilter : function(data, type) {
					return data;
				},*/
				success : function(data) {
					successProc(data);
				},
				error : function(err, textStatus) {
					if (errorProc) {
						errorProc(err, textStatus);
					}
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

		internalPost: function (path, data, type, successProc, errorProc) {
			var self = this;
			jQuery.ajax({
				url : path,
				type : type,
				data : self.createSubmitData(data),
				dataType : "json",
				contentType : "application/json;charset=UTF-8",
				headers : {"x-access-token":window.localStorage.getItem("token")},
				success : function(result) {
					if (successProc) {
						successProc(result);
					}
				},
				error : function(err) {
					if (errorProc) {
						errorProc(err);
					}
				}
			});
		},

		post : function(path, data, successProc, errorProc) {
			this.internalPost(path, data, "POST", successProc, errorProc);
		},

		put : function(path, data, successProc, errorProc) {
			this.internalPost(path, data, "PUT", successProc, errorProc);
		},

		delete : function(path, data, successProc, errorProc) {
			this.internalPost(path, data, "DELETE", successProc, errorProc);
		},

		submit : function(data, successProc, errorProc) {
			var path = COMMON_JSON_PATH + this.objName;
			this.post(path, data, successProc, errorProc);
		},

		update : function(data, successProc, errorProc) {
			var path = COMMON_JSON_PATH + this.objName;
			this.put(path, data, successProc, errorProc);
		}
	});

	CG.SingleObjController = CG.ObjController.extend({
		content : {},

		afterLoad : function() {

		},

		load : function(callback) {
			var self = this;
			var path = COMMON_JSON_PATH + this.objName;

			this.get(path, function(data) {
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
			}, function(err, textStatus) {
				if (self.loadErrProc) {
					self.loadErrProc(err, textStatus);
				}
			});
		}
	});
});

$(function(){
    "use strict";
	CG.UserLoginController = CG.SingleObjController.extend({
	    objName: "./v1/user/login",
	   
	    login: function(data, successProc, errorProc){
	        var self = this;
	        this.submit(data, successProc, errorProc);
	    }
	});

	CG.PostController = CG.SingleObjController.extend({
		objName: "./v1/post"
	});

	CG.MyController = CG.SingleObjController.extend({
		objName: "./v1/user/" +window.localStorage.getItem('userId')
	});

});

//(new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
//(new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
Date.prototype.Format = function(fmt) { //author: meizz   
	var o = {
		"M+" : this.getMonth() + 1, 
		"d+" : this.getDate(), 
		"h+" : this.getHours(), 
		"m+" : this.getMinutes(), 
		"s+" : this.getSeconds(), 
		"q+" : Math.floor((this.getMonth() + 3) / 3), 
		"S" : this.getMilliseconds()

	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "")
				.substr(4 - RegExp.$1.length));
	for ( var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
					: (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

Date.prototype.Parse = function(str){
	var arr1 = str.split("-");  
	var date = new Date(arr1[0],parseInt(arr1[1])-1,arr1[2]);
	return date;
}

function GetDateStr(AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate()+AddDayCount);
    return dd.Format("yyyy-MM-dd");
}

Date.prototype.ValueNoTime = function(){
	return this.Parse(this.Format("yyyy-MM-dd"));
}
