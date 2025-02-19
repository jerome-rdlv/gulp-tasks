const changed = require('gulp-changed');
const cleanSvg = require('../../../lib/clean-svg');
const clearSvgParams = require('../../../lib/clear-svg-params');
const cacheBustSvgRefs = require('../../../lib/cachebust-svg-refs');
const crypto = require('crypto');
const fs = require('fs');
const gulp = require('gulp');
const path = require('path');
const PluginError = require('plugin-error');
const rename = require('gulp-rename');
const svgo = require('../../../lib/svgo');
const svgToScss = require('../../../lib/svg-to-scss');
const svgToSymbol = require('../../../lib/svg-to-symbol');
const touch = require('../../../lib/touch');

function getFileSvgminConfig(file) {
	const dom = new (require('jsdom').JSDOM)(file.contents.toString(), {
		contentType: 'image/svg+xml',
	});
	const opts = dom.window.document.getElementById('svgo-options')?.innerHTML.trim();
	return opts ? JSON.parse(opts) : [];
}

function svgoConfigCallback(file) {
	const prefix = 'i' + crypto.createHash('sha1')
		.update(path.basename(file.relative, path.extname(file.relative)))
		.digest('hex')
		.substring(0, 4);

	/*
	Configuration can be disabled in svg files
	with following script:
	
		<script type="application/json" id="svgo-options">
			[
			"removeHiddenElems",
			"convertPathData",
			]
		</script>
	 */
	const defaults = {...require('../../../defaults/svgo')};
	const disabled = getFileSvgminConfig(file);

	defaults.path = file.path;
	defaults.plugins = defaults.plugins.filter(plugin => {
		return disabled.indexOf(plugin.name) === -1;
	});

	return defaults;
}

module.exports = function (paths, cachebust) {

	const globs = [`${paths.src}/svg/**/*.svg`];

	const main = function () {

		return gulp.src(globs, {base: `${paths.src}/svg`})
			.pipe(cacheBustSvgRefs(paths.dist, cachebust))
			.pipe(svgo(svgoConfigCallback))
			.pipe(cleanSvg())
			.pipe(svgToScss(`${paths.src}/svg.scss.mustache`, `../../var/_svg.scss`))
			.pipe(clearSvgParams())
			.pipe(svgToSymbol())
			.pipe(touch())
			.pipe(gulp.dest(`${paths.dist}/svg`))
			;
	};

	main.displayName = 'svg';

	// svg availability for inclusion as inline symbol in html
	// const symbol = function () {
	// 	return gulp.src(paths.var + '/svg/**/*.svg', {base: paths.var})
	// 		.pipe(changed(paths.dist, {extension: '.symbol.svg'}))
	// 		.pipe(svgToSymbol())
	// 		.pipe(clearSvgParams())
	// 		.pipe(rename(function (path) {
	// 			path.extname = '.symbol.svg';
	// 		}))
	// 		.pipe(touch())
	// 		.pipe(gulp.dest(paths.dist))
	// 		;
	// };
	//
	// symbol.displayName = 'svg:symbol';

	const watch = function () {
		return gulp.watch(
			globs.concat([`${paths.src}/svg.scss.mustache`]),
			main
		);
	};

	watch.displayName = 'svg:watch';

	return {main, watch};
};
