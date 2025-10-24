const gulp = require('gulp');
const postcss = require('gulp-tasks/lib/stream-postcss');
const renameScssToCss = require('gulp-tasks/lib/scss-to-css');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const touch = require('gulp-tasks/lib/touch');
const exec = require('gulp-exec');

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
		fonts,
		aliases = {},
		filter = file => file.basename === 'main.css',
		plugins = [
			require('postcss-pxtorem')(require('gulp-tasks/defaults/pxtorem')),
			require('postcss-preset-env'),
			require('gulp-tasks/postcss/font-fallback')(fonts),
		],
		production_plugins = [
			require('gulp-tasks/postcss/cachebust')(cachebust),
			require('cssnano'),
		],
		postprod = function (workflow) {
			return workflow
				.pipe(require('gulp-tasks/transforms/css-font-metadata')({output: fontsDataFile, filter, aliases}))
				.pipe(require('gulp-tasks/transforms/css-split-fonts')({filter}))
				.pipe(require('gulp-tasks/transforms/css-split-print-screen')({filter}))
				.pipe(require('gulp-tasks/transforms/css-split-mobile-desktop')({filter}));
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
			.pipe(require('gulp-tasks/transforms/sass-dart')())
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
