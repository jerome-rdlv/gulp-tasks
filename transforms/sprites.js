const subsetFont = require('subset-font');
const fontverter = require('fontverter');
const through = require('through2');
const PluginError = require('plugin-error');
const unicodeRange = require('../lib/unicode-range');
const fs = require('node:fs/promises');
const jsdom = require('jsdom').JSDOM;
const path = require('path');
const Vinyl = require('vinyl');
const anymatch = require('anymatch');
const toAbsoluteGlob = require('@gulpjs/to-absolute-glob');
const objectMap = require('../lib/object-map');

module.exports = function (sources) {

	const sprites = objectMap(sources, () => []);
	const matchers = objectMap(sources, matchers => (Array.isArray(matchers) ? matchers : [matchers])
		.map(m => toAbsoluteGlob(m, {cwd: path.resolve(process.cwd())})));

	function eachFile(file, encoding, complete) {
		for (const [output, m] of Object.entries(matchers)) {
			if (anymatch(m, file.path)) {
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
