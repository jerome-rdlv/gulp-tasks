const gulp = require('gulp');
const changed = require('gulp-changed');
const postcss = require('gulp-postcss');
const renameScssToCss = require('../../../lib/scss-to-css');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const touch = require('../../../lib/touch');

module.exports = function (paths, cachebust) {
	function main(done) {

		const plugins = [
			require('postcss-pxtorem')(require('../../../defaults/pxtorem')),
			require('postcss-preset-env'),
			require('../../../postcss/font-fallback')({
				'droid': ['Georgia', 'Times New Roman', 'Noto Serif'],
				'bitter': 'serif',
			}),
		];

		if (process.env.NODE_ENV === 'production') {
			// noinspection JSCheckFunctionSignatures
			plugins.push(...[
				require('../../../postcss/cachebust')(cachebust),
				require('cssnano'),
			]);
		}

		return gulp.src([`${paths.src}/scss/**/*.scss`, '!**/_*.scss'], {base: paths.src})
			.pipe(changed(paths.dist))
			.pipe(sourcemaps.init())
			.pipe(require('../../../transforms/sass-dart')())
			.pipe(postcss(require('../../../lib/postcss-config')(plugins, renameScssToCss)))
			.on('error', done)
			.pipe(rename(renameScssToCss))
			.pipe(require('../../../lib/css-font-metadata')(`../var/fonts.json`))
			.pipe(require('../../../lib/css-split-print-screen')(file => file.basename === 'main.css'))
			.pipe(require('../../../lib/css-split-fonts')({
				remove: false,
				filter: file => file.basename === 'main.css'
			}))
			.pipe(require('../../../lib/css-split-mobile-desktop')({
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
			`${paths.var}/_svg.scss`,
		], main);
	}

	watch.displayName = 'scss:watch';

	return {main, watch};
}
