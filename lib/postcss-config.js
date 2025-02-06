module.exports = function (plugins, rename) {
    return function (file) {
        const clone = file.clone({deep: false, contents: false});
        rename(clone);
        return {
            plugins: plugins,
            options: {to: clone.path}
        };
    };
}
