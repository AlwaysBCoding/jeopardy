
/**
 * Module dependencies.
 */

// starts the express app
var express = require('express');
var app     = express();

// routes
var routes = require('./routes');
var game   = require("./routes/game");

// variables
var http   = require('http');
var path   = require('path');
var server = http.createServer(app);
var io     = require("socket.io").listen(server);
var _      = require("underscore")._;
var pg     = require("pg");


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

// POSTGRES INFORMATION
var connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/jeopardy_development";
var client = new pg.Client(connectionString);
client.connect();

// START SERVER
var port = process.env.port || 4682
server.listen(port, function() {
  console.log("Server listening on port " + port);
});

// ROUTES
app.get('/', game.main);
app.get("/game/:id", game.show);

// VARIABLES
var activePlayers = [];
var activeGames = [];

// HELPER FUNCTIONS
var arrayAsSet = function(array) {
  return "(" + array.toString() + ")";
}

// PLAYER LOGIC
var addPlayer = function(player, id) {
  var newPlayer = {
    username: player.username,
    id: id
  };
  activePlayers.push(newPlayer);
  return newPlayer;
}

var removePlayer = function(id) {
  var index = 0;
  _.each(activePlayers, function(player) {
    if(id === player.id) {
      activePlayers.splice(index, 1);
      return;
    } else {
      index++;
    };
  });
}

var updatePlayers = function() {
  io.sockets.emit("update player list", activePlayers);
};

// GAME LOGIC
var generate_game_board = function(id) {
  var board = { "categories": {} };
  var category_ids = [];

  query1 = client.query("SELECT ct.id, ct.name, EXTRACT(YEAR FROM ct.game_date) FROM categories ct ORDER BY RANDOM() LIMIT 6", function(error, result) {
    _.each(result.rows, function(row, index) {
      board["categories"][row.id] = row;
      board["categories"][row.id]["clues"] = [];
    });
    category_ids = _.map(board["categories"], function(x) { return x.id });

    query2 = client.query("SELECT c.question, c.answer, c.value, c.category_id FROM clues c WHERE c.category_id IN " + arrayAsSet(category_ids), function(error, result) {
      _.each(result.rows, function(row, index) {
        board["categories"][row.category_id]["clues"].push(row);
      });
    });

    query2.on("end", function() {
      _.each(activeGames, function(game) {
        if (game.id == id) {
          game.board = board;
          updateGames();
        };
      });
    });
  });
}

var addGame = function(game, id) {
  var newGame = {
    id: id,
    game_name: game.game_name,
    players: [id]
  };
  generate_game_board(id);
  activeGames.push(newGame);
  return newGame;
}

var removeGame = function() {

}

var updateGames = function() {
  process.env.activeGames = JSON.stringify(activeGames);
  io.sockets.emit("update games list", activeGames);
}

// SOCKET IO EVENT HANDLERS
io.sockets.on("connection", function(socket) {
  socket.on("new player", function(player) {
    var player = addPlayer(player, socket.id);
    updatePlayers();
  });

  socket.on("new game", function(game) {
    var game = addGame(game, socket.id);
  });

  socket.on("disconnect", function() {
    removePlayer(socket.id);
    updatePlayers();
  });
});
