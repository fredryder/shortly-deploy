// require mongoose middleware
var mongoose = require('mongoose');

// provide database url/location
mongoURI = 'mongodb://localhost/shortlydb';
// connect use the the location url
mongoose.connect(mongoURI);

// Run in seperate terminal window using 'mongod'
// assign the connection to db variable
var db = mongoose.connection;
// whens there's a connection error, throw console.error (in red) - bind this to console, passing argument
// adds listener to the event, on event, do call fn
db.on('error', console.error.bind(console, 'connection error:'));
// 'once' our connection is oopen, run callback - log message
db.once('open', function () {
  console.log('Mongodb connection open');
});

// add db to the exports module
module.exports = db;
