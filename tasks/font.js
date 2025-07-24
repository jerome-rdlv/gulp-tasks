const changed = require('gulp-changed');
const fontconvert = require('../transforms/font-convert');
const fontsubset = require('../transforms/font-subset');
const gulp = require('gulp');
const touch = require('../lib/touch');

module.exports = (paths, stats) => {

	const globs = `${paths.src}/font/*.{woff,woff2}`;

	stats = stats || `${paths.var}/stats.json`;

	function getsubset(file) {
		try {
			const text = require(stats).text;
			return text[file.stem] || text.all;
		} catch (e) {
			return '';
		}
	}

	function main() {

		const prod = process.env.NODE_ENV === 'production';

		return gulp.src(globs, {
			allowEmpty: true,
			base: paths.src,
			encoding: false,
			removeBOM: false,
		})
			.pipe(changed(paths.dist, {extension: '.woff2'}))
			.pipe(fontconvert())
			.pipe(fontsubset(getsubset))
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
