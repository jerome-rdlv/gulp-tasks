const mediaQuery = require('css-mediaquery');
const postcss = require('postcss');
const Stream = require('stream');

const postcssExtractPrint = function (opts = {}) {
    return {
        postcssPlugin: 'extract-print',
        Once: function (root, {result}) {
            root.walkAtRules('media', function (rule) {
                const mqs = mediaQuery.parse(rule.params);

                // check if atrule targets print media
                let isPrint = false;
                for (let i = 0; i < mqs.length; ++i) {
                    if (mqs[i].type === 'print' || mqs[i].type === 'all') {
                        isPrint = true;
                        break;
                    }
                }
                if (!isPrint) {
                    rule.remove();
                }

                // check if atrule targets print only
                if (mqs.length !== 1 || mqs[0].type !== 'print') {
                    return;
                }

                // @media print rule, move nodes to root
                while (rule.nodes.length > 0) {
                    rule.parent.insertBefore(rule, rule.nodes[0]);
                }
                rule.remove();
            });
        }
    };
};

const postcssDropPrint = function (opts = {}) {
    return {
        postcssPlugin: 'drop-print',
        Once: function (root, {result}) {
            // drop all @media print rules
            root.walkAtRules('media', function (rule) {
                var mqs = mediaQuery.parse(rule.params);

                // check if atrule targets print media only
                let isPrintOnly = true;
                for (let i = 0; i < mqs.length; ++i) {
                    if (mqs[i].type !== 'print') {
                        isPrintOnly = false;
                        break;
                    }
                }
                if (isPrintOnly) {
                    rule.remove();
                    return;
                }

                // check if atrule targets screen only without expressions
                if (mqs.length !== 1 || mqs[0].type !== 'screen' || mqs[0].expressions.length !== 0) {
                    return;
                }

                // @media screen rule, move nodes to root
                while (rule.nodes.length > 0) {
                    rule.parent.insertBefore(rule, rule.nodes[0]);
                }
                rule.remove();
            });
        }
    };
};

module.exports = function ({filter}) {
    return function () {
        var stream = new Stream.Transform({objectMode: true});
        stream._transform = function (file, encoding, complete) {
            const self = this;

            if (file.isNull()) {
                return complete();
            }

            if (file.isStream()) {
                self.push(file);
                return complete('Streams are not supported!');
            }

            if (!filter.test(file.path)) {
                self.push(file);
                return complete();
            }

            var postcssOptions = {
                from: file.path,
                to: file.path.replace(/(\.css)$/, '.print' + '$1'),
                // // Generate a separate source map for gulp-sourcemaps
                map: file.sourceMap ? {annotation: false} : false
            };

            const source = file.contents;

            return Promise.resolve()
                .then(function () {
                    // extract print css from file
                    return postcss([postcssExtractPrint()]).process(source, postcssOptions);
                })
                .then(function (result) {
                    const css = result.css;

                    if (!css.length) {
                        // nothing to do
                        return;
                    }

                    // save print css to new file
                    let printCss = file.clone({deeply: false});
                    printCss.path = file.path.replace(/(\.css)$/, '.print' + '$1');
                    printCss.contents = Buffer.from(css, 'utf8');
                    self.push(printCss);
                })
                .then(function () {
                    // drop print css from source
                    return postcss([postcssDropPrint()]).process(source, postcssOptions);
                })
                .then(function (result) {
                    file.contents = Buffer.from(result.css, 'utf8');
                    self.push(file);
                    complete();
                });
        };

        return stream;
    };
};
