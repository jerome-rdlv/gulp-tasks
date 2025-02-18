(function (root) {

    // set document flags
    // OK to use classList here for single add and remove on non-SVG node
    var list = root.classList;

    // fonts
    if (window.localStorage.getItem('fonts-loaded') !== 'true') {
        list.remove('fonts-on');
    }

    list.add('js-on');
    list.remove('js-off');

    window.fallback = (function () {
        var cancels = [];
        var timeoutId = setTimeout(function () {
            for (var i = 0; i < cancels.length; ++i) {
                cancels[i].call();
            }
        }, 3000);
        return {
            cancel: function () {
                clearTimeout(timeoutId);
            },
            add: function (init, cancel) {
                if (typeof init === 'function') {
                    init.call();
                }
                if (typeof cancel === 'function') {
                    cancels.unshift(cancel);
                }
            },
        };
    })();
})(document.documentElement);
