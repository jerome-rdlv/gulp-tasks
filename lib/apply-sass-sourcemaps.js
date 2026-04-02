const applySourceMap = require('vinyl-sourcemaps-apply');
const path = require('path');

module.exports = function (file, sourcemap) {
	if (!sourcemap) {
		return;
	}
	// fix sourceMaps
	const map = {...sourcemap};
	map.file = file.relative;
	map.sources = [].map.call(map.sources, function (source) {
		// make source relative to file and fix path prefix
		source = path.relative(path.dirname(file.path), decodeURI(source.replace(/^file:\/\//, '')));
		return source;
	});
	applySourceMap(file, map);
}
