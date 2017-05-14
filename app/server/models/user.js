var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    familyName: {
        type: String,
        required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      default: ''
    }
});

User.methods.getName = function() {
    return (this.firstname + ' ' + this.lastname);
};

User.plugin(passportLocalMongoose, {
    usernameField:'emailAddress', 
    usernameLowerCase:true,
    limitAttempts: true,
    maxAttempts: 3,
    usernameQueryFields:['emailAddress']
});

module.exports = mongoose.model('User', User);
