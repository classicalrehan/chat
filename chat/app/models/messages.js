// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var messagesSchema = mongoose.Schema({
        sender        : String,
        receiver        : String,
        message        : String,
        type        : String,
        datetime        : Date,
        attachment     : String
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Messages', messagesSchema);
