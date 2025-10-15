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
			.process(file.contents, {from: file.relative})
			.then(() => complete(null, file))
	}

	function endStream(complete) {
		try {
			const data = Object.values(fontMetadata.data);

			// make paths relative to output file
			data.forEach(item => {
				item.fonts.forEach(font => {
					// works only when output is inside dist dir hierarchy
					font.src = path.relative(path.dirname(output), font.src);
				});
			});

			const file = new Vinyl({
				path: output,
				contents: Buffer.from(JSON.stringify(data, null, '\t'), 'utf8')
			});
			this.push(file);
			complete();
		} catch (error) {
			complete(error);
		}
	}

	return through.obj(eachFile, endStream, false);
};
