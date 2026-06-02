const changed = require('gulp-changed');
const clearSvgParams = require('../transforms/clear-svg-params');
const createSprites = require('../transforms/sprites');
const dom = require('../transforms/dom');
const fs = require('fs');
const globParent = require('glob-parent');
const gulp = require('gulp');
const path = require('path');
const rename = require('gulp-rename');
const svgToScss = require('../transforms/svg-to-scss');
const touch = require('../lib/touch');

module.exports = function (
	{
		paths,
		cachebust,
		globs = [`${paths.src}/svg/**/*.svg`],
		base,
		sprites,
	}
) {

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
			;
	};

	const sprite = function () {
		return gulp.src(Object.values(sprites), {base: paths.src})
			.pipe(clearSvgParams())
			.pipe(svgo())
			.pipe(dom({plugins}))
			.pipe(createSprites(sprites))
			.pipe(touch())
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
			gulp.parallel(main, sprite, scss)
		);
	};

	main.displayName = 'svg';
	sprite.displayName = 'svg:sprite';
	scss.displayName = 'svg:scss';
	watch.displayName = 'svg:watch';

	return {main, sprite, scss, watch};
};
