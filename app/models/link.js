var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

// define Link database schema
var linkSchema = mongoose.Schema({
  visits: Number,
  link: String,
  title: String,
  code: String,
  baseUrl: String,
  url: String
});

// create database model, Link, with the linkSchema schema
var Link = mongoose.model('Link', linkSchema);

// create the unqiue shasum which becomes the new mini-link
var createSha = function(url) {
  // creates hash, without key or data
  var shasum = crypto.createHash('sha1');
  // updates the hash (called shasum) with the data
  shasum.update(url);
  // creaet the digest in hex format, returning the first 6 chars
  return shasum.digest('hex').slice(0, 5);
};

// before save to linkcSchema, inject this process into the databse save:
// create the sha from the url
// save the set the sha to the code field on the linkScheme
// call next serial middleware hook
linkSchema.pre('save', function(next) {
  var code = createSha(this.url);
  // this.code is the db code field
  this.code = code;
  next();
});

module.exports = Link;
