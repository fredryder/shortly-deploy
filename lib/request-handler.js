var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');


// responses to client: methods for rendering the ejs template files

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

// destroy user session and redirect to login page
exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

// 
exports.fetchLinks = function(req, res) {
  // .find object in Link db
  // .executes the aggregate pipeline on the currently bound model
  // on the Link database model, respond with the links and the 200 code
  Link.find({}).exec(function(err, links) {
    res.send(200, links);
  })
};


exports.saveLink = function(req, res) {
  // uri is the provided url from the form, which is on the resbody, sent by the client
  var uri = req.body.url;
  // if it's not a valid url (As per the regex)
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  // find the entry (mongoose method) with the data provided (uri)
  // execute (mongoose syntax)
  Link.findOne({ url: uri }).exec(function(err, found) {
    // if found... send response with the data and 200 code
    if (found) {
      res.send(200, found);
    // else save...
    } else {
      // get title passing in callback for the the getUrlTitle helper
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        // create a new Link instance for the database
        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin,
          visits: 0
        });
        // save the instance to the database, passing in optional callback for
        // handling the response
        newLink.save(function(err, newLink) {
          if (err) {
            res.send(500, err);
          } else {
            // send repsonse 200 with the newLink data
            res.send(200, newLink);
          }
        });
      })
    }
  });
};

// login user helper
exports.loginUser = function(req, res) {
  // assign the data received from the client to the local variables
  var username = req.body.username;
  var password = req.body.password;

  // mongoose checks to find the record in the db
  User.findOne({ username: username })
    .exec(function(err, user) {
      // if user !exist, redirect
      if (!user) {
        res.redirect('/login');
      } else {
        // call comapre password method on the user model
        // pass in password plaintext, the user.password from the findOne look-up
        // and a callback for handling the results
        User.comparePassword(password, user.password, function(err, match) {
          // if match create a session
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
  });
};

// signup
exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // attempt to find user to avoid duplicates
  User.findOne({ username: username })
    .exec(function(err, user) {
      // if user doens't already exist, create new user instance
      if (!user) {
        var newUser = new User({
          username: username,
          password: password
        });
        // save new user to db, pass in callback to handle result
        newUser.save(function(err, newUser) {
          if (err) {
            res.send(500, err);
          }
          // if not error, create session immediately so no additional login required
          util.createSession(req, res, newUser);
        });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    });
};

// navigate to the link. I.e. the shortened url is requeste... match with full url
exports.navToLink = function(req, res) {
  // find link in db withe code as per the request object's params[0], which will be the code after the /
  // execute pipeline
  Link.findOne({ code: req.params[0] }).exec(function(err, link) {
    // if link not found, redirect to '/'
    if (!link) {
      res.redirect('/');
    } else {
      // increment visits counter
      link.visits++;
      // save the accessed link (with the updated visits count)
      link.save(function(err, link) {
        // redirect to the url foudn in the db
        res.redirect(link.url);
        return;
      })
    }
  });
};