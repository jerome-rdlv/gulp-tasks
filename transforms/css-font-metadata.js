const fs = require('node:fs/promises');
const path = require('path');
const postcss = require('postcss');
const through = require('through2');
const Vinyl = require('vinyl');

module.exports = function ({output, aliases = {}, filter}) {

	const fontMetadata = require('../postcss/font-metadata')(aliases);

	function eachFile(file, encoding, complete) {

		if (filter && !filter(file)) {
			return complete(null, file);
		}

		postcss([fontMetadata])
			.process(file.contents, {
				from: file.path,
				to: file.path,
			})
			.then(() => complete(null, file))
	}

	function endStream(complete) {
		try {
			const data = Object.values(fontMetadata.data);

			// make paths relative to output file
			data.forEach(item => {
				item.fonts.forEach(font => {
					font.src = path.relative(
						path.resolve(path.dirname(output)),
						path.resolve(font.src)
					);
				});
			});

			fs.writeFile(output, Buffer.from(JSON.stringify(data, null, '\t'), 'utf8'))
				.then(complete);
		
		} catch (error) {
			complete(error);
		}
	}

	return through.obj(eachFile, endStream, false);
};
