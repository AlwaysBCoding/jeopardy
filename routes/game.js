exports.main = function(request, response) {
  var _  = require("underscore")._;
  var pg = require("pg");
  var connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/jeopardy_development";
  var client = new pg.Client(connectionString);
  client.connect();

  var categories = {};
  var category_ids = [];

  var formatSet = function(array) {
    return "(" + array.toString() + ")"
  }

  query1 = client.query("SELECT ct.id, ct.name, EXTRACT(YEAR FROM ct.game_date)  FROM categories ct ORDER BY RANDOM() LIMIT 6", function(error, result) {
    _.each(result.rows, function(row, index) {
      categories[index] = row;
    });
    category_ids = _.map(categories, function(x) { return x.id });

    query2 = client.query("SELECT c.* FROM clues c WHERE c.category_id IN " + formatSet(category_ids), function(error, result) {
      categories["clues"] = result.rows;
    });

    query2.on("end", function() {
      response.render("game/main", {title: "Jeopardy", result: categories, ids: category_ids});
    });
  });

}
