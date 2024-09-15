edit:
  $EDITOR $(fd '\-diary\.md$'  ./src/content/blog/ -e md | fzf)

latest:
	$EDITOR $(fd '\-diary\.md$'  ./src/content/blog/ -e md | sort -r | head -n 1)

diary:
  ruby create.rb diary

new:
  ruby create.rb
