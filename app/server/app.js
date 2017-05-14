var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var passport = require('passport');
var authenticate = require('./authenticate');

var config = require('./config');

// ========================
// Connect mongoose
// ========================

//'mongoUrl' : 'mongodb://localhost:27017/homeaze'

// Util is handy to have around, so thats why that's here.
const util = require('util')
// and so is assert
const assert = require('assert');

var cfenv = require('cfenv');

var appenv = cfenv.getAppEnv();
console.log(appenv);

if (appenv.isLocal) {
  // not running in the cloud
  var uri = process.env.MONGO_URL;
  console.log('Connecting to local mongoose instance @', uri);
  mongoose.connect(process.env.MONGO_URL);
} else {
  console.log('Running in Bluemix')
  // Within the application environment (appenv) there's a services object
  var services = appenv.services;
  // The services object is a map named by service so we extract the one for MongoDB
  var mongodb_services = services["compose-for-mongodb"];
  // This check ensures there is a services for MongoDB databases
  assert(!util.isUndefined(mongodb_services), "Must be bound to compose-for-mongodb services");
  // We now take the first bound MongoDB service and extract it's credentials object
  var credentials = mongodb_services[0].credentials;
  var ca = [new Buffer(credentials.ca_certificate_base64, 'base64')];
  var options = {
    mongos: {
      ssl: true,
      sslValidate: true,
      sslCA: ca,
      poolSize: 1,
      reconnectTries: 1
    }
  }
  var uri = credentials.uri;
  var modifiedUri = uri.replace(/admin\?/g, 'homeaze?').concat('&authSource=admin');
  console.log('Credential uri', uri);
  console.log('Connecting to compose-for-mongodb service with name ' + mongodb_services[0].name + ' at uri ' + modifiedUri, options);
  mongoose.connect(modifiedUri, options);
}

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Successfully connected to Mongo");

});


var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
  res.header("Access-Control-Allow-Methods", "DELETE,GET,HEAD,POST,PUT,OPTIONS");
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());                                                                                                                                                                   
app.use(express.static(path.join(__dirname, 'public')));

// Secure traffic only
// app.all('*', function(req, res, next) {
//   console.log('req start: ',req.secure, req.hostname, req.url, app.get('port'));
//   if (req.secure) {
//     return next();
//   };

//  res.redirect('https://'+req.hostname+':'+ app.get('port') + req.url);
// });

// ========================
// Register routes
// ========================
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/commitments', require('./routes/commitments'));
app.use('/invitations', require('./routes/invitations'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

module.exports = app;