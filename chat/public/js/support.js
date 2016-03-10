(function(){
  
  var chat = {
    messageToSend: '',
    messageResponses: [
      'Why did the web developer leave the restaurant? Because of the table layout.',
      'How do you comfort a JavaScript bug? You console it.',
      'An SQL query enters a bar, approaches two tables and asks: "May I join you?"',
      'What is the most used language in programming? Profanity.',
      'What is the object-oriented way to become wealthy? Inheritance.',
      'An SEO expert walks into a bar, bars, pub, tavern, public house, Irish pub, drinks, beer, alcohol'
    ],
    init: function() {
      this.cacheDOM();
      this.bindEvents();
      this.render();
    },
    cacheDOM: function() {
      this.$chatHistory = $('.chat-history');
      this.$button = $('button');
      this.$textarea = $('#message-to-send');
      this.$chatHistoryList =  this.$chatHistory.find('ul');
    },
    bindEvents: function() {
      this.$button.on('click', this.addMessage.bind(this));
      this.$textarea.on('keyup', this.addMessageEnter.bind(this));
    },
    render: function() {
      this.scrollToBottom();
      if (this.messageToSend.trim() !== '') {
        var template = Handlebars.compile( $("#message-template").html());
        var context = { 
          messageOutput: this.messageToSend,
          time: this.getCurrentTime()
        };

        this.$chatHistoryList.append(template(context));
        this.scrollToBottom();
        this.$textarea.val('');
        
        // responses
        var templateResponse = Handlebars.compile( $("#message-response-template").html());
        var contextResponse = { 
          response: this.getRandomItem(this.messageResponses),
          time: this.getCurrentTime()
        };
        
        setTimeout(function() {
          this.$chatHistoryList.append(templateResponse(contextResponse));
          this.scrollToBottom();
        }.bind(this), 1500);
        
      }
      
    },
    
    addMessage: function() {
      this.messageToSend = this.$textarea.val()
      this.render();         
    },
    addMessageEnter: function(event) {
        // enter was pressed
        if (event.keyCode === 13) {
          this.addMessage();
        }
    },
    scrollToBottom: function() {
       this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
    },
    getCurrentTime: function() {
      return new Date().toLocaleTimeString().
              replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
    },
    getRandomItem: function(arr) {
      return arr[Math.floor(Math.random()*arr.length)];
    }
    
  };
  
  chat.init();
  
  var searchFilter = {
    options: { valueNames: ['name'] },
    init: function() {
      var userList = new List('people-list', this.options);
      var noItems = $('<li id="no-items-found">No items found</li>');
      
      userList.on('updated', function(list) {
        if (list.matchingItems.length === 0) {
          $(list.list).append(noItems);
        } else {
          noItems.detach();
        }
      });
    }
  };
  
  searchFilter.init();
  





  
})();
function startChatWithClient(user){
      $(".chat-with").html(user);
      //$(".chat-history ul").html("");
    }
$(document).ready(function(){
  $(".chat-history").animate({
      scrollTop: $('.chat-history').prop("scrollHeight")
  }, 1000);

  $(".typeStatus").html();

  var getNode =  function(s){
    return document.querySelector(s);
  },
  // Get required nodes
  textarea = getNode('.chat-textarea'),
  messages = getNode('.msg_container_base'),
  clients = getNode('.connectedUser'),
  clientList = getNode('.client-list'),
  chatName = getNode('.chat-name');



  var loginUser = $("#loginUser").val();

 
  try{
    //var socket = io.connect('http://192.168.123.204:8080');
    var socket = io.connect('http://localhost:3002');
  }catch(e){
    //set status to warm user
  }


  if(socket != undefined){
   
    socket.emit("setEmail",loginUser,'support');
    socket.emit("userList");
    

    socket.on('output',function(data, connectedUser){
      console.log("Output Init",data);


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
            html += '<li><div class="message-data"><span class="message-data-name"><i class="fa fa-circle online"></i>'+data[x].sender+'</span><span class="message-data-time">'+time+'</span></div><div class="message my-message">'+data[x].message+'</div></li>'; 
          }else{
              var rec = $(".hiddenReciever").val();
              var chatWith = $(".chatWithSomeone").text();
              /**
               * If active reciver send new message
               */
              if(chatWith!=""){
                html += '<li class="clearfix"><div class="message-data align-right"><span class="message-data-time" >'+time+'</span> &nbsp; &nbsp;<span class="message-data-name" >'+data[x].sender+'</span> <i class="fa fa-circle me"></i></div><div class="message other-message float-right">'+data[x].message+'</div></li>';
              }
             // else{
                if($('.client-list').is('[data-user="'+data[x].sender+'"]')){
                    $('.client-list[data-user="'+data[x].sender+'"] .status').after().html('<div class="status blink"><i class="fa fa-circle offline"></i><span class="blink">new message!</span></div>');
                    
                    visibilityChange(comeBackAlerts());

               // }
              }
              notifyMe(data[x].sender, data[x].message);
          }
        }
        $('.chat-history ul').append(html);
        $(".chat-history").animate({
          scrollTop: $('.chat-history').prop("scrollHeight")
      }, 1000);
      }
    })
    
    socket.on('supportFocusOnKeypad',function(data,users){
      console.log(data)
      var r = $(".hiddenReciever").val();
      if(r==data[0].sender){
        $(".typeStatus").html("<span class='typing'>"+data[0].sender+" typing...</span>");
      }
    });
    // Send Nofication 
    socket.on('notification',function(data,users){
      
      if(data.length){
        for(var x=0; x<data.length; x++){
          notifyMe(data[x].receiver, data[x].message);
        }
      }
    });
    //Listen for keyboard
    textarea.addEventListener('keydown',function(event){
      var self = this,
          receiver = $(".hiddenReciever").val();
          
      if(event.which === 13 || event.shiftkey === false){
        socket.emit('input',{sender:loginUser,receiver:receiver,message:self.value,type:'support',attachment:'0'});
        
        self.value='';
        
        event.preventDefault();
      }else{
        if(textarea!=""){
          socket.emit('supportFocus',{sender:loginUser,receiver:receiver,message:textarea.value,type:'support'});
        }
        
      }      
    })
    /**
     * [description]
     * @param  {[type]} connectedUser){                                         var size [description]
     * @return {[type]}                  [description]
     */
    socket.on('userList',function(userList){

     /**
      * [isReceiver description]
      * @type {Boolean}
      * @fileOverview  {Set, Get, unset and delete Cookies function inside }
      * @filepath {js/cookies.js}
      */
      var isReceiver = getCookie('receiverName');

      var size = Object.size(userList);
      if(size>0){
           var conUser="";
        $.each(userList, function(key, value){
          if(key!="null" && value['email']!=loginUser){
            
            conUser +='<li class="clearfix client-list '+(value['email']==isReceiver ? "active":"")+'" data-user="'+value['email']+'"><img src="image/chat_avatar_03.jpg" alt="avatar" /><div class="about"><div class="name">'+value['name']+'</div><div class="status"><i class="fa fa-circle online"></i> online</div></div></li>';  
          }
        })
      }else{
         $('.chat-with').html('no active user found!');
      }
      $(".people-list ul").html(conUser);
    })

    socket.on('availableClients',function(connectedUser){
        // Get the size of an object

      var size = Object.size(connectedUser[0]);
      if(size>0){
           var conUser="";
        $.each(connectedUser[0], function(key, value){
          if(key!="null"){
            
            conUser +='<li class="clearfix client-list" data-user="'+key+'"><img src="image/chat_avatar_03.jpg" alt="avatar" /><div class="about"><div class="name">'+key+'</div><div class="status"><i class="fa fa-circle online"></i> online</div></div></li>';  
          }
        })
      }else{
         $('.chat-with').html('no active user found!');
      }
      $(".people-list ul").html(conUser);
     }); 
    /**
     * [chatHistory description]
     * @type {[type]}
     */
      /**
      * [isReceiver description]
      * @type {Boolean}
      * @fileOverview  {Set, Get, unset and delete Cookies function inside }
      * @filepath {js/cookies.js}
      */
      var isReceiver = getCookie('receiverName');

      socket.emit('chatHistory',{sender:loginUser,receiver:isReceiver});

      /**
       * @param  {upload attachment}
       * @param  {[file]}
       * @return {[json]}
       */
      $(document).on('change', '#imageUploadBtn', function(){
          $("#status").empty().text("File is uploading...");
          $('#uploadForm').ajaxSubmit({

            error: function(xhr) {
                status('Error: ' + xhr.status);
            },

            success: function(response) {
              $("#status").empty().text("file uploaded...");
              var orgName = response.originalname;
              var splitOrgName = orgName.split(".");
              var uploadedFileName = response.filename;

              var ext = splitOrgName[1];
              console.log(ext);
              console.log(response);
              console.log(uploadedFileName+'.'+ext);
            }
      });
      //Very important line, it disable the page refresh.
      return false;
      });
      $(document).on('click', '.client-list', function(){

      });
    /**
     * @param  {[type]}
     * @return {[type]}
     */
    $(document).on('click', '.client-list', function(){
          $(".blink").remove();
          $("ul.list li.client-list").removeClass("active");

          var otherUser = $(this).attr('data-user');
                          $(this).addClass("active");

          /**
           * [Store newly receiver unique key in cookies for loading current user chat history if window is reload further]
           * @type {[cookies]}
           */
          var cookieName = "receiverName";
          var cookiesValue = otherUser;

          setCookie(cookieName, cookiesValue);

          socket.emit('chatHistory',{sender:loginUser,receiver:otherUser});

          $(".hiddenReciever").val(otherUser);
          $('.chat-with').html('Chat with '+ otherUser);
          $(".chat-textarea").show();

           $(".typeStatus").html("");
      });
   
     
    /**
     * Show Chat History
     */
    Object.size = function(obj) {
          var size = 0, key;
          for (key in obj) {
              if (obj.hasOwnProperty(key)) size++;
          }
          return size;
      };

      var comeBackAlerts  = (function () {
      var oldTitle                    = "Support Team";
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


    socket.on('chatHistoryOutput',function(data, connectedUser){
      /**
      * [isReceiver description]
      * @type {Boolean}
      * @fileOverview  {Set, Get, unset and delete Cookies function inside }
      * @filepath {js/cookies.js}
      */
      var isReceiver = getCookie('receiverName');
      if(isReceiver!=""){
          $(".hiddenReciever").val(isReceiver);
          $(".chat-textarea").show();
          $('.chat-with').html('Chat with '+ isReceiver);        
      }else{
        $('.chat-with').html('Please select client...');        
      }
      
      // Get the size of an object
      var size = Object.size(connectedUser[0]);
      
      console.log(data);

      if(data.length > 0){
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
            html += '<li><div class="message-data"><span class="message-data-name"><i class="fa fa-circle online"></i>'+data[x].sender+'</span><span class="message-data-time">'+time+'</span></div><div class="message my-message">'+data[x].message+'</div></li>'; 
          }else{
              html += '<li class="clearfix"><div class="message-data align-right"><span class="message-data-time" >'+time+'</span> &nbsp; &nbsp;<span class="message-data-name" >'+data[x].sender+'</span> <i class="fa fa-circle me"></i></div><div class="message other-message float-right">'+data[x].message+'</div></li>';
          }
          $('.chat-history ul').html(html);
        }
      }else{
          $('.chat-history ul').html('');
         // $('.chat-with').html('no active user found!');
        }
    })
  }

})
