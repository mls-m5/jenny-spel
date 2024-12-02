files=main.js game.js menu.js player.js enemies.js

all: ${files}
	cat $(files) > app.js
	if command -v minify > /dev/null 2>&1; then \
		minify app.js -o ../app.min.js; \
	else \
		echo "minify not found, using cat instead"; \
		cat app.js > ../app.min.js; \
	fi

%.js: %.ts
	tsc $<

clean:
	rm -f *.js app.js ../app.min.js
