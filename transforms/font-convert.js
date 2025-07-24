const fontverter = require('fontverter');
const through = require('through2');

module.exports = function () {

	function convert(transform, file, format) {
		console.log(`convert ${file.relative} to ${format}`);
		return fontverter.convert(file.contents, format).then(buffer => {
			file.extname = `.${format}`;
			file.contents = buffer;
			transform.push(file);
		});
	}

	return through.obj(function (file, encoding, complete) {

		if (/\.woff2?$/.test(file.extname)) {
			return complete(null, file);
		}

		const targets = ['woff', 'woff2'];

		Promise.all(targets.map(format => {
			return convert(this, file.clone(), format);
		})).then(() => complete());
	});
};
