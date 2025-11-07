const through = require('through2');
const fs = require('node:fs/promises');
const path = require('path');

module.exports = function (output, paths) {

	const map = {};

	function eachFile(file, encoding, complete) {
		complete(null, file);

		const slug = path.relative(path.resolve(paths.src), file.history[0]);

		if (!map[slug]) {
			map[slug] = {};
		}

		if (!map[slug][file.subset.name]) {
			map[slug][file.subset.name] = {
				range: file.subset.range,
				sources: {},
			};
		}

		map[slug][file.subset.name].sources[file.format] = file.relative;
	}

	function endStream(complete) {
		Promise.resolve(
			Object.values(map).length && fs.writeFile(output, Buffer.from(JSON.stringify(map, null, '\t'), 'utf8'))
		).then(complete);
	}

	return through.obj(eachFile, endStream, false);
}
