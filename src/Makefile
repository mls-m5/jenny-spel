files=main.js game.js menu.js player.js enemies.js

all: ${files}
	cat $(files) > app.js
	minify app.js -o ../app.min.js
	# cat app.js > ../app.min.js

%.js: %.ts
	tsc $<

clean:
	rm *.js