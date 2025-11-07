const PluginError = require('plugin-error');
const through = require('through2');
const lookup = require('mime-types').lookup;

module.exports = function ({plugins = [], options = {}}) {

	// noinspection JSCheckFunctionSignatures
	return through.obj(function (file, encoding, complete) {
		const pending = [...plugins];

		Promise.resolve()
			.then(() => {
				return new (require('jsdom').JSDOM)(file.contents.toString(encoding), {
					contentType: (options.type || lookup(file.extname)) || 'text/html',
				});
			})
			.then(dom => {
				return {
					file: file,
					from: file.relative,
					to: options.to || file.relative,
					dom: dom,
					document: dom.window.document,
				};
			})
			.then(function consume(args) {
				const plugin = pending.pop();
				return plugin ? Promise.resolve(plugin(args)).then(() => consume(args)) : Promise.resolve(args);
			})
			.then(args => {
				file.contents = Buffer.from(args.dom.serialize(), encoding);
				complete(null, file);
			})
			.catch(error => {
				throw new PluginError('dom', error, {fileName: file.path, showStack: true});
			});
	});
};
