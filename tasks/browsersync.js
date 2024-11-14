const browserSync = require('browser-sync');
let count = 0;

/**
 * @see https://browsersync.io/docs/options#option-watchOptions
 */
module.exports = function (config) {
    function browsersync() {
        return new Promise(function (resolve) {
            config = {
                ...{
                    files: null, // to override
                    open: false,
                    proxy: null, // to override
                    ui: false,
                },
                ...config
            };
            if (typeof config.proxy === 'string') {
                const target = config.proxy;
                config.proxy = {
                    target: target,
                    proxyRes: [
                        (proxy, req, res) => {
                            res.setHeader('X-BrowserSync-Proxy', target);
                        }
                    ]
                };
            }
            browserSync.create('bs-' + (++count)).init(config, resolve);
        });
    }

    browsersync.displayName = 'browsersync';
    return browsersync;
};
