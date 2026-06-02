const subsetFont = require('subset-font');
const fontverter = require('fontverter');
const through = require('through2');
const PluginError = require('plugin-error');
const unicodeRange = require('../lib/unicode-range');
const fs = require('node:fs/promises');
const jsdom = require('jsdom').JSDOM;
const path = require('path');
const Vinyl = require('vinyl');

module.exports = function (sources) {

	const sprites = Object.fromEntries(Object.keys(sources).map(key => [key, []]));

	function eachFile(file, encoding, complete) {
		for (const [output, glob] of Object.entries(sources)) {
			if (file.dirname.endsWith(path.dirname(glob))) {
				sprites[output].push(file);
				break;
			}
		}
		complete();
	}

	function endStream(complete) {
		Object.entries(sprites).forEach(([output, files]) => {
			if (!files.length) {
				return;
			}
			const sprite = new jsdom('<svg xmlns="http://www.w3.org/2000/svg"/>', {
				contentType: 'image/svg+xml',
			});

			files.forEach(function (file) {
				const dom = new jsdom(file.contents.toString('utf8'), {
					contentType: 'image/svg+xml',
				});
				const document = dom.window.document;
				const svg = document.firstChild;
				const symbol = document.createElementNS(svg.getAttribute('xmlns'), 'symbol');

				['viewBox', 'preserveAspectRatio'].forEach(attr => {
					if (svg.hasAttribute(attr)) {
						symbol.setAttribute(attr, svg.getAttribute(attr));
					}
				});

				symbol.setAttribute('id', file.stem);
				symbol.append(...svg.childNodes);
				// sprite.window.document.documentElement.append(sprite.window.document.importNode(symbol, true));
				sprite.window.document.documentElement.append(symbol);
			});

			this.push(new Vinyl({
				path: output,
				contents: Buffer.from(sprite.serialize(), 'utf8'),
			}));
		});
		complete();
	}

	return through.obj(eachFile, endStream, false);
};
