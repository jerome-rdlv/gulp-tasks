const mediaQuery = require('css-mediaquery');

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

exports.extract = function (breakpoint) {
    // noinspection JSUnusedGlobalSymbols
    return {
        postcssPlugin: 'extract-desktop',
        AtRule(rule) {
            rule.name === 'charset' || isDesktopRule(rule, breakpoint) || rule.remove();
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

exports.drop = function (breakpoint) {
    return {
        postcssPlugin: 'drop-desktop',
        AtRule: {
            media: rule => isDesktopRule(rule, breakpoint) && rule.remove()
        },
    };
}
