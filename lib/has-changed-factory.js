const fs = require('node:fs/promises');

function mtime(path) {
	return fs.stat(path).then(stat => stat.mtime).catch(() => null);
}

module.exports = function (includes) {
	includes = Promise.all(includes.map(mtime));
	return function (stream, file, dest) {
		return Promise.all([mtime(dest), includes]).then(([dest, includes]) => {
			if (!dest || dest < file.stat.mtime || includes.filter(source => dest < source).length) {
				// if file mtime or any includes mtime is greater than dest
				stream.push(file);
			}
		});
	};
}
