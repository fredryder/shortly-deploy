var express = require('express');
var partials = require('express-partials');
var util = require('./lib/utility');


var handler = require('./lib/request-handler');

// set express seerver to app
var app = express();

// configure express server
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  // laoding html partials/templates
  app.use(partials());
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  // session set-up
  app.use(express.cookieParser('shhhh, very secret'));
  app.use(express.session());
});

// router...
// for /, checkUser logged in...
app.get('/', util.checkUser, handler.renderIndex);
app.get('/create', util.checkUser, handler.renderIndex);

app.get('/links', util.checkUser, handler.fetchLinks);
app.post('/links', handler.saveLink);

// simple res.send() the relevant html
app.get('/login', handler.loginUserForm);
app.post('/login', handler.loginUser);
app.get('/logout', handler.logoutUser);

app.get('/signup', handler.signupUserForm);
app.post('/signup', handler.signupUser);

// for redirecting a shortened url to the full url
app.get('/*', handler.navToLink);

module.exports = app;
