const gulp = require('gulp');
const touch = require('../lib/touch');
const dom = require('../transforms/dom');

module.exports = function (paths, cachebust) {

	const globs = `${paths.dist}/*.html`;

	const plugins = [
		require('../dom/inline-script'),
		require('../dom/media-script'),
	];

	function main() {
		return gulp.src(globs)
			.pipe(dom({plugins}))
			.pipe(touch())
			.pipe(gulp.dest(paths.dist))
			;
	}

	function watch() {
		return gulp.watch(globs, main);
	}

	main.displayName = 'html';
	watch.displayName = 'html:watch';

	return {main, watch};
}
