var request = require('request');

// get the title of the html page of the link being created
exports.getUrlTitle = function(url, cb) {
  // reuest is an express middleware that makes http calls
  // here it goes out and gets url page details
  request(url, function(err, res, html) {
    // if error, log message and run cllback
    if (err) {
      console.log('Error reading url heading: ', err);
      // here callback is error message and send response 404 . (repeat of console log)
      return cb(err);
    } else {
      // regex for finding the title
      var tag = /<title>(.*)<\/title>/;
      // assing title text to match (regex passed in)
      var match = html.match(tag);
      // if the title header isn't empty/exists, save value at match results array[1] tot title, otherwise the url
      var title = match ? match[1] : url;
      // return the callback, which creates a new link, and passes in the title provided title to the new Link instance
      return cb(err, title);
    }
  });
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;

// regex matching for url validifcation/escaping
exports.isValidUrl = function(url) {
  return url.match(rValidUrl);
};

// check if session.user exists
// check the session obejct to see if there's a session created.
// If yes --> true, otherwise if no session, false
exports.isLoggedIn = function(req, res) {
  return req.session ? !!req.session.user : false;
};

// checks the user
exports.checkUser = function(req, res, next) {
  // if user is not logged in (checked using isLoggiedIn above, redirect to login
  if (!exports.isLoggedIn(req)) {
    res.redirect('/login');
  } else {
    // goes to next route in the cascade
    next();
  }
};

// create user loggin in session
exports.createSession = function(req, res, newUser) {
  // if there's already a session in progress, detroys the mapping and generates a new id and cookie
  // then saves the user object on that session
  // then redirects to the '/' route
  return req.session.regenerate(function() {
      req.session.user = newUser;
      res.redirect('/');
    });
};
