var express = require('express');
var router = express.Router();
var Invitation = require('../models/invitation');
var User = require('../models/user');
var Verify    = require('./verify');
// var sleep = require('sleep');

function getUser(id) {
  return User.findById(id).exec();
}

router.get('/', Verify.verifyOrdinaryUser, function(req, res, next) {
  console.log('Getting pending invitations for request', req.decoded);
  // sleep.sleep(2);
  getUser(req.decoded._id)
    .then(function(user) {
      console.log('Found user for request', user);
      Invitation.find({isPending:true, familyName: user.familyName}, function (err, invitations) {
          if (err) throw err;
          console.log('Found pending invitations for familyName ' + user.familyName, invitations);
          res.json(invitations);
      });
  });
});

router.post('/', Verify.verifyOrdinaryUser, function(req, res, next) {
    var reqInvitation = new Invitation({
      emailAddress : req.body.emailAddress, 
      name: req.body.name,
      familyName: req.body.familyName,
    invitor: req.decoded.emailAddress});
    // sleep.sleep(2);
    console.log('Adding invitation', reqInvitation);
    
    User.findOne({emailAddress:req.body.emailAddress}, function (err, user){
      if (err) {
        return next(err);
      }
      if (user) {
        return next(new Error('A user is already registered with the email address ' + req.body.emailAddress));
      }
      reqInvitation.save(reqInvitation, function(err, user) {
          if (err) {
              console.log('Error while saving invitation', err);
              return res.status(500).json({err: err});
          } else {
            return res.status(200).json({status: 'Saved invitation!'});
          }
      });
    });
});

module.exports = router;
