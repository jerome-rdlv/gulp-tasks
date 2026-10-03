const changed = require('gulp-changed').default;
const gulp = require('gulp');
const touch = require('../lib/touch');

module.exports = function (paths, globs = `${paths.src}/img/**/*.+(gif|jpg|jpeg|png)`) {

	const main = async function () {
		const imagemin = await import('gulp-imagemin');
		const defaults = await require('../defaults/imagemin');
		return new Promise((resolve, reject) => {
			gulp.src(globs, {
				base: paths.src,
				encoding: false,
			})
				.pipe(changed(paths.dist))
				.pipe(imagemin.default(defaults, {verbose: false}))
				.pipe(touch())
				.pipe(gulp.dest(paths.dist))
				.on('end', resolve)
				.on('error', reject);
		});
	};

	const watch = function () {
		return gulp.watch(globs, main);
	};

	main.displayName = 'img';
	watch.displayName = 'img:watch';

	return {main, watch}
}
