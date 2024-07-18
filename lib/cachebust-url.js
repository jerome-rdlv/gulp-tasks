const addUrlParams = require('./add-url-params');

const defaults = exports.config = {
    mode: 'path',
};

exports.get = function (config) {
    config = {...defaults, ...config};
    switch (config.mode) {
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
