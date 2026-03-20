const changed = require('gulp-changed');
const clearSvgParams = require('../transforms/clear-svg-params');
const dom = require('../transforms/dom');
const fs = require('fs');
const globParent = require('glob-parent');
const gulp = require('gulp');
const path = require('path');
const rename = require('gulp-rename');
const svgToScss = require('../transforms/svg-to-scss');
const touch = require('../lib/touch');

module.exports = function (paths, cachebust, globs = [`${paths.src}/svg/**/*.svg`], base) {

	base = base || path.relative(paths.src, globParent(globs[0]));

	const plugins = [
		require('../dom/svgo-disabled'),
	];

	if (process.env.NODE_ENV === 'production') {
		plugins.push(require('../dom/cachebust')(cachebust, {
			'image[href]': 'href',
			'img[src]': 'src',
		}));
	}

	const svgo = () => require('../transforms/svgo')(require('../lib/svgo-config')(require('../defaults/svgo')));

	const main = function () {
		return gulp.src(globs, {base: paths.src})
			.pipe(changed(paths.dist))
			.pipe(clearSvgParams())
			.pipe(svgo())
			.pipe(dom({plugins}))
			.pipe(touch())
			.pipe(gulp.dest(paths.dist))
			// svg availability for inclusion as inline symbol in html
			.pipe(dom({plugins: [require('../dom/svg-to-symbol')(base)]}))
			.pipe(rename(path => path.extname = '.symbol.svg'))
			.pipe(gulp.dest(paths.dist))
			;
	};

	// svg availability in SCSS
	const scss = function () {

		// look for template
		let template = paths.src + '/svg.scss.mustache';
		if (!fs.existsSync(template)) {
			template = __dirname + '/../svg.scss.mustache';
		}

		return gulp.src(globs, {base: paths.src + (base ? `/${base}` : '')})
			.pipe(svgo())
			.pipe(dom({plugins}))
			.pipe(svgToScss({
				template: template,
				output: '_svg.scss'
			}))
			.pipe(touch())
			.pipe(gulp.dest(paths.var))
			;
	};

	const watch = function () {
		return gulp.watch(
			[...globs, `${paths.src}/svg.scss.mustache`],
			gulp.parallel(main, scss)
		);
	};

	main.displayName = 'svg';
	scss.displayName = 'svg:scss';
	watch.displayName = 'svg:watch';

	return {main, scss, watch};
};
