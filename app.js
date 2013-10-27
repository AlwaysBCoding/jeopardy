
/**
 * Module dependencies.
 */

// starts the express app
var express = require('express');
var app     = express();

// routes
var routes = require('./routes');
var user   = require('./routes/user');
var game   = require("./routes/game");

// variables
var http   = require('http');
var path   = require('path');
var server = http.createServer(app);
var io     = require("socket.io").listen(server);
var _      = require("underscore")._;


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// SOCKET IO CONFIG FOR HEROKU
// io.configure(function() {
//   io.set("transports", ["xhr-polling"]);
//   io.set("polling duration", 10);
// });

// START SERVER
var port = process.env.port || 4682
server.listen(port, function() {
  console.log("Server listening on port " + port);
});

// ROUTES
app.get('/', game.main);
app.get('/users', user.list);

// VARIABLES
var activePlayers = [];

// SOCKET IO EVENT HANDLERS
io.sockets.on("connection", function(socket) {
  socket.on("new player", function(player) {
    activePlayers.push(player);
    console.log("Added player: " + player.username);

    io.sockets.emit("update player list", activePlayers);
  });
});
