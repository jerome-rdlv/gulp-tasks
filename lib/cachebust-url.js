const addUrlParams = require('./add-url-params');

exports.MODE_PATH = 'path';
exports.MODE_QUERY = 'query';

exports.get = function (opts) {
    opts = {
        mode: exports.MODE_PATH,
        ...opts,
    };
    switch (opts.mode) {
        case 'query':
            return function (url, signature) {
                return addUrlParams(url, {t: signature});
            };
        case 'path':
            return function (url, signature) {
                return url.replace(/(\.[^.]+)$/, '.v' + signature + '$1');
            };
    }
};
