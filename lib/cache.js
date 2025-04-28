const store = new Map();

module.exports = function cache(callback, options = {}) {
	return function () {
		const key = options.cacheKey || arguments[0];
		if (store.has(key)) {
			// console.debug('cache: hit ', key, store.get(key));
			return store.get(key);
		}
		const result = callback(...arguments);
		// console.debug('cache: miss', key, result);
		store.set(key, result);
		return result;
	}
};
