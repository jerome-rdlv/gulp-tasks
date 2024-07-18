const browserSync = require('browser-sync');
let count = 0;

/**
 * @see https://browsersync.io/docs/options#option-watchOptions
 */
module.exports = function (config) {
    function browsersync() {
        return new Promise(function (resolve) {
            browserSync.create('bs-' + (++count)).init({
                    ...{
                        files: null, // to override
                        open: false,
                        proxy: null, // to override
                        ui: false,
                    },
                    ...config
                },
                resolve
            );
        });
    }

    browsersync.displayName = 'browsersync';
    return browsersync;
};
