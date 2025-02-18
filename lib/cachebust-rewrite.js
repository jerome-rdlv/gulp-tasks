module.exports = function (req, res, next) {
	// handle cachebust rewrite to support watching in production mode
	req.url = req.url.replace(/^(.+)\.v([0-9a-z]+)\.([a-z0-9]+)(\?.*)?$/, '$1.$3');
	return next();
};
