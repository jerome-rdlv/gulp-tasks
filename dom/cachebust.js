const asset = require('../lib/asset');

module.exports = function (cachebust, selectors) {
	return ({document, to}) => {
		Object.entries(selectors).forEach(([selector, attribute]) => {
			document.querySelectorAll(selector).forEach(node => {
				const url = node.getAttribute(attribute);
				const path = asset.resolve(url, to);
				node.setAttribute(attribute, cachebust(url, path));
			});
		});
	};
};
