const fs = require('fs');
const mustache = require('mustache');
const path = require('path');
const PluginError = require('plugin-error');
const through = require('through2');
const Vinyl = require('vinyl');

module.exports = function (template, output) {

	if (!fs.existsSync(template)) {
		throw new Error(`Template file ${template} does not exists`);
	}

	template = fs.readFileSync(template, 'utf8');

	const items = [];

	function getDims(svgCode) {
		const dom = new (require('jsdom').JSDOM)(svgCode, {
			contentType: 'image/svg+xml',
		});
		const svg = dom.window.document.querySelector('svg');

		const viewbox = svg.getAttribute('viewBox');
		if (viewbox) {
			return viewbox.split(' ');
		}
		return null;
	}

	function eachFile(file, encoding, complete) {

		this.push(file);

		const svgCode = file.contents.toString();
		const dims = getDims(svgCode);
		if (!dims) {
			console.warn(`svg-to-scss: ${file.relative} ignore because missing viewBox attribute`);
			return complete();
		}
		const vars = [];
		const encoded = encodeURIComponent(svgCode)
			// replace variables with default value, and build vars object
			// format is for example {$main:#383f4a}
			.replace(/(%7B%24(.*?)%3A(.*?)%7D)/g, function () {
				vars.push({
					name: decodeURIComponent(arguments[2]),
					default: decodeURIComponent(arguments[3])
				});
				return '{' + decodeURIComponent(arguments[2]) + '}';
			});

		const parts = path.parse(file.relative);
		const filename = (parts.dir ? parts.dir + '/' : '').replace('/', '__') + parts.name;

		items.push({
			dataurl: 'data:image/svg+xml,' + encoded,
			filename: filename,
			width: dims[2],
			height: dims[3],
			variables: '(' + vars
					.map(function (item) {
						return '"' + item.name + '":"' + item.default + '"';
					})
					// variable names must be unique
					.filter(function (value, index, self) {
						return self.indexOf(value) === index;
					})
					.join(', ')
				+ ')'
		});

		complete();
	}

	function endStream(complete) {
		try {
			const scss = mustache.render(template, {items});
			const buffer = Buffer.from(scss, 'utf8');
			complete(null, new Vinyl({
				path: output,
				contents: buffer
			}));
		} catch (error) {
			complete(error);
		}
	}

	// noinspection JSCheckFunctionSignatures
	return through.obj(eachFile, endStream);
};
