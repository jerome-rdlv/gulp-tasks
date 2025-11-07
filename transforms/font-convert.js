const fontverter = require('fontverter');
const through = require('through2');

module.exports = function (formats = {woff2: 'woff2', woff: 'woff'}) {

	function convert(file, format, extname) {
		console.log(`convert ${file.relative} to ${format}`);
		return fontverter.convert(file.contents, format).then(buffer => {
			file.extname = `.${extname}`;
			file.contents = buffer;
			file.format = format;
			return file;
		});
	}

	return through.obj(function (file, encoding, complete) {
		Promise.all(Object.entries(formats).map(([extname, format]) => {
			return file.extname.substr(1) !== extname
				? convert(file.clone(), format, extname)
				: null;
		})).then((files) => {
			// important: push files here to maintain formats order
			files.forEach(file => this.push(file));
			complete();
		});
	});
};
