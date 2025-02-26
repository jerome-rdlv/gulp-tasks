const addUrlParams = require('./add-url-params');

module.exports = function (mode = exports.MODE_PATH) {
	switch (mode) {
		case 'query':
			return function (url, signature) {
				return signature ? addUrlParams(url, {t: signature}) : url;
			};
		case 'path':
			return function (url, signature) {
				return signature ? url.replace(/(\.[^.]+)$/, '.v' + signature + '$1') : url;
			};
	}
};

exports.MODE_PATH = 'path';
exports.MODE_QUERY = 'query';
