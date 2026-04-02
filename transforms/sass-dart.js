const applySourceMap = require('../lib/apply-sass-sourcemaps');
const PluginError = require('plugin-error');
const sass = require('sass-embedded');
const through = require('through2');
const {NodePackageImporter} = require('sass-embedded');
const Stream = require('stream')

module.exports = function (opts = {
	charset: false,
	sourceMapIncludeSources: true,
	importers: [
		new NodePackageImporter(),
	],
}) {
	var stream = new Stream.Transform({objectMode: true})
	stream._transform = function (file, encoding, cb) {
		sass
			.compileAsync(file.path, {
				...opts,
				sourceMap: !!file.sourceMap,
			})
			.then(result => {
				applySourceMap(file, result.sourceMap);
				file.contents = Buffer.from(result.css);
				cb(null, file);
			})
			.catch(error => {
				cb(new PluginError('sass-dart', `${error.toString()}\nFile: ${error.span.url.href}`, {
					fileName: file.path,
					showProperties: false,
				}));
			});
	};
	return stream;
};
