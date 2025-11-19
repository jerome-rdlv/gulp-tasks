const changed = require('gulp-changed');
const fontconvert = require('../transforms/font-convert');
const fontsubset = require('../transforms/font-subset');
const fs = require('node:fs/promises');
const gulp = require('gulp');
const touch = require('../lib/touch');
const mapping = require('../lib/fonts-mapping')

module.exports = function (
	{
		paths,
		globs = `${paths.src}/font/*.{otf,ttf,woff,woff2}`,
		// subsets = fontsubset.SUBSETS,
		subsets = fontsubset.SUBSETS,
		fontSubsetFile,
	}
) {
	function main() {
		return gulp.src(globs, {
			allowEmpty: true,
			base: paths.src,
			encoding: false,
			removeBOM: false,
		})
			.pipe(changed(paths.dist, {
				hasChanged: (stream, file) => fs.stat(fontSubsetFile).then(stat => stat.mtime < file.stat.mtime),
			}))
			.pipe(fontsubset.transform(subsets))
			.pipe(fontconvert())
			.pipe(mapping(fontSubsetFile, paths))
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
