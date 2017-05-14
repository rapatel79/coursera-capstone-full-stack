var express = require('express');
var router = express.Router();
var Commitment = require('../models/commitment');
var User = require('../models/user');
var Verify    = require('./verify');
// var sleep = require('sleep');

function getUser(id) {
  return User.findById(id).exec();
}

function mapCommitments(commitments) {
  var commitmentHeaders = commitments.map(function(commitment, index, array){
          return {
            //username: commitment.username,
            id: commitment._id,
            category: commitment.category,
            providerName: commitment.providerName,
            productType: commitment.productType,
            renewalDate: commitment.renewalDate,
            username: commitment.username,
            reminderDate: commitment.reminderDate,
            providerRef: commitment.providerRef
          }
        });
  console.log('commitment headers', commitmentHeaders);
  return commitmentHeaders;      
}
// get my commitments
router.get('/', Verify.verifyOrdinaryUser, function(req, res, next) {
    Commitment.find(
        {username: req.decoded.emailAddress}, function (err, commitments) {
            if (err) throw err;
            res.json(mapCommitments(commitments));
        });
});
// get all commitments for family
router.get('/all', Verify.verifyOrdinaryUser, function(req, res, next) {
//   sleep.sleep(3);  
  getUser(req.decoded._id)
  .then(function(user) {
    Commitment.find(
    {familyName: user.familyName}, function (err, commitments) {
        if (err) throw err;
        res.json(mapCommitments(commitments));
    });        
  });
});
// save a commitment
router.post('/', Verify.verifyOrdinaryUser, function(req, res) {
    // sleep.sleep(3);
    console.log('req.decoded', req.decoded);
    console.log('req.body', req.body);
    getUser(req.decoded._id)
        .then(function(user) {
            var reqCommitment = new Commitment({
                username : user.emailAddress, 
                familyName: user.familyName,
                category: req.body.category, 
                productType: req.body.productType,
                providerName: req.body.providerName,
                providerRef: req.body.providerRef,
                providerTel: req.body.providerTel,
                providerAddr1: req.body.providerAddr1,
                providerAddr2: req.body.providerAddr2,
                notes: req.body.notes,
                renewalDate: new Date(req.body.renewalDate),
                reminderDate: new Date(req.body.reminderDate)
            });
            console.log('Saving commitment', reqCommitment);
            reqCommitment.save(reqCommitment, function(err, user) {
                if (err) {
                    console.log('Error while saving commitment', err);
                    return res.status(500).json({err: err});
                } else {
                return res.status(200).json({status: 'Saved commitment!'});
                }
            });
        });
    
});
// get commitment
router.route('/:commitmentId')
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    // sleep.sleep(3);
  Commitment.findById(req.params.commitmentId, function (err, commitment) {
        if (err) throw err;
        res.json(commitment);
    });
})
// update commitment
.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    // sleep.sleep(3);
    Commitment.findByIdAndUpdate(req.params.commitmentId, 
        {$set: req.body}, 
        {new: true}, 
        function (err, commitment) {
            console.log('Completed findByIdAndUpdate for id ' + req.params.commitmentId, err, commitment);
            if (err) {
                next(err);
            } else {
                res.json(commitment);
            }
        }
    );
})
// delete commitment
.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    // sleep.sleep(3);
    Commitment.findByIdAndRemove(req.params.commitmentId, function (err, resp) {
        console.log('Completed findByIdAndRemove for id ' + req.params.commitmentId, err, resp);
        if (err) {
            next(err);
        } else {
            res.json(resp);
        }
    });
})
;
module.exports = router;