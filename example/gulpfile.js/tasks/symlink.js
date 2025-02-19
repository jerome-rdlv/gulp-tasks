const vfs = require('vinyl-fs');

module.exports = function (paths) {

	const globs = [];

	function main() {
		return vfs.src(globs).pipe(vfs.symlink(paths.dist));
	}

	main.displayName = 'symlink';

	return main;
};
