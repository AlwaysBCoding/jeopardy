var _ = require("underscore")._;
var url = require("url");

exports.main = function(request, response) {
  response.render("game/main", {title: "Jeopardy"});
}

exports.show = function(request, response) {
  var game_id = url.parse(request.url).pathname.replace("/game/", "");
  var activeGames = JSON.parse(process.env.activeGames);
  var game_data;
  _.each(activeGames, function(game) {
    console.log("game.id: " + game.id + "||" + "game_id: " + game_id);
    if(game.id == game_id) {
      game_data = JSON.stringify(game);
    }
  });

  response.render("game/show", {title: "Jeopardy", game: game_data});
}
