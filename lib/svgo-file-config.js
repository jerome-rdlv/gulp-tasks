/**
 * @param file
 * @returns {[]}
 */
module.exports = function (file) {
	try {
		// maybe loaded already, possibly by a previous dom transform
		if (file.svgo === undefined) {
			const dom = new (require('jsdom').JSDOM)(file.contents.toString(), {
				contentType: 'image/svg+xml',
			});

			require('../dom/svgo-disabled')({
				file: file,
				document: dom.window.document,
			});
		}
		return file.svgo || [];
	} catch (error) {
		console.error(error);
		return [];
	}
};
