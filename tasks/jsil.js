const gulp = require('gulp');
const eslint = require('gulp-eslint-new');
const gulpif = require('gulp-if');
const terser = require('gulp-terser');
const touch = require('../lib/touch');

module.exports = (paths) => {

	const globs = `${paths.src}/js/inline/*.js`;

	const main = function () {
		return gulp.src(globs, {base: paths.src})
			.pipe(eslint())
			.pipe(gulpif(process.env.NODE_ENV === 'production', terser()))
			.pipe(touch())
			.pipe(gulp.dest(paths.dist))
			;
	};

	const watch = function () {
		return gulp.watch(globs, main);
	};

	main.displayName = 'jsil';
	watch.displayName = 'jsil:watch';

	return {main, watch};
};
