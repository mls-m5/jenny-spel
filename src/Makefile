files=main.js

all: ${files}
	cat *.js > app.js
	minify app.js -o ../app.min.js #Create smaller and less readable file

%.js: %.ts
	tsc $<

clean:
	rm *.js