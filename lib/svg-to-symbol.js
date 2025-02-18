const path = require('path');
const through = require('through2');

module.exports = function () {
	return function () {
		// noinspection JSCheckFunctionSignatures
		return through.obj(function (file, encoding, complete) {
			const svg = new (require('jsdom').JSDOM)(file.contents.toString(encoding), {
				contentType: 'image/svg+xml',
			}).window.document.querySelector('svg');

			const dom = new (require('jsdom').JSDOM)('<symbol></symbol>', {contentType: 'image/svg+xml'})
			const symbol = dom.window.document.querySelector('symbol');

			const id = path.basename(file.relative, path.extname(file.relative)).replace(/_/, '-');
			symbol.setAttribute('id', `icon-${id}`);

			['viewBox', 'preserveAspectRatio'].forEach(attr => {
				if (svg.hasAttribute(attr)) {
					symbol.setAttribute(attr, svg.getAttribute(attr));
				}
			});

			symbol.append(...svg.childNodes);

			file.contents = Buffer.from(dom.serialize().replace(/{\$main:[^}]+}/, 'currentColor'), 'utf8');

			complete(null, file);
		});
	};
};
