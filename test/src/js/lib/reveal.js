'use strict';

import ready from './ready';
import {mutate} from './promise-fastdom';
import promiseIdle from './promise-idle';
import promiseImage from './promise-image';
import {trigger} from './events';
import promiseRAF from './promise-raf';
import SelectorObserver from './SelectorObserver';

let scrollingObserver;
let loadingObserver;

ready().then(promiseIdle()).then(function () {

    // disable in prefers-reduced-motion
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
        return;
    }

    // immediately reveal what’s in viewport at load time or when added to document
    loadingObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // either reveal immediately, or delegate to scrolling observer to reveal later
            observer.unobserve(entry.target);
            if (entry.isIntersecting) {
                reveal(entry.target.closest('.reveal'));
            } else {
                scrollingObserver.observe(entry.target);
            }
        });
    });

    scrollingObserver = new IntersectionObserver(handleScrolling, {
        rootMargin: '200% 0px -25% 0px',
        threshold: 0,
    });

    const selector = '.reveal.reveal__anchor, .reveal .reveal__anchor';
    document.querySelectorAll(selector).forEach(observeAnchor);

    // listen for future tree modifications
    const so = new SelectorObserver(selector);
    so.listen('added', observeAnchor);
    so.listen('removed', unobserveAnchor);
});

function observeAnchor(anchor) {
    loadingObserver.observe(anchor);
}

function unobserveAnchor(anchor) {
    loadingObserver.unobserve(anchor);
    scrollingObserver.unobserve(anchor);
}

function handleScrolling(entries) {
    entries.forEach(entry => {
        const node = entry.target.closest('.reveal');
        if (!node) {
            return;
        }
        if (entry.isIntersecting) {
            return reveal(node);
        }
        if (node.classList.contains('reveal--reverse')) {
            return hide(node);
        }
    });
}

function reveal(node) {
    node.reveal = (node.reveal ? node.reveal : Promise.resolve())
        .then(() => {
            if (node.classList.contains('reveal--wait-image')) {
                return Promise.all(Array.prototype.map.call(node.querySelectorAll('img'), promiseImage))
            }
        })
        .then(mutate(function () {
            node.classList.contains('reveal--hidden') && trigger.call(node, 'reveal/on');
            node.classList.add('reveal--run');
        }))
        .then(promiseRAF())
        .then(mutate(function () {
            node.classList.remove('reveal--hidden');
        }));
    return node.reveal;
}

function hide(node) {
    node.reveal = (node.reveal ? node.reveal : Promise.resolve())
        .then(promiseRAF())
        .then(mutate(function () {
            trigger.call(node, 'reveal/off');
            node.classList.add('reveal--hidden');
        }));
    return node.reveal;
}
