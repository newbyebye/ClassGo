function viewGame(){
        $.mobile.changePage("#pageGame");
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
            
        }
    });
}

function viewGameDetail(id){   
        CG.PostController.get('/v1/game/template/'+id, function(err, data){
            var size = data.length;
            if (size > 0){
                var game1 = data[0];

                $('#game_name').text(game1.name);
                $('#game_type').text(game1.type);
                $('#game_reward').val("");
                $('#game_playerNum').val("");

                if (game1.type == 2 || game1.type == 3 || game1.type == 4 || game1.type == 5 || game1.type == 6){
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
        var listSelector = "div.newgame-page ul.ui-listview";
        if ($(listSelector) && $(listSelector).html() && $(listSelector).html().length > 0){
            ;
        }
        else {
            getGameTemplateData(0, function(err, content){
                if (!err){
                    var i, newContent = "";
                    content.forEach(function(e){
                        var html = '<li data-icon="false"><a href="#pageGameDetail?id='+ e.id +'">';
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
        var html = '<li data-icon="false"><a href="#pageGameDetail?id='+ e.id +'">';
        html += '<h2>' + e.name + '</h2>';
        html += '</a></li>'
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
  $(document).delegate("div.game-page", "pageinit", 
    function bindPullPagePullCallbacks(event) {
      $(".iscroll-wrapper", this).bind( {
      iscroll_onpulldown : onPullDown,
      iscroll_onpullup   : onPullUp
      } );
    } );  

  $(document).on("pagebeforechange", function(e, f){
    var hashs = $.mobile.path.parseUrl(f.absUrl).hash.split("?");
    var hash = hashs[0];
    var search = hashs[1];

    if (hash === "#pageGame"){
        initGameData();
        console.log("pageGame pagebeforechange");
    }
    else if (hash === "#pageGameDetail"){
      if (search){
        var id = search.split("=")[1];
        viewGameDetail(id);
      }
      console.log("pageGameDetail pagebeforechange");
    }
    else if (hash === "#pageNewGame"){
       initGameTemplate();
    }
  });

}(jQuery));

