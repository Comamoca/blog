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

def ask_override(diary_path, template)
  if File.exist?(diary_path)
    # ファイルが存在する場合は上書きするか聞く
    answer = Readline.readline("File already exists. Do you want to overwrite it?(y/N)")

    if answer == "y"
      File.write(diary_path, template)
      puts "🎉 Created diary at #{diary_path}"
    else
      puts "☕ Terminated"
    end
  else
    File.write(diary_path, template)
    puts "🎉 Created diary at #{diary_path}"
  end
end

$content_path = "./src/blog/"

def diary_template(day)
  tmpl = <<EOF
---
title: '#{isodate(day)}の日報'
description: '#{date(day)}の日報をお届けいたします。'
pubDate: '#{us_date(day)}'
emoji: '🦊'
tags: []
draft: false
---

## 今日やったこと

## 明日以降やりたいこと

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
draft: true
---
EOF

  return tmpl
end

type = ARGV[0]

if type == "diary"
  is_yesterday = Readline.readline("Do you want to specify yesterday(#{$yesterday}) as the date? (y/N) >")

  if is_yesterday == "y"
    diary_slug = "#{isodate($yesterday)}-diary"
    diary_path = Pathname.new($content_path).join("#{diary_slug}.md")

    # puts(diary_template($yesterday))

    ask_override(diary_path, diary_template($yesterday))
  else
    diary_slug = "#{isodate($today)}-diary"
    diary_path = Pathname.new($content_path).join("#{diary_slug}.md")

    # puts(diary_template($today))
    ask_override(diary_path, diary_template($today))
  end

  exit(0)
else
  slug = Readline.readline("Slug? > ")

  article_path = Pathname.new($content_path).join("#{isodate($today)}-#{slug}.md")
  # puts(article_template($today))

  File.write(article_path, article_template($today))

  puts "🎉 Created article at #{article_path}"
end
