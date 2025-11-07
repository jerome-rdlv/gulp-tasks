const fs = require('node:fs');
const gulp = require('gulp');
const postcss = require('../lib/stream-postcss');
const renameScssToCss = require('../lib/scss-to-css');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const touch = require('../lib/touch');
const exec = require('gulp-exec');
const path = require('path');

module.exports = function (
	{
		paths,
		globs = [
			`${paths.src}/scss/**/*.scss`,
		],
		watched = [
			`${paths.src}/../class/Block/**/*.scss`,
			`${paths.var}/_svg.scss`,
		],
		cachebust,
		fontsDataFile,
		fontSubsetFile,
		fonts,
		aliases = {},
		filter = file => path.basename(file) === 'main.css',
		plugins = [
			require('postcss-pxtorem')(require('../defaults/pxtorem')),
			require('postcss-preset-env'),
			require('../postcss/font-fallback')(fonts, filter, paths.src),
			require('../postcss/font-subset-mapping')(fontSubsetFile),
		],
		production_plugins = [
			require('../postcss/cachebust')(cachebust),
			require('cssnano'),
		],
		postprod = function (workflow) {
			return workflow
				.pipe(require('../transforms/css-font-metadata')({output: fontsDataFile, filter, aliases}))
				.pipe(require('../transforms/css-split-fonts')({filter}))
				.pipe(require('../transforms/css-split-print-screen')({filter}))
				.pipe(require('../transforms/css-split-mobile-desktop')({filter}));
		}
	}
) {

	watched = [...globs, ...watched];
	globs.push('!**/_*.scss');

	if (process.env.NODE_ENV === 'production') {
		// noinspection JSCheckFunctionSignatures
		plugins.push(...production_plugins);
	}

	function main(done) {

		let workflow = gulp.src(globs, {base: paths.src, sourcemaps: true})
			.pipe(require('../transforms/sass-dart')())
			.pipe(exec.reporter({err: true, strerr: true, stdout: false}))
			.pipe(rename(renameScssToCss))
			.pipe(postcss(plugins))
			.on('error', done);

		if (typeof postprod === 'function') {
			workflow = postprod.call(null, workflow);
		}

		workflow = workflow
			.pipe(touch())
			.pipe(gulp.dest(paths.dist, {sourcemaps: '.'}));

		return workflow;
	}

	main.displayName = 'scss';

	function watch() {
		return gulp.watch(watched, main);
	}

	watch.displayName = 'scss:watch';

	return {main, watch};
}
