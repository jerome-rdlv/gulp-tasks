const fs = require('fs');
const through = require('through2');

module.exports = function (dist, cachebust) {
	// noinspection JSCheckFunctionSignatures
	return through.obj(function (file, encoding, complete) {
		const dom = new (require('jsdom').JSDOM)(file.contents.toString(encoding), {
			contentType: 'image/svg+xml',
		});
		Array.prototype.forEach.call(dom.window.document.querySelectorAll('svg image'), node => {
			const href = node.getAttribute('xlink:href');
			const path = `${dist}/svg/${href}`;
			if (fs.existsSync(path)) {
				node.setAttribute('xlink:href', cachebust(href, path));
			}
		});

		file.contents = Buffer.from(dom.serialize(), 'utf8');
		this.push(file);

		complete();
	});
};
