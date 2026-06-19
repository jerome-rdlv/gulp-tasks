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
		scssOutput = '_svg.scss',
	}
) {

	base = base || path.relative(paths.src, globParent(globs[0]));

	const tasks = {};
	const watched = [...globs, `${paths.src}/svg.scss.mustache`];

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

	tasks.main = function () {
		return gulp.src(globs, {base: paths.src})
			.pipe(changed(paths.dist))
			.pipe(clearSvgParams())
			.pipe(svgo())
			.pipe(dom({plugins}))
			.pipe(touch())
			.pipe(gulp.dest(paths.dist))
			;
	};
	tasks.main.displayName = 'svg';

	if (sprites) {
		const spriteGlobs = Object.values(sprites).flat();
		watched.push(...spriteGlobs);
		tasks.sprite = function () {
			return gulp.src(spriteGlobs, {base: paths.src, allowEmpty: true})
				.pipe(clearSvgParams())
				.pipe(svgo())
				.pipe(dom({plugins}))
				.pipe(createSprites(sprites))
				.pipe(touch())
				.pipe(gulp.dest(paths.dist))
				;
		};
		tasks.sprite.displayName = 'svg:sprite';
	}

	// svg availability in SCSS
	tasks.scss = function () {
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
				output: scssOutput
			}))
			.pipe(touch())
			.pipe(gulp.dest(paths.var))
			;
	};
	tasks.scss.displayName = 'svg:scss';

	const subs = Object.values(tasks);
	tasks.watch = function () {
		return gulp.watch(
			watched,
			gulp.parallel(...subs)
		);
	};

	tasks.watch.displayName = 'svg:watch';

	return tasks;
};
