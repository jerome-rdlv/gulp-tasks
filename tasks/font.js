const changed = require('gulp-changed');
const fontconvert = require('../transforms/font-convert');
const fontsubset = require('../transforms/font-subset');
const gulp = require('gulp');
const touch = require('../lib/touch');
const fs = require('node:fs/promises');
const hasChangedFactory = require('../lib/has-changed-factory');

module.exports = function (
	{
		paths,
		globs = `${paths.src}/font/*.{woff,woff2}`,
		statsDataFile = `${paths.var}/stats.json`,
	}
) {

	const includes = [statsDataFile].filter(v => !!v);

	function getsubset(file) {
		try {
			const stats = require(statsDataFile);
			return stats.text[stats.table[file.stem] || file.stem] || stats.text.all;
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
			.pipe(changed(paths.dist, {
				extension: '.woff2',
				hasChanged: hasChangedFactory(includes)
			}))
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
