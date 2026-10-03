const changed = require('gulp-changed').default;
const gulp = require('gulp');
const touch = require('../lib/touch');

module.exports = function (paths, globs = `${paths.src}/img/**/*.+(gif|jpg|jpeg|png)`) {

	const main = function () {

		return Promise.all([
			import('gulp-imagemin'),
			require('../defaults/imagemin')
		]).then(([imagemin, defaults]) => {
			return gulp.src(globs, {
				base: paths.src,
				encoding: false,
			})
				.pipe(changed(paths.dist))
				.pipe(imagemin.default(defaults, {verbose: false}))
				.pipe(touch())
				.pipe(gulp.dest(paths.dist))
				;
		});
	};

	const watch = function () {
		return gulp.watch(globs, main);
	};

	main.displayName = 'img';
	watch.displayName = 'img:watch';

	return {main, watch}
}
