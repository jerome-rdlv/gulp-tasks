const postcss = require('postcss');
const through = require('through2');
const Vinyl = require('vinyl');
const valueParser = require('postcss-value-parser');

const props = new RegExp(`${[
    'font-family',
    'src',
    'font-weight',
    'font-style',
].join('|')}`);

module.exports = function (output) {

    const metadata = [];

    function eachFile(file, encoding, complete) {
        postcss({
            postcssPlugin: 'font-metadata',
            AtRule: {
                'font-face': rule => {
                    const data = {opts: {}, src: []};
                    rule.walkDecls(props, decl => {
                        switch (decl.prop) {
                            case 'font-family':
                                data.family = decl.value;
                                break;
                            case 'font-weight':
                            case 'font-style':
                                data.opts[decl.prop.replace(/^font-/, '')] = decl.value;
                                break;
                            case 'src':
                                const parsed = valueParser(decl.value);
                                parsed.walk(node => {
                                    if (node.type !== 'function' || node.value !== 'url') {
                                        return;
                                    }
                                    const url = node.nodes[0].value;
                                    if (/^data:/.test(url)) {
                                        return;
                                    }
                                    data.src.push(url);
                                });
                                break;

                        }
                    });
                    metadata.push(data);
                },
            }
        }).process(file.contents, {
            from: file.path,
        }).then(() => complete(null, file))
    }

    function endStream(callback) {
        try {
            this.push(new Vinyl({
                path: output,
                contents: Buffer.from(JSON.stringify(metadata, null, '\t'), 'utf8')
            }));
            callback();
        } catch (error) {
            callback(error);
        }
    }

    return through.obj(eachFile, endStream, false);
};
