// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var http = require('http').Server(app);
var client = require('socket.io')(http);


var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var path = require('path');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

/**
 * set Public path
 */
app.use(express.static(path.join(__dirname, 'public')));


// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


// load up the user model
var Messages       = require('./app/models/messages');
var User       = require('./app/models/user');


var multer  =   require('multer');
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, 'attachment' + '-' + Date.now());
  }
});
var upload = multer({ storage : storage});


var connectedUsers  = [];// all connection(all client and support)
var connectedUsers1  = {};//all client 
var connectedSupport  = {};//all support

client.on('connection',function(socket){
    socket.emit("socketId",socket.id);
    console.log('Someone has connected----->'+socket.id);
    
    /**
     * 
     */
   
    socket.on("setEmail",function(data,client){
		console.log("settting Email--->",data);
		if(data!=""){
			connectedUsers[data] = socket;
			connectedSupport[data] = socket.id;
		}
	});
    /**
     * [description : List of all user which is currenlty in the system]
     * @return {[type]} [array]
     */
	socket.on('userList',function(data){
		User.find('', function(err, user) {
            if(err)throw err;
			socket.emit('userList',user);
        });
		//client.emit('output',[data],[connectedUsers]);
	});

	/**
	 * [description]
	 * @return {[type]} [description]
	 */
	socket.on('input',function(data){
		connectedUsers[data.name] = socket.id;
		var mydate2 = Date();
		
		var sender = data.sender,
			message = data.message,
			receiver = data.receiver,
			attachment = data.attachment,
			datetime = mydate2,
			type = data.type;

		
		var message_data = {
		    sender: data.sender,
		   	message: data.message,
		   	receiver: data.receiver,
		   	attachment: data.attachment,
		   	datetime: mydate2,
		   	type: data.type
		};

		var message = new Messages(message_data);

		message.save( function(error, data){
		    if(error){
		        res.json(error);
		    }
		    else{
		    	console.log("sender----->",data.sender,"receiver--->",receiver);
		        console.log('Inserted');

		        connectedUsers[data.sender].emit('output',[data],[connectedUsers]);

		        if(connectedUsers.hasOwnProperty(data.receiver)){
					console.log("reciever connected..");	
					connectedUsers[data.receiver].emit('output',[data],[connectedUsers]);
				}else{
					console.log("reciever not connected..");
				}
		    }
		});
	})

	// Chat hsitory for supprot
	socket.on('chatHistory',function(data){
		//var col = db.collection('messages');
		var sender = data.sender,
			receiver = data.receiver;
		
		console.log(data)
		Messages.find({$or:[{sender:sender,receiver:receiver},{sender:receiver,receiver:sender}]}, function(err, row) {
        	if(err)throw err;
			socket.emit('chatHistoryOutput',row, [connectedUsers1]);
    	});
	})

	socket.on('clientChatHistory',function(data){
			
		var col = db.collection('messages');
		var sender = data.sender,
			receiver = data.receiver;

		
		
		if(receiver!=""){
			Messages.find('', function(err, row) {
            	if(err)throw err;
				socket.emit('chatHistoryClientOutput',row, [connectedUsers]);
        	});
			
		}else{
			
		}
			
	})
 });


// launch ======================================================================
http.listen(8080, function(){
  console.log('Magic start with socket:8080');
});