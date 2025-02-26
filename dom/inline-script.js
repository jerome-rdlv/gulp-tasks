const asset = require('../lib/asset');
const fs = require('node:fs').promises;

module.exports = function ({document, to}) {
	return Promise.all(Array.prototype.map.call(document.querySelectorAll('script[src][data-inline]'), async node => {
		if (!node.src.length) {
			return;
		}
		const path = asset.resolve(node.src, to);
		return fs.readFile(path)
			.then(contents => {
				node.removeAttribute('src');
				node.removeAttribute('data-inline');
				node.innerHTML = contents;
			})
			.catch(error => console.error)
			;
	}));
};
