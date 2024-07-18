const vfs = require('vinyl-fs');

module.exports = function ({globs, dist}) {
    return function symlink() {
        return vfs.src(globs).pipe(vfs.symlink(dist));
    };
};
