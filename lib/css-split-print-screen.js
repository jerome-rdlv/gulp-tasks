const mediaQuery = require('css-mediaquery');
const Stream = require('stream');
const subset = require('./postcss-subset');

function postcssExtractPrint() {
    return {
        postcssPlugin: 'subset-print',
        Once: function (root) {
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
}

function postcssDropPrint() {
    return {
        postcssPlugin: 'drop-print',
        Once: function (root) {
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
}

module.exports = function ({filter}) {
    return function () {
        var stream = new Stream.Transform({objectMode: true});
        stream._transform = function (file, encoding, complete) {
            if (file.isNull()) {
                return complete();
            }

            if (file.isStream()) {
                return complete('Streams are not supported!', file);
            }

            if (filter && !filter.test(file.path)) {
                return complete(null, file);
            }

            Promise.all([
                subset(this, file, [postcssExtractPrint()], 'print'),
                subset(this, file, [postcssDropPrint()]),
            ]).then(() => complete());
        };

        return stream;
    };
};
