exports.main = function(request, response) {
  // Initialize Variables
  var _  = require("underscore")._;
  var pg = require("pg");
  var connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/jeopardy_development";
  var client = new pg.Client(connectionString);
  client.connect();

  var data = { "categories": {} };
  var category_ids = [];

  var formatSet = function(array) {
    return "(" + array.toString() + ")"
  }

  query1 = client.query("SELECT ct.id, ct.name, EXTRACT(YEAR FROM ct.game_date) FROM categories ct ORDER BY RANDOM() LIMIT 6", function(error, result) {
    _.each(result.rows, function(row, index) {
      data["categories"][row.id] = row;
      data["categories"][row.id]["clues"] = [];
    });
    category_ids = _.map(data["categories"], function(x) { return x.id });

    query2 = client.query("SELECT c.question, c.answer, c.value, c.category_id FROM clues c WHERE c.category_id IN " + formatSet(category_ids), function(error, result) {
      _.each(result.rows, function(row, index) {
        data["categories"][row.category_id]["clues"].push(row);
      });
    });

    query2.on("end", function() {
      response.render("game/main", {title: "Jeopardy", result: data, ids: category_ids});
    });
  });

}
