# Category
  # name
  # game_date
  # round
  # index

# Clue
  # question
  # answer
  # value
  # category_id

require "nokogiri"
require "open-uri"
require "date"
require "active_support/all"

ids = -5..5

ids.each do |id|

  url = "http://www.j-archive.com/showgame.php?game_id=#{id}"
  doc = Nokogiri::HTML(open(url))

  next if !doc.at_css("#game_title h1").present?

  game_title = doc.at_css("#game_title h1").text.gsub(/\A.*( - )/, "")
  game_date = DateTime.strptime(game_title, "%A, %B %e, %Y")

  rounds = doc.css("table.round")
  single_jeopardy = rounds[0]
  double_jeopardy = rounds[1]

  single_jeopardy_categories = single_jeopardy.css("td.category")
  single_jeopardy_categories.each_with_index do |single_jeopardy_category, index|
    category_name = single_jeopardy_category.at_css("td.category_name").text
    # category = Category.create(name: category_name, game_date: game_date, round: "single", index: index+1)
  end

  single_jeopardy_clues = single_jeopardy.css("td.clue")
  single_jeopardy_clues.each_with_index do |single_jeopardy_clue, index|
    question = single_jeopardy_clue.at_css(".clue_text").present? ? single_jeopardy_clue.at_css(".clue_text").text : nil;

    clue_value = nil
    case index
    when 0..5 then clue_value = 200
    when 6..11 then clue_value = 400
    when 12..17 then clue_value = 600
    when 18..23 then clue_value = 800
    when 24..29 then clue_value = 1000
    end

    answer = single_jeopardy_clue.at_css("div[onmouseover]").present? ? single_jeopardy_clue.at_css("div[onmouseover]")["onmouseover"].match(/">.*<\/em>/).to_s.gsub(/^">/, "").gsub(/<\/em>|<i>|<\/i>/, "") : nil;
    # category_id = Category.where(game_date: game_date, index: index%6 + 1).id
    puts "#{clue_value}: #{question} :: #{answer}"

    # clue = Clue.new
    # clue.question = question
    # clue.answer = answer
    # clue.value = clue_value
    # clue.category_id = category_id
    # clue.save

  end

  puts "============================="

  double_jeopardy_categories = double_jeopardy.css("td.category")
  double_jeopardy_categories.each_with_index do |double_jeopardy_category, index|
    category_name = double_jeopardy_category.at_css("td.category_name").text
    # category = Category.create(name: category_name, game_date: game_date, round: "double", index: index+1)
  end

  double_jeopardy_clues = double_jeopardy.css("td.clue")
  double_jeopardy_clues.each_with_index do |double_jeopardy_clue, index|
    question = double_jeopardy_clue.at_css(".clue_text").present? ? double_jeopardy_clue.at_css(".clue_text").text : nil;

    clue_value = nil
    case index
    when 0..5 then clue_value = 400
    when 6..11 then clue_value = 800
    when 12..17 then clue_value = 1200
    when 18..23 then clue_value = 1600
    when 24..29 then clue_value = 2000
    end

    answer = double_jeopardy_clue.at_css("div[onmouseover]").present? ? double_jeopardy_clue.at_css("div[onmouseover]")["onmouseover"].match(/">.*<\/em>/).to_s.gsub(/^">/, "").gsub(/<\/em>|<i>|<\/i>/, "") : nil;
    # category_id = Category.where(game_date: game_date, index: index%6 + 1).id
    puts "#{clue_value}: #{question} :: #{answer}"

    # clue = Clue.new
    # clue.question = question
    # clue.answer = answer
    # clue.value = clue_value
    # clue.category_id = category_id
    # clue.save

  end

  puts "============================="
  puts "*****************************"
  puts "============================="

end
