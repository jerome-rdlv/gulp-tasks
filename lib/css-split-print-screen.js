const mediaQuery = require('css-mediaquery');
const postcss = require('postcss');
const Stream = require('stream');
const extract = require('gulp-tasks/lib/postcss-extract');

function postcssExtractPrint() {
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

function postcssDropPrint() {
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

            if (filter && !filter.test(file.path)) {
                self.push(file);
                return complete();
            }

            Promise
                .all([
                    extract(file, postcssExtractPrint(), 'print'),
                    extract(file, postcssDropPrint()),
                ])
                .then(files => files.forEach(file => self.push(file)))
                .then(() => complete());

        };

        return stream;
    };
};
