const gulp = require('gulp');
const touch = require('../../../lib/touch');
const through = require('through2');
const Vinyl = require('vinyl');

function getText(nodes, properties) {
	const text = Array.prototype.map.call(nodes, node => node.textContent).join('');
	switch (properties['text-transform']) {
		case 'lowercase':
			return text.toLowerCase();
		case 'uppercase':
			return text.toUpperCase();
		default:
			return text;
	}
}

function generateTable(output, exclude, fonts) {
	const classes = new Set();
	const ids = new Set();
	const text = {all: ''};
	const table = {};

	function eachFile(file, encoding, complete) {
		const html = file.contents.toString();
		const dom = new (require('jsdom').JSDOM)(html, {
			contentType: 'text/html',
		});
		for (const node of dom.window.document.querySelectorAll('*')) {
			node.id && ids.add(node.id);
			node.classList.forEach(className => {
				classes.add(className);
			});
		}

		// clean then count chars
		dom.window.document.querySelectorAll(exclude).forEach(node => node.remove());
		text.all += dom.window.document.body.textContent;

		// count chars for specific selectors
		fonts.forEach(({family, selectors, fonts}) => {
			selectors.forEach(([selector, properties]) => {
				// noinspection JSCheckFunctionSignatures
				text[family] = (text[family] || '') + getText(dom.window.document.querySelectorAll(selector), properties);
			});

			fonts.forEach(font => {
				table[font.key] = family;
			});
		});

		complete();
	}

	function endStream(complete) {
		try {
			// get unique char lists
			Object.keys(text).forEach(key => {
				text[key] = Array.from(new Set(text[key])).sort((a, b) => a.codePointAt(0) - b.codePointAt(0)).join('');
			});
			this.push(new Vinyl({
				path: output,
				contents: Buffer.from(JSON.stringify({
					table: table,
					text: text,
					classes: Array.from(classes),
					ids: Array.from(ids),
				}, null, '\t'), 'utf8')
			}));
			complete();
		} catch (error) {
			complete(error);
		}
	}

	return through.obj(eachFile, endStream, false);
}

module.exports = function (paths) {

	const globs = `${paths.src}/*.html`;

	const main = function () {
		return gulp.src(globs)
			.pipe(generateTable('stats.json', 'script,noscript', {
				'droidserif-regular': '.f-droid',
				'bitter_wght': '.f-bitter',
			}))
			.pipe(touch())
			.pipe(gulp.dest(paths.var))
			;
	};

	main.displayName = 'stats';

	return main;
};
