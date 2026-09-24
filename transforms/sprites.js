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

			const atts = ['viewBox', 'preserveAspectRatio', 'width', 'height'];

			const sprite = new jsdom('<svg xmlns="http://www.w3.org/2000/svg"/>', {
				contentType: 'image/svg+xml',
			});

			const doc = sprite.window.document.documentElement;

			const style = doc.ownerDocument.createElementNS(doc.getAttribute('xmlns'), 'style');
			style.innerHTML = 'svg:not(:target){display:none;}';
			doc.append(style);

			files.forEach(function (file) {
				const dom = new jsdom(file.contents.toString('utf8'), {
					contentType: 'image/svg+xml',
				});
				const svg = dom.window.document.firstChild;

				Array.prototype.forEach.call(svg.attributes, attr => {
					atts.indexOf(attr.name) === -1 && svg.removeAttribute(attr.name);
				});

				['width', 'height'].forEach(attr => {
					if (svg.hasAttribute(attr)) {
						svg.dataset[attr] = svg.getAttribute(attr);
						svg.removeAttribute(attr);
					}
				});

				svg.setAttribute('id', file.stem);
				doc.append(svg);
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
