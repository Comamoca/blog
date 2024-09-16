require "date"
require "erb"
require "pathname"
require "readline"
require "thor"

$today = Date.today
$yesterday = Date.today - 1

def isodate(time); time.strftime("%F"); end
def date(time); time.strftime("%-m/%-d"); end
def us_date(time); time.strftime("%b %-d %Y"); end

$content_path = "./src/content/blog/"

def diary_template(day)
  tmpl = <<EOF
---
title: '#{isodate(day)}の日報'
description: '#{date(day)}の日報をお届けいたします。'
pubDate: '#{us_date(day)}'
emoji: '🦊'
tags: []
---

## 今日やったこと

## 明日やりたいこと

EOF

  return tmpl
end

def article_template(day)
  tmpl = <<EOF
---
title: ''
description: ''
pubDate: '#{us_date(day)}'
emoji: '🦊'
tags: []
---
EOF

  return tmpl
end

type = ARGV[0]

if type == "diary"
  is_yesterday = Readline.readline("Do you want to specify yesterday as the date? (y/N) >")

  if is_yesterday == "y"
    diary_slug = "#{isodate($yesterday)}-diary"
    diary_path = Pathname.new($content_path).join("#{diary_slug}.md")

    # puts(diary_template($yesterday))
    File.write(diary_path, diary_template($yesterday))

    puts "Created diary at #{diary_path}"
  else
    day = isodate($today)
    diary_slug = "#{day}-diary"
    diary_path = Pathname.new($content_path).join("#{diary_slug}.md")

    # puts(diary_template($today))
    File.write(diary_path, diary_template($today))

    puts "Created diary at #{diary_path}"
  end

  exit(0)
else
  slug = Readline.readline("Slug? > ")

  article_path = Pathname.new($content_path).join("#{isodate($today)}-#{slug}.md")
  # puts(article_template($today))

  File.write(article_path, article_template($today))

  puts "Created diary at #{article_path}"
end
