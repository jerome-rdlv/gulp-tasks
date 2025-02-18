const through = require('through2');

module.exports = function () {
	// noinspection JSCheckFunctionSignatures
	return through.obj(function (file, encoding, complete) {
		complete(null, file);
	});
};
