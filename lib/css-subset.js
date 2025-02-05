const applySourceMap = require('vinyl-sourcemaps-apply');
const postcss = require('postcss');
const path = require('path');
const PluginError = require('plugin-error');

/**
 * @param {Transform} transform
 * @param {File} file
 * @param {array} plugins
 * @param {string} [to]
 * @returns {Promise}
 */
module.exports = function (transform, file, plugins, to) {
    return postcss(plugins)
        .process(file.contents, {
            from: file.path,
            to: to || file.path,
            // Generate a separate source map for gulp-sourcemaps
            map: file.sourceMap ? {annotation: false} : false
        })
        .then(result => {
            if (!result.css.length) {
                return;
            }
            const warnings = result.warnings();
            if (warnings.length) {
                console.warn('subset:', file.relative + '\n' + warnings.join('tin'));
            }

            const subset = file.clone({deeply: false});
            subset.path = result.opts.to;
            subset.contents = Buffer.from(result.css, 'utf8');

            // Apply source map to the chain
            if (subset.sourceMap) {
                const map = result.map.toJSON();
                map.file = subset.relative;
                map.sources = [].map.call(map.sources, function (source) {
                    return path.join(path.dirname(subset.relative), source);
                });
                applySourceMap(subset, map);
            }

            transform.push(subset);
        })
        .catch(error => {
            // Taken from gulp-postcss
            var errorOptions = {fileName: file.path, showStack: true};
            if (error.name === 'CssSyntaxError') {
                errorOptions.error = error;
                errorOptions.fileName = error.file || file.path;
                errorOptions.lineNumber = error.line;
                errorOptions.showProperties = false;
                errorOptions.showStack = false;
                error = error.message + '\n\n' + error.showSourceCode() + '\n';
            }
            // Prevent stream’s unhandled exception from
            // being suppressed by Promise
            setImmediate(function () {
                throw new PluginError('css-targeted-subset', error, errorOptions);
            });
        });
}
