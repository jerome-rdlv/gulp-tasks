module.exports = function (path) {
    path.extname = path.extname.replace('scss', 'css');
    path.dirname = path.dirname.replace('scss', 'css');
}
