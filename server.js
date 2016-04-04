var app = require('./server-config.js');

// set port to be the server port, othwise ...
var port = process.env.PORT || 4568;

// listen on the port
app.listen(port);

console.log('Server now listening on port ' + port);
