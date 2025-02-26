const gulp = require('gulp');
const gulpif = require('gulp-if');
const changed = require('gulp-changed');
const fontsubset = require('../../../transforms/font-subset');
const touch = require('../../../lib/touch');

module.exports = (paths) => {

	const globs = `${paths.src}/font/*.{woff,woff2}`;

	function main() {

		const prod = process.env.NODE_ENV === 'production';

		return gulp.src(globs, {
			allowEmpty: true,
			base: paths.src,
			encoding: false,
		})
			.pipe(gulpif(!prod, changed(paths.dist)))
			.pipe(gulpif(prod, fontsubset(file => {
				try {
					const text = require(`${paths.var}/stats.json`).text;
					return text[file.stem] || text.all;
				} catch (e) {
					return '';
				}
			})))
			.pipe(touch())
			.pipe(gulp.dest(paths.dist))
			;
	}

	function watch() {
		return gulp.watch(globs, main);
	}

	main.displayName = 'font';
	watch.displayName = 'font:watch';

	return {main, watch};
};
