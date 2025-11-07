const changed = require('gulp-changed');
const fontconvert = require('../transforms/font-convert');
const fontsubset = require('../transforms/font-subset');
const gulp = require('gulp');
const touch = require('../lib/touch');
const fs = require('node:fs/promises');
const hasChangedFactory = require('../lib/has-changed-factory');
const mapping = require('../lib/fonts-mapping');

module.exports = function (
	{
		paths,
		globs = `${paths.src}/font/*.{woff,woff2}`,
		statsDataFile = `${paths.var}/stats.json`,
		fontSubsetFile,
		formats = {woff2: 'woff2', woff: 'woff'},
	}
) {

	const includes = [statsDataFile].filter(v => !!v);

	function getsubsets(file) {
		try {
			const stats = require(statsDataFile);
			return [{
				name: 'custom',
				text: stats.text[stats.table[file.stem] || file.stem] || stats.text.all
			}];
		} catch (e) {
			return false;
		}
	}

	function main() {

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
			.pipe(fontsubset.transform(getsubsets))
			.pipe(fontconvert(formats))
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
