$(document).on('click', '.panel-heading span.icon_minim', function (e) {
    var $this = $(this);
    if (!$this.hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideUp();
        $this.parents('.panel').find('.panel-footer').slideUp();
        $this.addClass('panel-collapsed');
        $this.removeClass('glyphicon-minus').addClass('glyphicon-plus');
    } else {
        $this.parents('.panel').find('.panel-body').slideDown();
        $this.parents('.panel').find('.panel-footer').slideDown();
        $this.removeClass('panel-collapsed');
        $this.removeClass('glyphicon-plus').addClass('glyphicon-minus');
    }
});
$(document).on('focus', '.panel-footer input.chat_input', function (e) {
    var $this = $(this);
    if ($('#minim_chat_window').hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideDown();
        $this.parents('.panel').find('.panel-footer').slideDown();
        $('#minim_chat_window').removeClass('panel-collapsed');
        $('#minim_chat_window').removeClass('glyphicon-plus').addClass('glyphicon-minus');
    }
});
$(document).on('click', '#new_chat', function (e) {
    var size = $( ".chat-window:last-child" ).css("margin-left");
     size_total = parseInt(size) + 400;
    alert(size_total);
    var clone = $( "#chat_window_1" ).clone().appendTo( ".container" );
    clone.css("margin-left", size_total);
});
$(document).on('click', '.icon_close', function (e) {
    //$(this).parent().parent().parent().parent().remove();
    $( "#chat_window_1" ).remove();
});


$(document).ready(function(){
         //localStorage.clear();
         var otherUser =  $(".hiddenReciever").val();
        var getNode =  function(s){
          return document.querySelector(s);
        },
        // Get required nodes
        textarea = getNode('.chat-textarea'),
        messages = getNode('.msg_container_base'),
        clients = getNode('.connectedUser'),
        chatBtn = getNode('.btn-chats'),
        chatName = getNode('.chat-name');
       
     
       //var loginUser = 'cleint@mail.com';
       var loginUser = localStorage.getItem('client');
       $(".loginName").html(loginUser);
        try{
          var socket = io.connect('http://127.0.0.1:8080')
        }catch(e){
          //set status to warm user
        }

        if(socket != undefined){
          
          socket.emit('setSupport',{sender:loginUser,receiver:otherUser});
          
          socket.on('assignSupport',function(connectedSupport){
              if(localStorage.getItem("supportTeam")!=""){
                  $(".hiddenReciever").val(connectedSupport);
                  localStorage.setItem("supportTeam", connectedSupport);
              }else{
                var t= localStorage.getItem("supportTeam");
                 $(".hiddenReciever").val(t);
              }
            
            var otherUser =  $(".hiddenReciever").val();
            socket.emit('clientChatHistory',{sender:loginUser,receiver:otherUser});
          })

          socket.emit("setEmail",loginUser,'client');
          
          socket.emit("addNewClient",{sender:loginUser,receiver:otherUser});

          socket.on('output',function(data, connectedUser){
           
            //Listen for keyboard
            if(data.length){
                var html ="";
              for(var x=0; x<data.length; x++){
                
                if(data[x].sender==loginUser){
                 html += '<div class="row msg_container base_receive"><div class="col-md-2 col-xs-2 avatar"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_03.jpg" class=" img-responsive "></div><div class="col-xs-10 col-md-10"><div class="messages msg_receive"><p>'+data[x].message+'</p><time datetime="2009-11-13T20:00"> • now</time></div></div></div>';  
                }else{
                
                  html += '<div class="row msg_container base_sent chat-messages"><div class="col-xs-10 col-md-10"><div class="messages msg_sent"><p>'+data[x].message+'</p><time datetime="2009-11-13T20:00"> • now</time></div></div><div class="col-md-2 col-xs-2 avatar"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01_green.jpg" class=" img-responsive "></div></div>'; 
                  visibilityChange(comeBackAlerts()); 
                  notifyMe(data[x].sender, data[x].message);
                }
                
              }
              $('.panel-body').append(html);
              $(".panel-body").animate({
                scrollTop: $('.panel-body').prop("scrollHeight")
            }, 1000);
            }
          })
          // Send Nofication 
          socket.on('notification',function(data,users){
            console.log(users);
            if(data.length){
              for(var x=0; x<data.length; x++){
                notifyMe(data[x].name, data[x].message);
              }
            }
          })
          socket.on('clientFocusOnKeypad',function(data,users){
            var r = $(".hiddenReciever").val();
            
            if(r==data[0].sender){
              $(".typeStatus").html("<span class='typing'>"+data[0].sender+" typing...</span>");
            }
          });
          //Listen for keyboard
          textarea.addEventListener('keydown',function(event){
            var self = this,
                receiver = $(".hiddenReciever").val();
                
                console.log("adsdas",receiver);

            if(event.which === 13 || event.shiftkey === false){
              socket.emit('input',{sender:loginUser,receiver:receiver,message:self.value,type:'client'});
              
              $(".msg_container_base").animate({
                  scrollTop: $('.msg_container_base').prop("scrollHeight")
              }, 1000);

              self.value='';
              
              event.preventDefault();
            }else{
              if(textarea!=""){
                socket.emit('clientFocus',{sender:loginUser,receiver:receiver,message:textarea.value,type:'support'});
              }
              
            }    
          })

          var comeBackAlerts  = (function () {
            var oldTitle                    = "Client Team";
            var msg                         = "new message!";
            var intervalId;
            var blink       = function(){
                    intervalId = setInterval( function() { 
                        /* document.title = document.title == msg ? ' ' : msg; */ 
                        if(document.title == msg){
                            document.title = oldTitle;
                        }
                        else{
                            document.title = msg;
                        }
                    }, 1000);
                };
            var clear       = function() {
                clearInterval(intervalId);
                document.title              = oldTitle;
                window.onmousemove          = null;
                window.onmouseout           = null;
                intervalId                  = null;
            };
            return function () {
                if (!intervalId) {
                    blink();
                    window.onmousemove      = clear;
                }
            };
          }());
         
          $(document).on('click', '.btn-send', function(e) {

                  var email = $('#login_email').val();
                  var name = $('#login_name').val();

                  if (name && email) {
                      localStorage.setItem("client", name);
                      socket.emit("setEmail",name,'client');
                      socket.emit("addNewClient",{sender:name,receiver:otherUser});

                      $('#login-form').hide();
                      $('.hide-container').show();
                  } else {
                      return false;
                  }
          });

          socket.on('chatHistoryClientOutput',function(data, connectedUser){
           
            
            //Listen for keyboard
            if(data.length){
                var html ="";
              for(var x=0; x<data.length; x++){
                var d = new Date(data[x].datetime);
                var time="";
                time = timeSince(d);
                 if(time){
                  time = time;
                 }else{
                  time ="now";
                 }

                if(data[x].sender==loginUser){
                 html += '<div class="row msg_container base_receive"><div class="col-md-2 col-xs-2 avatar"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_03.jpg" class=" img-responsive "></div><div class="col-xs-10 col-md-10"><div class="messages msg_receive"><p>'+data[x].message+'</p><time datetime="2009-11-13T20:00"> • '+time+'</time></div></div></div>';  
                }else{
                
                  html += '<div class="row msg_container base_sent chat-messages"><div class="col-xs-10 col-md-10"><div class="messages msg_sent"><p>'+data[x].message+'</p><time datetime="2009-11-13T20:00"> • '+time+'</time></div></div><div class="col-md-2 col-xs-2 avatar"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/195612/chat_avatar_01_green.jpg" class=" img-responsive "></div></div>';  
                }
                
              }
              $('.panel-body').html(html);
              $(".msg_container_base").animate({
                    scrollTop: $('.msg_container_base').prop("scrollHeight")
                }, 1000);
            }
          })
          //Listen for keyboard
          chatBtn.addEventListener('click',function(event){
            var self = "this",
                receiver = $(".hiddenReciever").val();
           // if(event.which === 13 || event.shiftkey === false){
              socket.emit('input',{sender:loginUser,receiver:receiver,message:textarea.value,type:'support'});
              
              textarea.value='';
              
              event.preventDefault();
           // }    
          })
         
        }
      });