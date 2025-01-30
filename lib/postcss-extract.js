const postcss = require('postcss');
const path = require('path');
const PluginError = require('plugin-error');

module.exports = function (file, plugins, suffix) {
    return postcss(plugins)
        .process(file.contents, {
            file: file,
            from: file.path,
            to: suffix
                ? file.path.replace(/(\.[^.]+)$/, `.${suffix}$1`)
                : file.path,
            // Generate a separate source map for gulp-sourcemaps
            map: file.sourceMap ? {annotation: false} : false
        })
        .then(result => {
            if (!result.css.length) {
                return;
            }
            let file = result.opts.file.clone({deeply: false});
            file.path = result.opts.to;
            file.contents = Buffer.from(result.css, 'utf8');

            // Apply source map to the chain
            if (file.sourceMap) {
                map = result.map.toJSON();
                map.file = file.relative;
                map.sources = Array.prototype.map.call(map.sources, function (source) {
                    return path.join(path.dirname(file.relative), source);
                });
                applySourceMap(file, map);
            }

            return file;
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
