const fs = require('fs');
const through = require('through2');
const URL = require('../lib/url');

/**
 * @deprecated Replace with dom/cachebust
 * @param dist
 * @param cachebustUrl
 * @param getFileSignature
 * @returns {function(): *}
 */
exports.get = function (dist, cachebustUrl, getFileSignature) {
	return function () {
		// noinspection JSCheckFunctionSignatures
		return through.obj(function (file, encoding, complete) {
			const dom = new (require('jsdom').JSDOM)(file.contents.toString(encoding), {
				contentType: 'text/html',
			});

			dom.window.document.querySelectorAll('script[src], link[href], img[src], image, svg[data-src]').forEach(node => {
				let attr;
				switch (node.tagName) {
					case 'script':
					case 'img':
						attr = 'src';
						break;
					case 'svg':
						attr = 'data-src';
						break;
					case 'link':
						attr = 'href';
						break;
					case 'image':
						attr = 'xlink:href';
						break;
				}
				if (attr) {
					const url = node.getAttribute(attr);
					const path = dist + url;
					// handle http://, https:// and // (agnostic scheme)
					if (!URL.absolute(url) && fs.existsSync(path)) {
						node.setAttribute(attr, cachebustUrl(
							url,
							getFileSignature(path)
						));
					}
				}

			});

			file.contents = Buffer.from($.xml(), 'utf8');

			complete(null, file);
		});
	};
};
