'use strict';

const {objectTransform: transform} = require('through2');

// https://stackoverflow.com/a/52303073/3067023

module.exports = () => transform(function (file, encoding, complete) {
	if (file.stat) {
		file.stat.atime = file.stat.mtime = file.stat.ctime = new Date();
	}
	complete(null, file);
});
