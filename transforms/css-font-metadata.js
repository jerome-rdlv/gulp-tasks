const fs = require('node:fs/promises');
const path = require('path');
const postcss = require('../lib/stream-postcss');
const through = require('through2');
const Vinyl = require('vinyl');

module.exports = function ({output, aliases = {}, filter}) {

	const fontMetadata = require('../postcss/font-metadata')(aliases);

	function endStream(complete) {
		try {
			const data = Object.values(fontMetadata.data);
			fs.writeFile(output, Buffer.from(JSON.stringify(data, null, '\t'), 'utf8'))
				.then(complete);

		} catch (error) {
			complete(error);
		}
	}

	return through.obj(postcss([fontMetadata])._transform, endStream, false);
};
