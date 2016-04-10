/** 
* jQuery WeUI V0.6.0 
* By 言川
* http://lihongxun945.github.io/jquery-weui/
 */
/* global $:true */
/* global WebKitCSSMatrix:true */

(function($) {
  "use strict";

  $.fn.transitionEnd = function(callback) {
    var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
      i, dom = this;

    function fireCallBack(e) {
      /*jshint validthis:true */
      if (e.target !== this) return;
      callback.call(this, e);
      for (i = 0; i < events.length; i++) {
        dom.off(events[i], fireCallBack);
      }
    }
    if (callback) {
      for (i = 0; i < events.length; i++) {
        dom.on(events[i], fireCallBack);
      }
    }
    return this;
  };

  $.support = (function() {
    var support = {
      touch: !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch)
    };
    return support;
  })();

  $.touchEvents = {
    start: $.support.touch ? 'touchstart' : 'mousedown',
    move: $.support.touch ? 'touchmove' : 'mousemove',
    end: $.support.touch ? 'touchend' : 'mouseup'
  };

  $.getTouchPosition = function(e) {
    e = e.originalEvent || e; //jquery wrap the originevent
    if(e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend') {
      return {
        x: e.targetTouches[0].pageX,
        y: e.targetTouches[0].pageY
      };
    } else {
      return {
        x: e.pageX,
        y: e.pageY
      };
    }
  };

  $.fn.scrollHeight = function() {
    return this[0].scrollHeight;
  };

  $.fn.transform = function(transform) {
    for (var i = 0; i < this.length; i++) {
      var elStyle = this[i].style;
      elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
    }
    return this;
  };
  $.fn.transition = function(duration) {
    if (typeof duration !== 'string') {
      duration = duration + 'ms';
    }
    for (var i = 0; i < this.length; i++) {
      var elStyle = this[i].style;
      elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
    }
    return this;
  };

  $.getTranslate = function (el, axis) {
    var matrix, curTransform, curStyle, transformMatrix;

    // automatic axis detection
    if (typeof axis === 'undefined') {
      axis = 'x';
    }

    curStyle = window.getComputedStyle(el, null);
    if (window.WebKitCSSMatrix) {
      // Some old versions of Webkit choke when 'none' is passed; pass
      // empty string instead in this case
      transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
    }
    else {
      transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
      matrix = transformMatrix.toString().split(',');
    }

    if (axis === 'x') {
      //Latest Chrome and webkits Fix
      if (window.WebKitCSSMatrix)
        curTransform = transformMatrix.m41;
      //Crazy IE10 Matrix
      else if (matrix.length === 16)
        curTransform = parseFloat(matrix[12]);
      //Normal Browsers
      else
        curTransform = parseFloat(matrix[4]);
    }
    if (axis === 'y') {
      //Latest Chrome and webkits Fix
      if (window.WebKitCSSMatrix)
        curTransform = transformMatrix.m42;
      //Crazy IE10 Matrix
      else if (matrix.length === 16)
        curTransform = parseFloat(matrix[13]);
      //Normal Browsers
      else
        curTransform = parseFloat(matrix[5]);
    }

    return curTransform || 0;
  };
  $.requestAnimationFrame = function (callback) {
    if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);
    else if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame(callback);
    else if (window.mozRequestAnimationFrame) return window.mozRequestAnimationFrame(callback);
    else {
      return window.setTimeout(callback, 1000 / 60);
    }
  };

  $.cancelAnimationFrame = function (id) {
    if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id);
    else if (window.webkitCancelAnimationFrame) return window.webkitCancelAnimationFrame(id);
    else if (window.mozCancelAnimationFrame) return window.mozCancelAnimationFrame(id);
    else {
      return window.clearTimeout(id);
    }  
  };

  $.fn.join = function(arg) {
    return this.toArray().join(arg);
  }

})($);

/*===========================
  Template7 Template engine
  ===========================*/
/* global $:true */
/* jshint unused:false */
/* jshint forin:false */
+function ($) {
  "use strict";
  $.Template7 = $.t7 = (function () {
    function isArray(arr) {
      return Object.prototype.toString.apply(arr) === '[object Array]';
    }
    function isObject(obj) {
      return obj instanceof Object;
    }
    function isFunction(func) {
      return typeof func === 'function';
    }
    var cache = {};
    function helperToSlices(string) {
      var helperParts = string.replace(/[{}#}]/g, '').split(' ');
      var slices = [];
      var shiftIndex, i, j;
      for (i = 0; i < helperParts.length; i++) {
        var part = helperParts[i];
        if (i === 0) slices.push(part);
        else {
          if (part.indexOf('"') === 0) {
            // Plain String
            if (part.match(/"/g).length === 2) {
              // One word string
              slices.push(part);
            }
            else {
              // Find closed Index
              shiftIndex = 0;
              for (j = i + 1; j < helperParts.length; j++) {
                part += ' ' + helperParts[j];
                if (helperParts[j].indexOf('"') >= 0) {
                  shiftIndex = j;
                  slices.push(part);
                  break;
                }
              }
              if (shiftIndex) i = shiftIndex;
            }
          }
          else {
            if (part.indexOf('=') > 0) {
              // Hash
              var hashParts = part.split('=');
              var hashName = hashParts[0];
              var hashContent = hashParts[1];
              if (hashContent.match(/"/g).length !== 2) {
                shiftIndex = 0;
                for (j = i + 1; j < helperParts.length; j++) {
                  hashContent += ' ' + helperParts[j];
                  if (helperParts[j].indexOf('"') >= 0) {
                    shiftIndex = j;
                    break;
                  }
                }
                if (shiftIndex) i = shiftIndex;
              }
              var hash = [hashName, hashContent.replace(/"/g,'')];
              slices.push(hash);
            }
            else {
              // Plain variable
              slices.push(part);
            }
          }
        }
      }
      return slices;
    }
    function stringToBlocks(string) {
      var blocks = [], i, j, k;
      if (!string) return [];
      var _blocks = string.split(/({{[^{^}]*}})/);
      for (i = 0; i < _blocks.length; i++) {
        var block = _blocks[i];
        if (block === '') continue;
        if (block.indexOf('{{') < 0) {
          blocks.push({
            type: 'plain',
            content: block
          });
        }
        else {
          if (block.indexOf('{/') >= 0) {
            continue;
          }
          if (block.indexOf('{#') < 0 && block.indexOf(' ') < 0 && block.indexOf('else') < 0) {
            // Simple variable
            blocks.push({
              type: 'variable',
              contextName: block.replace(/[{}]/g, '')
            });
            continue;
          }
          // Helpers
          var helperSlices = helperToSlices(block);
          var helperName = helperSlices[0];
          var helperContext = [];
          var helperHash = {};
          for (j = 1; j < helperSlices.length; j++) {
            var slice = helperSlices[j];
            if (isArray(slice)) {
              // Hash
              helperHash[slice[0]] = slice[1] === 'false' ? false : slice[1];
            }
            else {
              helperContext.push(slice);
            }
          }

          if (block.indexOf('{#') >= 0) {
            // Condition/Helper
            var helperStartIndex = i;
            var helperContent = '';
            var elseContent = '';
            var toSkip = 0;
            var shiftIndex;
            var foundClosed = false, foundElse = false, foundClosedElse = false, depth = 0;
            for (j = i + 1; j < _blocks.length; j++) {
              if (_blocks[j].indexOf('{{#') >= 0) {
                depth ++;
              }
              if (_blocks[j].indexOf('{{/') >= 0) {
                depth --;
              }
              if (_blocks[j].indexOf('{{#' + helperName) >= 0) {
                helperContent += _blocks[j];
                if (foundElse) elseContent += _blocks[j];
                toSkip ++;
              }
              else if (_blocks[j].indexOf('{{/' + helperName) >= 0) {
                if (toSkip > 0) {
                  toSkip--;
                  helperContent += _blocks[j];
                  if (foundElse) elseContent += _blocks[j];
                }
                else {
                  shiftIndex = j;
                  foundClosed = true;
                  break;
                }
              }
              else if (_blocks[j].indexOf('else') >= 0 && depth === 0) {
                foundElse = true;
              }
              else {
                if (!foundElse) helperContent += _blocks[j];
                if (foundElse) elseContent += _blocks[j];
              }

            }
            if (foundClosed) {
              if (shiftIndex) i = shiftIndex;
              blocks.push({
                type: 'helper',
                helperName: helperName,
                contextName: helperContext,
                content: helperContent,
                inverseContent: elseContent,
                hash: helperHash
              });
            }
          }
          else if (block.indexOf(' ') > 0) {
            blocks.push({
              type: 'helper',
              helperName: helperName,
              contextName: helperContext,
              hash: helperHash
            });
          }
        }
      }
      return blocks;
    }
    var Template7 = function (template) {
      var t = this;
      t.template = template;

      function getCompileFn(block, depth) {
        if (block.content) return compile(block.content, depth);
        else return function () {return ''; };
      }
      function getCompileInverse(block, depth) {
        if (block.inverseContent) return compile(block.inverseContent, depth);
        else return function () {return ''; };
      }
      function getCompileVar(name, ctx) {
        var variable, parts, levelsUp = 0, initialCtx = ctx;
        if (name.indexOf('../') === 0) {
          levelsUp = name.split('../').length - 1;
          var newDepth = ctx.split('_')[1] - levelsUp;
          ctx = 'ctx_' + (newDepth >= 1 ? newDepth : 1);
          parts = name.split('../')[levelsUp].split('.');
        }
        else if (name.indexOf('@global') === 0) {
          ctx = '$.Template7.global';
          parts = name.split('@global.')[1].split('.');
        }
        else if (name.indexOf('@root') === 0) {
          ctx = 'ctx_1';
          parts = name.split('@root.')[1].split('.');
        }
        else {
          parts = name.split('.');
        }
        variable = ctx;
        for (var i = 0; i < parts.length; i++) {
          var part = parts[i];
          if (part.indexOf('@') === 0) {
            if (i > 0) {
              variable += '[(data && data.' + part.replace('@', '') + ')]';
            }
            else {
              variable = '(data && data.' + name.replace('@', '') + ')';
            }
          }
          else {
            if (isFinite(part)) {
              variable += '[' + part + ']';
            }
            else {
              if (part.indexOf('this') === 0) {
                variable = part.replace('this', ctx);
              }
              else {
                variable += '.' + part;       
              }
            }
          }
        }

        return variable;
      }
      function getCompiledArguments(contextArray, ctx) {
        var arr = [];
        for (var i = 0; i < contextArray.length; i++) {
          if (contextArray[i].indexOf('"') === 0) arr.push(contextArray[i]);
          else {
            arr.push(getCompileVar(contextArray[i], ctx));
          }
        }
        return arr.join(', ');
      }
      function compile(template, depth) {
        depth = depth || 1;
        template = template || t.template;
        if (typeof template !== 'string') {
          throw new Error('Template7: Template must be a string');
        }
        var blocks = stringToBlocks(template);
        if (blocks.length === 0) {
          return function () { return ''; };
        }
        var ctx = 'ctx_' + depth;
        var resultString = '(function (' + ctx + ', data) {\n';
        if (depth === 1) {
          resultString += 'function isArray(arr){return Object.prototype.toString.apply(arr) === \'[object Array]\';}\n';
          resultString += 'function isFunction(func){return (typeof func === \'function\');}\n';
          resultString += 'function c(val, ctx) {if (typeof val !== "undefined") {if (isFunction(val)) {return val.call(ctx);} else return val;} else return "";}\n';
        }
        resultString += 'var r = \'\';\n';
        var i, j, context;
        for (i = 0; i < blocks.length; i++) {
          var block = blocks[i];
          // Plain block
          if (block.type === 'plain') {
            resultString += 'r +=\'' + (block.content).replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/'/g, '\\' + '\'') + '\';';
            continue;
          }
          var variable, compiledArguments;
          // Variable block
          if (block.type === 'variable') {
            variable = getCompileVar(block.contextName, ctx);
            resultString += 'r += c(' + variable + ', ' + ctx + ');';
          }
          // Helpers block
          if (block.type === 'helper') {
            if (block.helperName in t.helpers) {
              compiledArguments = getCompiledArguments(block.contextName, ctx);
              resultString += 'r += ($.Template7.helpers.' + block.helperName + ').call(' + ctx + ', ' + (compiledArguments && (compiledArguments + ', ')) +'{hash:' + JSON.stringify(block.hash) + ', data: data || {}, fn: ' + getCompileFn(block, depth+1) + ', inverse: ' + getCompileInverse(block, depth+1) + ', root: ctx_1});';
            }
            else {
              if (block.contextName.length > 0) {
                throw new Error('Template7: Missing helper: "' + block.helperName + '"');
              }
              else {
                variable = getCompileVar(block.helperName, ctx);
                resultString += 'if (' + variable + ') {';
                resultString += 'if (isArray(' + variable + ')) {';
                resultString += 'r += ($.Template7.helpers.each).call(' + ctx + ', ' + variable + ', {hash:' + JSON.stringify(block.hash) + ', data: data || {}, fn: ' + getCompileFn(block, depth+1) + ', inverse: ' + getCompileInverse(block, depth+1) + ', root: ctx_1});';
                resultString += '}else {';
                resultString += 'r += ($.Template7.helpers.with).call(' + ctx + ', ' + variable + ', {hash:' + JSON.stringify(block.hash) + ', data: data || {}, fn: ' + getCompileFn(block, depth+1) + ', inverse: ' + getCompileInverse(block, depth+1) + ', root: ctx_1});';
                resultString += '}}';
              }
            }
          }
        }
        resultString += '\nreturn r;})';
        return eval.call(window, resultString);
      }
      t.compile = function (template) {
        if (!t.compiled) {
          t.compiled = compile(template);
        }
        return t.compiled;
      };
    };
    Template7.prototype = {
      options: {},
      helpers: {
        'if': function (context, options) {
          if (isFunction(context)) { context = context.call(this); }
          if (context) {
            return options.fn(this, options.data);
          }
          else {
            return options.inverse(this, options.data);
          }
        },
        'unless': function (context, options) {
          if (isFunction(context)) { context = context.call(this); }
          if (!context) {
            return options.fn(this, options.data);
          }
          else {
            return options.inverse(this, options.data);
          }
        },
        'each': function (context, options) {
          var ret = '', i = 0;
          if (isFunction(context)) { context = context.call(this); }
          if (isArray(context)) {
            if (options.hash.reverse) {
              context = context.reverse();
            }
            for (i = 0; i < context.length; i++) {
              ret += options.fn(context[i], {first: i === 0, last: i === context.length - 1, index: i});
            }
            if (options.hash.reverse) {
              context = context.reverse();
            }
          }
          else {
            for (var key in context) {
              i++;
              ret += options.fn(context[key], {key: key});
            }
          }
          if (i > 0) return ret;
          else return options.inverse(this);
        },
        'with': function (context, options) {
          if (isFunction(context)) { context = context.call(this); }
          return options.fn(context);
        },
        'join': function (context, options) {
          if (isFunction(context)) { context = context.call(this); }
          return context.join(options.hash.delimiter || options.hash.delimeter);
        },
        'js': function (expression, options) {
          var func;
          if (expression.indexOf('return')>=0) {
            func = '(function(){'+expression+'})';
          }
          else {
            func = '(function(){return ('+expression+')})';
          }
          return eval.call(this, func).call(this);
        },
        'js_compare': function (expression, options) {
          var func;
          if (expression.indexOf('return')>=0) {
            func = '(function(){'+expression+'})';
          }
          else {
            func = '(function(){return ('+expression+')})';
          }
          var condition = eval.call(this, func).call(this);
          if (condition) {
            return options.fn(this, options.data);
          }
          else {
            return options.inverse(this, options.data);   
          }
        }
      }
    };
    var t7 = function (template, data) {
      if (arguments.length === 2) {
        var instance = new Template7(template);
        var rendered = instance.compile()(data);
        instance = null;
        return (rendered);
      }
      else return new Template7(template);
    };
    t7.registerHelper = function (name, fn) {
      Template7.prototype.helpers[name] = fn;
    };
    t7.unregisterHelper = function (name) {
      Template7.prototype.helpers[name] = undefined;  
      delete Template7.prototype.helpers[name];
    };

    t7.compile = function (template, options) {
      var instance = new Template7(template, options);
      return instance.compile();
    };

    t7.options = Template7.prototype.options;
    t7.helpers = Template7.prototype.helpers;
    return t7;
  })();
}($);

+ function($) {
  "use strict";

  var defaults;
  
  $.modal = function(params) {
    params = $.extend({}, defaults, params);


    var buttons = params.buttons;

    var buttonsHtml = buttons.map(function(d, i) {
      return '<a href="javascript:;" class="weui_btn_dialog ' + (d.className || "") + '">' + d.text + '</a>';
    }).join("");

    var tpl = '<div class="weui_dialog">' +
                '<div class="weui_dialog_hd"><strong class="weui_dialog_title">' + params.title + '</strong></div>' +
                ( params.text ? '<div class="weui_dialog_bd">'+params.text+'</div>' : '')+
                '<div class="weui_dialog_ft">' + buttonsHtml + '</div>' +
              '</div>';
    
    var dialog = $.openModal(tpl);

    dialog.find(".weui_btn_dialog").each(function(i, e) {
      var el = $(e);
      el.click(function() {
        //先关闭对话框，再调用回调函数
        if(params.autoClose) $.closeModal();

        if(buttons[i].onClick) {
          buttons[i].onClick();
        }
      });
    });
  };

  $.openModal = function(tpl) {
    var mask = $("<div class='weui_mask'></div>").appendTo(document.body);
    mask.show();

    var dialog = $(tpl).appendTo(document.body);
    
    dialog.show();
    mask.addClass("weui_mask_visible");
    dialog.addClass("weui_dialog_visible");

    return dialog;
  }

  $.closeModal = function() {
    $(".weui_mask_visible").removeClass("weui_mask_visible").transitionEnd(function() {
      $(this).remove();
    });
    $(".weui_dialog_visible").removeClass("weui_dialog_visible").transitionEnd(function() {
      $(this).remove();
    });
  };

  $.alert = function(text, title, callback) {
    if (typeof title === 'function') {
      callback = arguments[1];
      title = undefined;
    }
    return $.modal({
      text: text,
      title: title,
      buttons: [{
        text: defaults.buttonOK,
        className: "primary",
        onClick: callback
      }]
    });
  }

  $.confirm = function(text, title, callbackOK, callbackCancel) {
    if (typeof title === 'function') {
      callbackCancel = arguments[2];
      callbackOK = arguments[1];
      title = undefined;
    }
    return $.modal({
      text: text,
      title: title,
      buttons: [
      {
        text: defaults.buttonCancel,
        className: "default",
        onClick: callbackCancel
      },
      {
        text: defaults.buttonOK,
        className: "primary",
        onClick: callbackOK
      }]
    });
  };

  $.prompt = function(text, title, callbackOK, callbackCancel) {
    if (typeof title === 'function') {
      callbackCancel = arguments[2];
      callbackOK = arguments[1];
      title = undefined;
    }

    return $.modal({
      text: "<p class='weui-prompt-text'>"+(text || "")+"</p><input type='text' class='weui_input weui-prompt-input' id='weui-prompt-input'/>",
      title: title,
      buttons: [
      {
        text: defaults.buttonCancel,
        className: "default",
        onClick: callbackCancel
      },
      {
        text: defaults.buttonOK,
        className: "primary",
        onClick: function() {
          callbackOK && callbackOK($("#weui-prompt-input").val());
        }
      }]
    });
  };

  defaults = $.modal.prototype.defaults = {
    title: "提示",
    text: undefined,
    buttonOK: "确定",
    buttonCancel: "取消",
    buttons: [{
      text: "确定",
      className: "primary"
    }],
    autoClose: true //点击按钮自动关闭对话框，如果你不希望点击按钮就关闭对话框，可以把这个设置为false
  };

}($);

+ function($) {
  "use strict";

  var defaults;
  
  var show = function(html, className) {

    className = className || "";
    var mask = $("<div class='weui_mask_transparent'></div>").appendTo(document.body);

    var tpl = '<div class="weui_toast ' + className + '">' + html + '</div>';
    var dialog = $(tpl).appendTo(document.body);

    dialog.show();
    dialog.addClass("weui_toast_visible");
  };

  var hide = function() {
    $(".weui_mask_transparent").hide();
    $(".weui_toast_visible").removeClass("weui_toast_visible").transitionEnd(function() {
      $(this).remove();
    });
  }

  $.toast = function(text, style) {
    var className;
    if(style == "cancel") {
      className = "weui_toast_cancel";
    } else if(style == "forbidden") {
      className = "weui_toast_forbidden";
    }
    show('<i class="weui_icon_toast"></i><p class="weui_toast_content">' + (text || "已经完成") + '</p>', className);

    setTimeout(function() {
      hide();
    }, toastDefaults.duration);
  }

  $.showLoading = function(text) {
    var html = '<div class="weui_loading">';
    for(var i=0;i<12;i++) {
      html += '<div class="weui_loading_leaf weui_loading_leaf_' + i + '"></div>';
    }
    html += '</div>';
    html += '<p class="weui_toast_content">' + (text || "数据加载中") + '</p>';
    show(html, 'weui_loading_toast');
  }

  $.hideLoading = function() {
    hide();
  }

  var toastDefaults = $.toast.prototype.defaults = {
    duration: 2000
  }

}($);

+ function($) {
  "use strict";

  var defaults;
  
  var show = function(params) {

    var mask = $("<div class='weui_mask weui_actions_mask'></div>").appendTo(document.body);

    var actions = params.actions || [];

    var actionsHtml = actions.map(function(d, i) {
      return '<div class="weui_actionsheet_cell ' + (d.className || "") + '">' + d.text + '</div>';
    }).join("");

    var tpl = '<div class="weui_actionsheet " id="weui_actionsheet">'+
                '<div class="weui_actionsheet_menu">'+
                actionsHtml +
                '</div>'+
                '<div class="weui_actionsheet_action">'+
                  '<div class="weui_actionsheet_cell weui_actionsheet_cancel">取消</div>'+
                  '</div>'+
                '</div>';
    var dialog = $(tpl).appendTo(document.body);

    dialog.find(".weui_actionsheet_menu .weui_actionsheet_cell, .weui_actionsheet_action .weui_actionsheet_cell").each(function(i, e) {
      $(e).click(function() {
        $.closeActions();
        if(actions[i] && actions[i].onClick) {
          actions[i].onClick();
        }
      })
    });

    mask.show();
    dialog.show();
    mask.addClass("weui_mask_visible");
    dialog.addClass("weui_actionsheet_toggle");
  };

  var hide = function() {
    $(".weui_mask").removeClass("weui_mask_visible").transitionEnd(function() {
      $(this).remove();
    });
    $(".weui_actionsheet").removeClass("weui_actionsheet_toggle").transitionEnd(function() {
      $(this).remove();
    });
  }

  $.actions = function(params) {
    params = $.extend({}, defaults, params);
    show(params);
  }

  $.closeActions = function() {
    hide();
  }

  $(document).on("click", ".weui_actions_mask", function() {
    $.closeActions();
  });

  var defaults = $.actions.prototype.defaults = {
    /*actions: [{
      text: "菜单",
      className: "danger",
      onClick: function() {
        console.log(1);
      }
    },{
      text: "菜单2",
      className: "danger",
      onClick: function() {
        console.log(2);
      }
    }]*/
  }

}($);

/* ===============================================================================
************   Pull to refreh ************
=============================================================================== */
/* global $:true */

+function ($) {
  "use strict";

  var PTR = function(el) {
    this.container = $(el);
    this.distance = 50;
    this.attachEvents();
  }

  PTR.prototype.touchStart = function(e) {
    if(this.container.hasClass("refreshing")) return;
    var p = $.getTouchPosition(e);
    this.start = p;
    this.diffX = this.diffY = 0;
    this.container.trigger("pull-to-start");
  };

  PTR.prototype.touchMove= function(e) {
    if(this.container.hasClass("refreshing")) return;
    if(!this.start) return false;
    if(this.container.scrollTop() > 0) return;
    var p = $.getTouchPosition(e);
    this.diffX = p.x - this.start.x;
    this.diffY = p.y - this.start.y;
    if(this.diffY < 0) return;
    this.container.addClass("touching");
    e.preventDefault();
    e.stopPropagation();
    this.diffY = Math.pow(this.diffY, 0.8);
    this.container.css("transform", "translate3d(0, "+this.diffY+"px, 0)");

    if(this.diffY < this.distance) {
      this.container.removeClass("pull-up").addClass("pull-down");
    } else {
      this.container.removeClass("pull-down").addClass("pull-up");
    }
  };
  PTR.prototype.touchEnd = function() {
    this.start = false;
    if(this.diffY <= 0 || this.container.hasClass("refreshing")) return;
    this.container.removeClass("touching");
    this.container.removeClass("pull-down pull-up");
    this.container.css("transform", "");
    if(Math.abs(this.diffY) <= this.distance) {
      this.container.trigger("pull-to-end");
    } else {
      this.container.addClass("refreshing");
      this.container.trigger("pull-to-refresh");
    }
  };

  PTR.prototype.attachEvents = function() {
    var el = this.container;
    el.addClass("weui-pull-to-refresh");
    el.on($.touchEvents.start, $.proxy(this.touchStart, this));
    el.on($.touchEvents.move, $.proxy(this.touchMove, this));
    el.on($.touchEvents.end, $.proxy(this.touchEnd, this));
  };

  var pullToRefresh = function(el) {
    new PTR(el);
  };

  var pullToRefreshDone = function(el) {
    $(el).removeClass("refreshing");
  }

  $.fn.pullToRefresh = function() {
    return this.each(function() {
      pullToRefresh(this);
    });
  }

  $.fn.pullToRefreshDone = function() {
    return this.each(function() {
      pullToRefreshDone(this);
    });
  }

}($);


