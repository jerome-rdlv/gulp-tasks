const fs = require('node:fs/promises');
const postcss = require('../lib/stream-postcss');
const {objectTransform: transform} = require('through2');

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

	return transform(postcss([fontMetadata])._transform, endStream, false);
};
