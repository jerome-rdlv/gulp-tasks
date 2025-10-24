const changed = require('gulp-changed');
const fontconvert = require('../transforms/font-convert');
const fontsubset = require('../transforms/font-subset');
const gulp = require('gulp');
const touch = require('../lib/touch');

module.exports = function (
	{
		paths,
		globs = `${paths.src}/font/*.{ttf,woff,woff2}`,
		subset = exports.SUBSET
	}
) {
	function main() {

		return gulp.src(globs, {
			allowEmpty: true,
			base: paths.src,
			encoding: false,
			removeBOM: false,
		})
			.pipe(changed(paths.dist, {extension: '.woff2'}))
			.pipe(fontconvert())
			.pipe(fontsubset(() => subset))
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

exports.SUBSET = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~¢£¥¨©«®´¸»ÀÂÆÇÈÉÊËÎÏÔÙÛÜàâæçèéêëîïôùûüÿŒœŸˆ˚˜–—‘’‚“”„•…‹›€™';
