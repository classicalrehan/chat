 function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes ago";
    }
    if(seconds){
      return Math.floor(seconds) + " seconds ago";
    }
    
}
function visibilityChange(actionFunction){

        window.focus(); /* window.onfocus   = infoIn;  */

        var hidden = "hidden";

        /* Standards: */
        if (hidden in document){
            document.addEventListener("visibilitychange", actionFunction);
        }
        else if ((hidden = "mozHidden") in document){
            document.addEventListener("mozvisibilitychange", actionFunction);
        }
        else if ((hidden = "webkitHidden") in document){
            document.addEventListener("webkitvisibilitychange", actionFunction);
        }
        else if ((hidden = "msHidden") in document){
            document.addEventListener("msvisibilitychange", actionFunction);
        }
        /* IE 9 and lower: */
        else if ("onfocusin" in document){
            document.onfocusin = document.onfocusout = actionFunction;
        }
        /* All others: */
        else{
            window.onpageshow = window.onpagehide
            = window.onfocus = window.onblur = actionFunction;  
        }
    }  
function notifyMe(name, message) {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }
  else if (Notification.permission === "granted") {
        var options = {
                body: message,
                icon: "image/user2-160x160.jpg",
                dir : "ltr"
             };
          var notification = new Notification(name +": send message to you",options);
  }
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      if (!('permission' in Notification)) {
        Notification.permission = permission;
      }
    
      if (permission === "granted") {
        var options = {
              body: message,
              icon: "image/user2-160x160.jpg",
              dir : "ltr"
          };
        var notification = new Notification(name +": send message to you",options);
      }
    });
  }
}
function fillData(data) {
        var html = "";
        if(data){
        html += '<div class="row msg_container base_receive"><div class="col-md-2 col-xs-2 avatar"><img src="http://www.bitrebels.com/wp-content/uploads/2011/02/Original-Facebook-Geek-Profile-Avatar-1.jpg" class=" img-responsive "></div><div class="col-xs-10 col-md-10"><div class="messages msg_receive"><p>' + data + '</p><time datetime="2009-11-13T20:00">Timothy • 51 min</time></div></div></div>';
          $('.panel-body').append(html);
      }
}
