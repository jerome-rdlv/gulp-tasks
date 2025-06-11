/**
 * Some options can be overridden by CLI arguments:
 *  - --url=http://example.org
 */
const {series, parallel} = require('gulp');
const yargs = require('yargs');
const {hideBin} = require('yargs/helpers');
const path = require('path');

process.chdir(path.dirname(__dirname));

const argv = yargs(hideBin(process.argv)).parse();

const paths = {
	src: path.resolve(`${__dirname}/../src`),
	dist: path.resolve(`${__dirname}/../dist`),
	var: path.resolve(`${__dirname}/../var`),
};

const cachebust = ((cachebustUrl, getFileSignature) => {
	return (url, path) => cachebustUrl.add(url, getFileSignature(path));
})(
	require('../../lib/cachebust-url')(),
	require('../../lib/get-file-signature')()
);


const browsersync = require('../../tasks/browsersync-serve')(paths, argv['host']);
const clean = require('../../tasks/clean')(paths);
const copy = require('../../tasks/copy')(paths);
const criticalLocal = require('../../tasks/critical-local')(paths);
const criticalRemote = require('../../tasks/critical-remote')(paths);
const font = require('../../tasks/font')(paths);
const img = require('../../tasks/img')(paths);
const js = require('../../tasks/js')(paths);
const jsil = require('../../tasks/jsil')(paths);
const scss = require('../../tasks/scss')(paths, cachebust);
const svg = require('../../tasks/svg')(paths, cachebust);
const html = require('../../tasks/html')(paths, cachebust);

const tasks = [
	parallel(img.main, copy.main),
	parallel(svg.main, svg.scss),
	parallel(jsil.main, js.main, scss.main), // eleventy
];

if (process.env.NODE_ENV === 'production') {
	const stat = require('../../tasks/stats')(paths);
	const optimize = series(
		stat,
		font.main,
		// css cachebust refs
		// cachebust
		// html cachebust refs
	);
	optimize.displayName = 'optimize';
	tasks.push(optimize);
}

const main = series(...tasks);
main.displayName = 'default';

const watch = parallel(copy.watch, svg.watch, jsil.watch, js.watch, scss.watch, font.watch);
watch.displayName = 'default:watch';

module.exports = [
	browsersync,
	clean,
	criticalLocal,
	criticalRemote,
	copy.main,
	copy.watch,
	font.main,
	font.watch,
	html.main,
	html.watch,
	img.main,
	img.watch,
	js.main,
	js.watch,
	jsil.main,
	jsil.watch,
	scss.main,
	scss.watch,
	svg.main,
	svg.watch,
	svg.scss,
	main,
	watch,
];
