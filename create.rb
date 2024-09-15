require "date"
require "erb"
require "pathname"
require "readline"
require "optparse"

isodate = Date.today.strftime("%F")
date = Date.today.strftime("%-m/%-d")
us_date = Date.today.strftime("%b %-d %Y")

content_path = "./src/content/blog/"

# 2024-09-03-diary.md

diary_template = ERB.new <<-EOF
---
title: '<%= isodate %>の日報'
description: '<%= date %>の日報をお届けいたします。'
pubDate: '<%= us_date %>'
emoji: '🦊'
tags: []
---

## 今日やったこと

## 明日やりたいこと

EOF

basic_template = ERB.new <<-EOF
---
title: '<%= title %>'
description: ''
pubDate: '<%= us_date %>'
emoji: '🦊'
tags: []
---
EOF

# puts(diary_template.result)

opt = OptionParser.new

type = ARGV[0]

if type == "diary"
  diary_slug = "#{isodate}-diary.md"
  diary_path = Pathname.new(content_path).join(diary_slug)
  puts diary_path
else
  title = Readline.readline(" >")
  puts "hi"
end
