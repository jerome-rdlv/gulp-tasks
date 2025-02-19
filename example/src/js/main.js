'use strict';

import promiseIdle from './promise-idle';

promiseIdle().then(function () {
	console.log('Hello world!');
});
