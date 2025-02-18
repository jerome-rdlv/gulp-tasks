'use strict';

export default function ready() {
    // we use window because this could be used by several separate bundles
    if (window._ready instanceof Promise) {
        return window._ready;
    }
    if (window._ready !== undefined) {
        throw new Error('Property window._ready is needed for application bootstrap but is used by another module.');
    }
    if (document.documentElement.classList.contains('js-off')) {
        // do not execute if js is off
        window._ready = Promise.reject();
    } else {
        window._ready = Promise.resolve()
            .then(cancelFallback)
            .catch(console.warn)
        ;
    }
    return window._ready;
}

function cancelFallback() {
    // cancel fallback since script is loaded
    if (typeof window.fallback === 'object') {
        window.fallback.cancel();
    }
}
