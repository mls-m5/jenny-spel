files=main.js player.js enemies.js

all: ${files}
	cat $(files) > app.js
	# minify app.js -o ../app.min.js #Create smaller and less readable file
	cat app.js > ../app.min.js

%.js: %.ts
	tsc $<

clean:
	rm *.js