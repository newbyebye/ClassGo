function viewGame(){
        $("div.game-page ul.ui-listview").html("");
        $.mobile.changePage("#pageGame");
}

function viewResult(gameId){
    $.mobile.changePage("#pageGameResult?id="+gameId);
}

function loadGameResult(gameId){
      console.log("init game result:" + gameId);
      var $table = $('#game_result_table');

      $table.bootstrapTable('destroy');
      CG.PostController.get('/v1/game/'+gameId, function(err, data){
          var name = data.name;
          if (data.subname){
             name += " - "+data.subname;
          }

          $("#result_game_name").text(name+" 游戏结果");

          CG.PostController.get('/v1/game/'+gameId+'/stat1', function(err, data){
            $table.bootstrapTable({data: data});
          });
      });

      var $win = $('#game_win_table');
      $win.bootstrapTable('destroy');
      CG.PostController.get('/v1/game/'+gameId+'/win', function(err, data){
          $win.bootstrapTable({data: data});
      });
}

function refreshGame(){
    loadGameResult($('#result_game_id').val());
}

function activateGame(){
    //{"templateId":1, "reward":5, "gameTime":120, "playerNum":10,  "showResult":1}
    var templateId = $('#game_template_id').val();
    if (templateId == 0){
        templateId = $('#game_subtype').val();
    }

    var postId = window.sessionStorage.getItem("postId");
    var data = {"templateId":templateId, "reward":$('#game_reward').val(), "gameTime":$('#game_time').val(), "playerNum":$('#game_playerNum').val(), "showResult":$('#game_showResult').val()};
    CG.PostController.post('/v1/post/' + postId + '/game', data, function(err, data){
        if (!err){
            viewGame();
        }
    });
}

function delayHideError(){
   setTimeout(function(){
      $("#game_error_div").hide();
   }, 5000);
}

function submitPlayGame(){
   var gameId = $("#player_game_id").val();

   if (parseInt($('#player_game_var1').val()) < 0 || parseInt($('#player_game_var1').val()) > 100){
      $("#game_error_msg").text("请输入0-100整数");
      $("#game_error_div").show();
      delayHideError();
      return;
   }

   if (parseInt($('#player_game_var2').val()) < 0 || parseInt($('#player_game_var2').val()) > 100){
      $("#game_error_msg").text("请输入0-100整数");
      $("#game_error_div").show();
      delayHideError();
      return;
   }

   var data = {"var1":$('#player_game_var1').val(), "var2":$('#player_game_var2').val()};
   if ($("#player_game_var3_field").attr("style") === "display: block;"){
      data.var1 = $('#player_game_var3_select').val();
   } 

   CG.PostController.post('/v1/game/' + gameId , data, function(err, data){
      if (!err){
          viewResult(gameId);
      }
   });
}

function newGameDetail(id){   
    CG.PostController.get('/v1/game/template/'+id, function(err, data){
        var size = data.length;
        if (size > 0){
            var game1 = data[0];

            $('#game_name').text(game1.name);
            $('#game_type').text(game1.type);
            $('#game_reward').val("");
            $('#game_playerNum').val("");

            if (game1.type == 2  || game1.type == 4 || game1.type == 5 || game1.type == 6){
                $('#game_subtype_field').show();
                $('#game_template_id').val(0);
            }
            else{
                $('#game_subtype_field').hide();
                $('#game_template_id').val(id);
            }
            
            if (game1.type == 1){
                $('#game_playerNum_field').show();
            }
            else{
                $('#game_playerNum_field').hide();
            }

            if (game1.type == 1 || game1.type == 3 || game1.type == 4 || game1.type == 5 || game1.type == 6){
                $('#game_reward_field').show();
            }
            else{
                $('#game_reward_field').hide();
            }
        }

        if (size > 1){
            $('#game_subtype').html("");
            $("#game_subtype-button span").html("<span>&nbsp;"+data[0].subname+"</span>");
            for (var i = 0; i < size; i++){
                $('#game_subtype').append('<option value="'+ data[i].id+'" >'+data[i].subname+'</option>');
            }
             
        }
    });
}

function countdown(time){
    if (time <= 0){
        $("#player_game_time").text("0秒");
        return;
    }

    var t = setInterval(function(){
      console.log("ontime"); 
      time--;
      $("#player_game_time").text(time + "秒");
      if (time == 0){
        clearInterval(t);
      }
    }, 1000);
}

function viewActivateGame(id, status) {
  CG.PostController.get('/v1/game/'+id, function(err, data){
      console.log(data);
      if (!err){
          var name = data.name;
          if (data.subname){
             name += " - "+data.subname;
          }
          $("#player_game_var1").val("");
          $("#player_game_var2").val("");
          // if teacher or game is over redirect to result
          if (checkCurrentUserId(data.userId) || data.status != 1){
             viewResult(id);
          }
          else{
             // title
             $("#player_game_name").text(name);
             $("#player_game_id").val(id);
             $("#player_game_time").text(data.restTime + "秒");
             countdown(data.restTime);
             
             
             // rule
             $("#player_game_rule").text(data.ruleLabel);
             $("#player_game_var1help").text(data.var1Help);
             $("#player_game_var1").attr("placeholder", data.var1Help);
             $("#player_game_var2help").text(data.var2Help);
             $("#player_game_var2").attr("placeholder", data.var2Help);
             if(data.var1Label){
                $("#player_game_var1label").text(data.var1Label);
             }
             else{
                $("#player_game_var1label").text("");
             }
             if(data.var2Label){
                $("#player_game_var2label").text(data.var2Label);
             }
             else{
                $("#player_game_var2label").text("");
             }

             $("#player_game_var1_field").show();
             $("#player_game_var3_field").hide();

             if ((data.type == 2 && data.subtype == 3) ){
                $("#player_game_var2_field").show();
                $("#player_game_var1help_field").hide();
                $("#player_game_var2help_field").hide();
             }
             else if (data.type == 3){
                $("#player_game_var1help_field").show();
                $("#player_game_var2help_field").hide();
                $("#player_game_var2_field").hide();
             }
             else if ((data.type == 4 && data.subtype == 3) || (data.type == 6 && data.subtype == 2) || (data.type == 5 && data.subtype == 2)){
                $("#player_game_var1help_field").hide();
                $("#player_game_var2help_field").hide();
                $("#player_game_var1_field").hide();
                $("#player_game_var2_field").hide();
                $("#player_game_var3_field").show();

 
                $('#player_game_var3_select').html("");
                var addrs = data.var1Select.split(",");
                $("#player_game_var3_select span").html("<span>&nbsp;"+addrs[0].split(":")[1]+"</span>");
                $('#player_game_var3_select').val("0");
                for (var i = 0; i < addrs.length; i++){
                  $('#player_game_var3_select').append('<option value="'+ addrs[i].split(":")[0]+'" >'+addrs[i].split(":")[1]+'</option>');
                }
             }
             else{
                $("#player_game_var1help_field").hide();
                $("#player_game_var2_field").hide();
                $("#player_game_var2help_field").hide();
             }
             $.mobile.changePage("#pagePlayer?id="+id);
          }
      } 
  });
}

// pageGame
(function pullPagePullImplementation($) {
  "use strict";
  var pullDownGeneratedCount = 0,
      pullUpGeneratedCount = 0,
      limit = 20,
      listSelector = "div.game-page ul.ui-listview",
      lastItemSelector = listSelector + " > li:last-child";

   function getGameTemplateData(skip, callback){
        CG.PostController.get('/v1/game/template', function(err, data){
            callback(err, data);
        });
    }

    function getPostGameData(skip, callback){
        var postId = window.sessionStorage.getItem("postId");
        CG.PostController.get('/v1/post/' + postId + '/game', function(err, data){
            callback(err, data);
        });
    }
    
    function initGameTemplate(){
        var listSelector = "div.newgamelist-page ul.ui-listview";
        if ($(listSelector) && $(listSelector).html() && $(listSelector).html().length > 0){
            ;
        }
        else {
            getGameTemplateData(0, function(err, content){
                if (!err){
                    var i, newContent = "";
                    content.forEach(function(e){
                        var html = '<li data-icon="false"><a href="#pageNewGame?id='+ e.id +'">';
                        html += '<h2>' + e.name + '</h2>';
                        html += '</a></li>'
                        newContent = html + newContent;
                }); 

                $(listSelector).prepend(newContent).listview("refresh");  // Prepend new content and refresh listview                      
            }});
                          
        }
    }

    function initGameData() {  
      if ($(listSelector) && $(listSelector).html() && $(listSelector).html().length > 0){
            ;
        }
        else {
            getPostGameData(0, function(err, content){
                if (!err){
                    gotPullDownData(null, null, content);
                }
            });
        }      
    }

    function initGameResult(gameId){
      $('#result_game_id').val(gameId);
      loadGameResult(gameId);
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
        var html = '<li data-icon="false"><a href="javascript:void(0)" onclick="viewActivateGame('+ e.id +','+e.status+')">';
        var name = e.name;
        if (e.subname){
           name += " - " + e.subname;
        }
        html += '<h2>' + name + '</h2>';
        if (e.status == 1){
            html += '<p><strong>正在进行中</strong></p>';
        }else{
            html += '<p><strong>已结束</strong></p>';
        }
        
        html += '<p class="ui-li-aside"><strong>'+$.timeago(e.createAt)+'</strong></p>';
        html += '</a><hr></li>';
        newContent = html + newContent;
    }); 

    pullDownGeneratedCount += content.length;
    
    $(listSelector).html(newContent).listview("refresh");  // Prepend new content and refresh listview
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
    
  }    

  // Called when the user completes the pull-up gesture.
  function onPullUp (event, data) { 
  }    
  
  // Set-up jQuery event callbacks
  $(document).delegate("div.game-page", "pageinit", 
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

    //var paramUrl = $.mobile.path.parseUrl(f.toPage);
    //console.log(paramUrl);

    var hashs = $.mobile.path.parseUrl(f.absUrl).hash.split("?");
    var hash = hashs[0];
    var search = hashs[1];

    if (hash === "#pageGame"){
        initGameData();
    }
    else if (hash === "#pageNewGame"){
      if (search){
        var id = search.split("=")[1];
        newGameDetail(id);
      }
    }
    else if (hash === "#pageNewGamelist"){
       initGameTemplate();
    }
    else if (hash === "#pageViewGame"){
      if (search){
        var id = search.split("=")[1];
        viewGame(id);
      }
    }
    else if (hash === "#pageGameResult"){
      if (search){
        var id = search.split("=")[1];
        initGameResult(id);
      }
    }

  });

}(jQuery));

