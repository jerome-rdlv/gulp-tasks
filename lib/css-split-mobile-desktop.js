const extract = require('./postcss-extract');
const mediaQuery = require('css-mediaquery');
const path = require('path');
const PluginError = require('plugin-error')
const postcss = require('postcss');
const Stream = require('stream');

function isDesktopRule(rule, breakpoint) {
    members: for (const member of mediaQuery.parse(rule.params)) {
        expressions: for (const expression of member.expressions) {
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
    return {
        postcssPlugin: 'extract-desktop',
        AtRule(rule) {
            isDesktopRule(rule, breakpoint) || rule.remove();
        },
        Rule(rule) {
            parent = rule.parent;
            while (parent.type !== 'root') {
                if (isDesktopRule(parent, breakpoint)) {
                    return;
                }
                parent = parent.parent;
            }
            rule.remove();
        }
    };
};

function postcssDropDesktop(breakpoint) {
    return {
        postcssPlugin: 'drop-desktop',
        AtRule: {
            media: rule => isDesktopRule(rule, breakpoint) && rule.remove()
        },
    };
};

module.exports = function (opts) {
    return function () {
        var stream = new Stream.Transform({objectMode: true});
        stream._transform = function (file, encoding, complete) {
            const self = this;

            if (file.isNull()) {
                return complete();
            }

            self.push(file);

            if (file.isStream()) {
                return complete('Streams are not supported!');
            }

            if (!opts.breakpoint || !opts.filter.test(file.path)) {
                return complete();
            }

            Promise
                .all([
                    extract(file, postcssExtractDesktop(opts.breakpoint), 'desktop'),
                    extract(file, postcssDropDesktop(opts.breakpoint), 'mobile'),
                ])
                .then(files => files.forEach(file => self.push(file)))
                .then(() => complete());
            ;
        };

        return stream;
    };
};
