const browsersync = require('browser-sync');
const cachebustRewrite = require('../../../lib/cachebust-rewrite');

module.exports = function (paths, host = null) {
	const main = function () {
		return new Promise(function (resolve) {
			// noinspection JSUnusedGlobalSymbols
			browsersync.create('bs').init({
				// see https://browsersync.io/docs/options
				server: paths.dist,
				watch: true,
				open: false,
				ghostMode: false,
				ui: false,
				host: host,
				https: {
					key: process.env.DEV_KEY,
					cert: process.env.DEV_CERT,
				},
				middleware: [
					cachebustRewrite,
					(req, res, next) => {
						res.setHeader('X-BrowserSync-Proxy', 'gulp-tasks');
						return next();
					}
				],
			}, resolve);
		});
	}
	main.displayName = 'browsersync';
	return main;
};
