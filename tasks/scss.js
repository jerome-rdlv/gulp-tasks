const gulp = require('gulp');
const changed = require('gulp-changed');
const postcss = require('gulp-postcss');
const renameScssToCss = require('../lib/scss-to-css');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const touch = require('../lib/touch');

module.exports = function (paths, cachebust, fonts) {
	function main(done) {

		const plugins = [
			require('postcss-pxtorem')(require('../defaults/pxtorem')),
			require('postcss-preset-env'),
			require('../postcss/font-fallback')(fonts, path => /main\.css$/.test(path)),
		];

		if (process.env.NODE_ENV === 'production') {
			// noinspection JSCheckFunctionSignatures
			plugins.push(...[
				require('../postcss/cachebust')(cachebust),
				require('cssnano'),
			]);
		}

		return gulp.src([`${paths.src}/scss/**/*.scss`, '!**/_*.scss'], {base: paths.src})
			.pipe(sourcemaps.init())
			.pipe(require('../transforms/sass-dart')())
			.pipe(postcss(require('../lib/transform-config')(plugins, renameScssToCss)))
			.on('error', done)
			.pipe(rename(renameScssToCss))
			.pipe(require('../transforms/css-font-metadata')({
				output: `fonts.json`,
				filter: file => file.basename === 'main.css'
			}))
			.pipe(require('../transforms/css-split-print-screen')(file => file.basename === 'main.css'))
			.pipe(require('../transforms/css-split-fonts')({
				remove: false,
				filter: file => file.basename === 'main.css'
			}))
			.pipe(require('../transforms/css-split-mobile-desktop')({
				// Lighthouse Moto G Power test device screen is 412px wide (26em × 16px)
				breakpoint: 26,
				filter: file => file.basename === 'main.css',
			}))
			.pipe(sourcemaps.write('.'))
			.pipe(touch())
			.pipe(gulp.dest(paths.dist))
			;
	}

	main.displayName = 'scss';

	function watch() {
		return gulp.watch([
			`${paths.src}/scss/**/*.scss`,
			`${paths.src}/../blocks/**/*.scss`,
			`${paths.src}/../class/Block/_blocks.scss`,
			`${paths.src}/../class/Block/**/*.scss`,
			`${paths.var}/_svg.scss`,
		], main);
	}

	watch.displayName = 'scss:watch';

	return {main, watch};
}
