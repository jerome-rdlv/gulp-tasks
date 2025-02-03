(function (nodes) {
    'use strict';

    if (!nodes) {
        return;
    }

    // disable in prefers-reduced-motion
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    Array.prototype.forEach.call(nodes, function (node) {
        node.classList.add('reveal--hidden');
    });

    window.fallback.add(function () {
        Array.prototype.forEach.call(nodes, function (node) {
            node.classList.remove('reveal--hidden');
        });
    });
})(document.querySelectorAll(':root.js-on .reveal'));
