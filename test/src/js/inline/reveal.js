(function () {

    // disable in prefers-reduced-motion
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
        return;
    }

    window.fallback.add(
        function () {
            (new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type !== 'childList') {
                        return;
                    }
                    mutation.addedNodes.forEach(function (node) {
                        if (!(node instanceof Element)) {
                            return;
                        }
                        if (node.matches('.reveal-default')) {
                            node.classList.add('reveal');
                            node.classList.add('reveal__anchor');
                        }
                        if (node.matches('.reveal')) {
                            node.classList.add('reveal--hidden');
                        }
                    });
                });
            })).observe(document.body, {childList: true, subtree: true});
        },
        function () {
            Array.prototype.forEach.call(document.querySelectorAll('.reveal--hidden'), function (node) {
                node.classList.remove('reveal--hidden');
            });
        }
    );
})();
