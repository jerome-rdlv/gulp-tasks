function isFontRule(rule) {
	return rule.name === 'font-face';
}

exports.extract = function () {
	// noinspection JSUnusedGlobalSymbols
	return {
		postcssPlugin: 'extract-fonts',
		AtRule(rule) {
			isFontRule(rule) || rule.remove();
		},
		Rule(rule) {
			let parent = rule.parent;
			while (parent.type !== 'root') {
				if (isFontRule(parent)) {
					return;
				}
				parent = parent.parent;
			}
			rule.remove();
		}
	};
}

exports.drop = function () {
	return {
		postcssPlugin: 'drop-fonts',
		AtRule: {
			'font-face': rule => rule.remove(),
		},
	};
}
