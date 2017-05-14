var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Invitation = require('../models/invitation');
var Verify    = require('./verify');

router.get('/', function(req, res, next) {
  var query = {};
  if (req.query) {
    query = req.query;
    console.log('Received params ', query);
  }
  
  User.find(query, function (err, users) {
        if (err) {
          next(err);
        } else {
          console.log('Found users', users);
          res.json(users);
        }
    });
});

function getPendingInvitations(user, callback) {
  return Invitation.findOne({familyName: user.familyName, emailAddress: user.emailAddress}, callback);
}

function registerUser(reqUser, password, res, next, successCallback) {
  console.log('Registering user', reqUser);
  User.register(reqUser, password, function(err, user){
    if (err)
      return next(err);
    if (successCallback) successCallback();
    return res.status(200).json({status: 'Registration Successful!'});
  });
}

function isDefined(value) {
  return value && value.length;
}

router.post('/register', function(req, res, next) {
    var reqUser = new User({emailAddress : req.body.emailAddress, familyName: req.body.familyName, 
                  firstName: req.body.firstName, lastName: req.body.lastName });
    console.log('Checking if familyName "'+ reqUser.familyName + '" is already registered');
    User.find({familyName: reqUser.familyName}, function (err, users) {
      if (err)
        return next(err);
      
      console.log("Found ", users);
      if (isDefined(users)) {
          console.log('familyName already exists. Checking for pending invitations ...');
          getPendingInvitations(reqUser, function (err, invitation) {
            if(err) 
              return next(err);

            if (invitation) {
              console.log('Invitation exists. Proceeding with registration');
              registerUser(reqUser, req.body.password, res, next, function() {
                invitation.isPending = false;
                invitation.save(function(err, savedInvitation){
                  console.log('Updated invitation', savedInvitation);
                });
              });
            } else {
              next(new Error('The family name ' + reqUser.familyName + ' is already registered'));
            }
          });
      } else {
        console.log('fmilyName has not yet been registered. Proceeding with registration')
        registerUser(reqUser, req.body.password, res, next, undefined);
      }
    });
});

router.post('/login', function(req, res, next) {
  // how does passport know of emailAddress property?
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
        
      var token = Verify.getToken({"emailAddress": user.emailAddress, "_id": user._id});
      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token,
        familyName: user.familyName,
        name: user.firstName
      });
    });
  })(req,res,next);
});

router.get('/logout', Verify.verifyOrdinaryUser, function(req, res, next) {
  var loggedOutUser = req.decoded;
  console.log('Logging out', loggedOutUser);
  req.logout();
  res.status(200).json({
    message: 'Bye'
  });
});

module.exports = router;
