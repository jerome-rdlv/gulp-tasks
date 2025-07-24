const fs = require('fs');
const path = require('path');
const valueParser = require('postcss-value-parser');

module.exports = function (cachebust) {

	const props = new RegExp(`^(${[
		'background',
		'background-image',
		'border-image',
		'behavior',
		'src',
	].join('|')})$`);

	return {
		postcssPlugin: 'cachebust',
		OnceExit(root, {result}) {
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
					try {
						node.nodes[0].value = cachebust(url, src);
					} catch (e) {
						decl.warn(result, e.toString());
						return;
					}
				});
				decl.value = valueParser.stringify(parsed);
			});
		},
	};
}
