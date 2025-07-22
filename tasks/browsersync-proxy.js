const browsersync = require('browser-sync');
const cachebustRewrite = require('../lib/cachebust-rewrite');

module.exports = function (paths, target, host, files) {
	const main = function () {
		return new Promise(function (resolve) {
			// noinspection JSUnusedGlobalSymbols
			browsersync.create('bs').init({
				// see https://browsersync.io/docs/options
				proxy: {
					target: target,
					proxyRes: [
						(proxy, req, res) => {
							res.setHeader('X-BrowserSync-Proxy', target);
						},
					]
				},
				files: files || [
					`${paths.dist}/**/*.{js,woff2}`,
					`${paths.dist}/css/{main,main.desktop,main.mobile,main.print}.css`,
				],
				ghostMode: false,
				open: false,
				ui: false,
				host: host,
				https: {
					key: process.env.DEV_KEY,
					cert: process.env.DEV_CERT,
				},
				middleware: [
					cachebustRewrite,
				],
			}, resolve);
		});
	}
	main.displayName = 'browsersync';
	return main;
}
