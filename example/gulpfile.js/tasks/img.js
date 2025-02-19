const changed = require('gulp-changed');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const touch = require('../../../lib/touch');

module.exports = function (paths) {

	const globs = `${paths.src}/img/**/*.+(gif|jpg|jpeg|png)`;

	const main = function () {

		return gulp.src(globs, {
			base: paths.src,
			encoding: false,
		})
			.pipe(changed(paths.dist))
			.pipe(imagemin(require('../../../defaults/imagemin'), {verbose: false}))
			.pipe(touch())
			.pipe(gulp.dest(paths.dist))
			;
	};

	const watch = function () {
		return gulp.watch(globs, main);
	};

	main.displayName = 'img';
	watch.displayName = 'img:watch';

	return {main, watch}
}
