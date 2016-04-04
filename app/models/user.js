var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var bluebird = require('bluebird');

// declare new table with mongoose:
// username, a string, required with a unqiue id
// passworD: require, string
var userSchema = mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true }
});

// model makes the table using the scheme as defined above
// User is now the User database model/access
var User = mongoose.model('User', userSchema);

// add compare password method to the User model
User.comparePassword = function(candidatePassword, savedPassword, cb) {
  // use bcypt modele for the compare
  // callback: true/false if it's a match/no match
  bcrypt.compare(candidatePassword, savedPassword, function(err, isMatch) {
    // if err, return the callback with err passed in
    // e.g. in .longinUser() if err is passed in, the callback redirects to login
    if (err) { return cb(err); }
    // if match true, pass in null for the err parameter and run callback which
    // invokes utils.createSession
    cb(null, isMatch);
  });
};

// .pre() -> Middleware: pre-save operation: 'hook' -> intercepts data going into the userSchema
userSchema.pre('save', function(next) {
  // save to cipher: promisified bcrytp.hash method
  var cipher = bluebird.promisify(bcrypt.hash);
  // parameters: data, salt, progress, cb
  // this function takes in the palintext password and hashes it. It returns the hash.
  return cipher(this.password, null, null).bind(this)
    // the hash is then saved to this.password
    // next is called.
    .then(function(hash) {
      this.password = hash;
      // calls next serial middleware hook
      next();
    });
});

// assing to exports module
module.exports = User;
