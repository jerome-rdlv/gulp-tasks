const path = require('path');

/**
 * Resolve asset URL relatively to base
 * @param asset
 * @param base
 */
exports.resolve = function (asset, base) {
	return path.resolve(`${path.dirname(base)}/${asset}`);
}
