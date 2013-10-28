exports.main = function(request, response) {
  var pg = require("pg");
  var connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/jeopardy_development";
  var client = new pg.Client(connectionString);
  client.connect();

  var testCount;

  client.query("SELECT COUNT(*) FROM clues", function(error, result) {
    testCount = result.rows[0].count;
    response.render("game/main", {title: "Jeopardy", count: testCount});
  });

}
