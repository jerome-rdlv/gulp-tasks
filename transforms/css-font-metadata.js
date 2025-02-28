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
			.process(file.contents, {from: file.path})
			.then(() => complete(null, file))
	}

	function endStream(complete) {
		try {
			this.push(new Vinyl({
				path: output,
				contents: Buffer.from(JSON.stringify(Object.values(fontMetadata.data), null, '\t'), 'utf8')
			}));
			complete();
		} catch (error) {
			complete(error);
		}
	}

	return through.obj(eachFile, endStream, false);
};
