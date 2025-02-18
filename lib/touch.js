'use strict';

const through = require('through2');

// https://stackoverflow.com/a/52303073/3067023

// noinspection JSCheckFunctionSignatures
module.exports = () => through.obj(function (file, encoding, complete) {
	if (file.stat) {
		file.stat.atime = file.stat.mtime = file.stat.ctime = new Date();
	}
	complete(null, file);
});
