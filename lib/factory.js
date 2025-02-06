module.exports = function factory(construct) {
    let instance = null;
    return function () {
        return instance || (instance = construct());
    };
}
