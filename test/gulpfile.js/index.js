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

const cachebustUrl = require('../../lib/cachebust-url')();
const getFileSignature = require('../../lib/get-file-signature')();


const browsersync = require('./tasks/browsersync-serve')(paths, argv['host']);
const clean = require('./tasks/clean')(paths);
const copy = require('./tasks/copy')(paths);
const criticalLocal = require('./tasks/critical-local')(paths);
const criticalRemote = require('./tasks/critical-remote')(paths);
const font = require('./tasks/font')(paths);
const img = require('./tasks/img')(paths);
const js = require('./tasks/js')(paths);
const jsil = require('./tasks/jsil')(paths);
const scss = require('./tasks/scss')(paths, cachebustUrl, getFileSignature);
const svg = require('./tasks/svg')(paths);
const stat = require('./tasks/stats')(paths);

const main = series(
	parallel(copy.main, svg.main, img.main, stat),
	parallel(svg.symbol, svg.scss, font.main),
	parallel(jsil.main, js.main, scss.main)
);
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
	svg.symbol,
	main,
	watch,
];
