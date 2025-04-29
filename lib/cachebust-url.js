const addUrlParams = require('./add-url-params');

module.exports = function (mode = exports.MODE_PATH) {
	switch (mode) {
		case 'query':
			return {
				add: function (url, signature) {
					return signature ? addUrlParams(url, {t: signature}) : url;
				},
				remove: function (url) {
					return url.replace(url, {t: null});
				},
			};
		case 'path':
			return {
				add: function (url, signature) {
					return signature ? url.replace(/(\.[^.]+)$/, `.v${signature}$1`) : url;
				},
				remove: function (url) {
					return url.replace(/\.v[0-9a-z]+(\.[0-9a-z]+)$/, '$1');
				}
			};
	}
};

exports.MODE_PATH = 'path';
exports.MODE_QUERY = 'query';
