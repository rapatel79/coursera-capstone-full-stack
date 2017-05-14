var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Commitment = new Schema({
    username: {
      type: String,
      required: true
    },
    familyName: {
      type: String,
      required: true
    },
    category: {
        type: String,
        required: true
    },
    productType: {
      type: String,
      required: true
    },
    providerName: {
      type: String,
      required: true
    },
    providerRef: {
      type: String,
      required: true
    },
    renewalDate: {
        type: Date,
        required: true
    },
    reminderDate: {
        type: Date,
        required: true
    },
    providerAddr1: {
      type: String,
      default: ''
    },
    providerAddr2: {
      type: String,
      default: ''
    },
    providerTel: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
});


module.exports = mongoose.model('Commitment', Commitment);
