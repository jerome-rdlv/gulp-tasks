const gulp = require('gulp');
const changed = require('gulp-changed');
const touch = require('../../../lib/touch');

module.exports = (paths) => {

	const globs = [
		`${paths.src}/*.html`,
	];

	function main() {

		return gulp.src(globs, {
			allowEmpty: true,
			base: paths.src,
			encoding: false,
		})
			.pipe(changed(paths.dist))
			.pipe(touch())
			.pipe(gulp.dest(paths.dist))
			;
	}

	function watch() {
		return gulp.watch(globs, main);
	}

	main.displayName = 'copy';
	watch.displayName = 'copy:watch';

	return {main, watch};
}
