// Generated by CoffeeScript 1.6.2
(function() {
  var PORT, app, server;

  PORT = process.env.PORT;

  app = require("./app");

  server = app.listen(PORT);

  //console.log("Listening on port " + PORT);

}).call(this);
