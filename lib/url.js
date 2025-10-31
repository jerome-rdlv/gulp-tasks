exports.absolute = function (url) {
	// handle http://, https:// and // (agnostic scheme)
	return /^(https?:)?\/\//.test(url);
};
