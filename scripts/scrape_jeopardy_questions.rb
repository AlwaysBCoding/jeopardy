# Category
  # name
  # date
  # round

# Clue
  # question
  # answer
  # amount

require "nokogiri"
require "open-uri"
require "date"
require "active_support/all"

ids = 1..5

ids.each do |id|

  url = "http://www.j-archive.com/showgame.php?game_id=#{id}"
  doc = Nokogiri::HTML(open(url))

  game_title = doc.at_css("#game_title h1").text.gsub(/\A.*( - )/, "")
  game_date = DateTime.strptime(game_title, "%A, %B %e, %Y")

  rounds = doc.css("table.round")
  single_jeopardy = rounds[0]
  double_jeopardy = rounds[1]

  single_jeopardy_categories = single_jeopardy.css("td.category")
  single_jeopardy_categories.each do |single_jeopardy_category|
    category_name = single_jeopardy_category.at_css("td.category_name").text
    # Category.create(name: category_name, game_date: game_date, round: "single")
  end

  double_jeopardy_categories = double_jeopardy.css("td.category")
  double_jeopardy_categories.each do |double_jeopardy_category|
    category_name = double_jeopardy_category.at_css("td.category_name").text
    # Category.create(name: category_name, game_date: game_date, round: "double")
  end

end
