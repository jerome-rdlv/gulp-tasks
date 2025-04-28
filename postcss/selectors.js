module.exports = function (aliases) {
	const data = [];
	const selectors = new Set();
	return {
		postcssPlugin: 'selectors',
		data: data,
		Rule(rule) {
			if (!/(::|:before|:after|:(first|last|nth(-last)?)-child|:focus|:hover|:focus|:active|:visited)/.test(rule.selector)) {
				selectors.add(rule.selector);
			}
		},
		OnceExit() {
			selectors.forEach(selector => data.push(selector));
		}
	};
}
