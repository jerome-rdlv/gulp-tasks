const subset = require('./postcss-subset');
const mediaQuery = require('css-mediaquery');
const Stream = require('stream');

function isDesktopRule(rule, breakpoint) {
    members: for (const member of mediaQuery.parse(rule.params)) {
        for (const expression of member.expressions) {
            if (expression.feature !== 'width') {
                continue;
            }
            if (expression.modifier !== 'min') {
                continue;
            }
            const value = +expression.value.replace(/[^0-9.]/g, '');
            if (value < breakpoint) {
                continue;
            }
            continue members;
        }
        // min-width >= breakpoint not found
        return false;
    }
    return true;
}

function postcssExtractDesktop(breakpoint) {
    // noinspection JSUnusedGlobalSymbols
    return {
        postcssPlugin: 'subset-desktop',
        AtRule(rule) {
            isDesktopRule(rule, breakpoint) || rule.remove();
        },
        Rule(rule) {
            let parent = rule.parent;
            while (parent.type !== 'root') {
                if (isDesktopRule(parent, breakpoint)) {
                    return;
                }
                parent = parent.parent;
            }
            rule.remove();
        }
    };
}

function postcssDropDesktop(breakpoint) {
    return {
        postcssPlugin: 'drop-desktop',
        AtRule: {
            media: rule => isDesktopRule(rule, breakpoint) && rule.remove()
        },
    };
}

module.exports = function (opts) {
    return function () {
        var stream = new Stream.Transform({objectMode: true});
        stream._transform = function (file, encoding, complete) {
            if (!file || file.isNull()) {
                return complete();
            }

            if (file.isStream()) {
                return complete('Streams are not supported!', file);
            }

            if (!opts.breakpoint || !opts.filter.test(file.path)) {
                return complete(null, file);
            }

            this.push(file);

            Promise.all([
                subset(this, file, [postcssExtractDesktop(opts.breakpoint)], 'desktop'),
                subset(this, file, [postcssDropDesktop(opts.breakpoint)], 'mobile'),
            ]).then(() => complete());
        };

        return stream;
    };
};
