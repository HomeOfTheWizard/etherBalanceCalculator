var app = require('./lib/app');
var config = require('./etc/config');

var server = app.listen(config.web.port, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("invoice api server listening at http://%s:%s", host, port)
})
