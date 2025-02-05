const fs = require('fs');
const path = require('path');
const valueParser = require('postcss-value-parser');

module.exports = function () {

    const cacheBustUrl = require('../lib/cachebust-url').get();
    const getFileSignature = require('../lib/get-file-signature').get();

    const props = new RegExp(`${[
        'background',
        'background-image',
        'border-image',
        'behavior',
        'src',
    ].join('|')}`);

    return {
        postcssPlugin: 'cachebust',
        Once(root, {result}) {
            root.walkDecls(props, decl => {
                const parsed = valueParser(decl.value);
                parsed.walk(node => {
                    if (node.type !== 'function' || node.value !== 'url') {
                        return;
                    }
                    const url = node.nodes[0].value;
                    if (/^data:/.test(url)) {
                        return;
                    }
                    const src = path.resolve(`${path.dirname(result.opts.to)}/${url}`);
                    if (!fs.existsSync(src)) {
                        decl.warn(result, `${url} does not exists in destination`);
                        return;
                    }
                    node.nodes[0].value = cacheBustUrl(url, getFileSignature(src));
                });
                decl.value = valueParser.stringify(parsed);
            });
        },
    };
}
