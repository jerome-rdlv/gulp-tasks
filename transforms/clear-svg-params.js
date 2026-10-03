const {objectTransform: transform} = require('through2');

module.exports = function () {
	return transform(function (file, encoding, complete) {
		const contents = file.contents.toString(encoding)
			.replace(/{\$.*?:(.*?)}/g, function () {
				return arguments[1];
			});
		file.contents = Buffer.from(contents);
		complete(null, file);
	});
};
