module.exports = function (url, params) {
    const urlObject = new URL(url);
    params.entries().forEach(([key, value]) => {
        urlObject.searchParams.append(key, value);
    });
    return urlObject.toString();
};
