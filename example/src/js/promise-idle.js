'use strict';

export default function promiseIdle() {
    return function (value) {
        return new Promise(function (resolve) {
            requestIdleCallback(function () {
                resolve(value);
            });
        });
    };
}