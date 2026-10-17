open:
  $EDITOR $(nu -c 'ls ./src/blog | where name !~ "-diary.org" | sort-by modified | get name | to text' | fzf)

edit-diary:
  $EDITOR $(fd '\-diary\.org$'  ./src/blog/ -e org | fzf)

latest-diary:
  $EDITOR $(fd '\-diary\.org$'  ./src/blog/ -e org | sort -r | head -n 1)

diary:
  create diary

new:
  create
