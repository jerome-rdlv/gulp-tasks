module.exports = function (file) {
    file.extname = file.extname.replace('scss', 'css');
    file.dirname = file.dirname.replace('scss', 'css');
}
