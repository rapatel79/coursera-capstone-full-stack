var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Invitation = new Schema({
    name: {
        type: String,
        required: true
    },
    emailAddress: {
      type: String,
      required: true
    },
    familyName: {
        type: String,
        required: true
    },
    invitor: {
        type: String,
        required: true
    },
    isPending:{
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Invitation', Invitation);
