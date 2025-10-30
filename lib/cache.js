const store = new Map();

exports.cache = function (key, callback) {
	if (store.has(key)) {
		process.env.DEBUG && console.debug('cache: hit ', key.substring(0, 128));
		return store.get(key);
	}
	process.env.DEBUG && console.debug('cache: miss', key.substring(0, 128));
	const result = callback.call();
	store.set(key, result);
	return result;
};

exports.clear = function () {
	store.clear();
	return true;
}
