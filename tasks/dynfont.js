const gulp = require('gulp');
const gulpif = require('gulp-if');
const changed = require('gulp-changed');
const fontsubset = require('../transforms/font-subset');
const touch = require('../lib/touch');

module.exports = (paths, subset = exports.SUBSET) => {

	const globs = `${paths.src}/font/*.{woff,woff2}`;

	function main() {

		return gulp.src(globs, {
			allowEmpty: true,
			base: paths.src,
			encoding: false,
		})
			.pipe(changed(paths.dist))
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
