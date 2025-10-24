module.exports = function (filepath) {
	filepath.extname = filepath.extname.replace('scss', 'css');
	filepath.dirname = filepath.dirname.replace('scss', 'css');
}
