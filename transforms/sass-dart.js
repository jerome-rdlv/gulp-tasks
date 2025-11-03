const applySourceMap = require('vinyl-sourcemaps-apply');
const path = require('path');
const PluginError = require('plugin-error');
const through = require('through2');
const exec = require('child_process').exec;
const convertSourceMap = require('convert-source-map');

function fixSourceMaps() {
	return through.obj(function (file, encoding, complete) {
		complete(null, file);
	});
}

module.exports = function (opts) {
	const args = Object.entries({
		// silenceDeprecation: ['mixed-decls'],
		...opts,
	}).map(([arg, value]) => {
		return `--${arg.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}=${value instanceof Array ? value.join(',') : value}`;
	}).join(' ');

	return through.obj(function (file, enc, cb) {
		const cmd = `sass --embed-source-map --embed-sources ${args} "${file.path}"`;
		exec(cmd, (err, stdout, stderr) => {
			if (err) {
				throw new PluginError('sass', err);
			}

			if (file.sourceMap) {
				// fix sourceMaps
				const map = convertSourceMap.fromSource(
					// convertSourceMap.fromSource does not support commas inside comment
					stdout.toString()
						.replace(/,/g, '%2C')
						.replace(/(sourceMappingURL=data:application\/json)(;charset=utf-8)?%2C/, '$1$2,')
				)?.toObject();
				map.file = file.relative;
				map.sources = [].map.call(map.sources, function (source) {
					// make source relative to file and fix path prefix
					source = path.relative(path.dirname(file.path), source.replace(/^file:\/\//, ''));
					return source;
				});
				applySourceMap(file, map);

				stdout = convertSourceMap.removeComments(stdout);
			}

			file.contents = Buffer.from(stdout);

			cb(null, file);
		});
	});
};
