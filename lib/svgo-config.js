module.exports = function (config) {
	return file => {
		const disabled = require('./svgo-file-config')(file);
		return {
			...config,
			path: file.path,
			plugins: config.plugins.filter(plugin => {
				return disabled.indexOf(plugin.name) === -1;
			})
		};
	};
}
