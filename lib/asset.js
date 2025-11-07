const path = require('path');

/**
 * Resolve asset URL relatively to base
 */
exports.resolve = function (url, base = '') {
	return path.normalize(`${path.dirname(base)}/${url}`);
}
