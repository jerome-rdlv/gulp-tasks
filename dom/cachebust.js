const asset = require('../lib/asset');

module.exports = function (cachebust, selectors) {
	return ({document, to}) => {
		Object.entries(selectors).forEach(([selector, attribute]) => {
			document.querySelectorAll(selector).forEach(node => {
				const url = node.getAttribute(attribute);
				const src = asset.resolve(url, to).replace(/#.*$/, '');
				node.setAttribute(attribute, cachebust(url, src));
			});
		});
	};
};
