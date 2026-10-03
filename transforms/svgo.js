const {objectTransform: transform} = require('through2');
const {optimize} = require('svgo');

module.exports = function (configCallback) {
	return transform(function (file, encoding, complete) {
		const contents = file.contents.toString(encoding);
		const output = optimize(contents, configCallback(file))
		file.contents = Buffer.from(output.data);
		complete(null, file);
	});
};
