compile:
	rm -rf dist
	mkdir dist
	./node_modules/.bin/eslint src/ssi.js
	./node_modules/.bin/babel src/ssi.js -o dist/ssi.js
run:
	node dist/ssi.js