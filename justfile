open:
  $EDITOR $(nu -c 'ls ./src/blog | where name !~ "-diary.md" | sort-by modified | get name | to text' | fzf)

edit-diary:
  $EDITOR $(fd '\-diary\.md$'  ./src/blog/ -e md | fzf)

latest-diary:
  $EDITOR $(fd '\-diary\.md$'  ./src/blog/ -e md | sort -r | head -n 1)

diary:
  ruby create.rb diary

new:
  ruby create.rb
