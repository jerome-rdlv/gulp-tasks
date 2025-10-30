module.exports = function (input, output) {

	async function eleventy() {
		const {Eleventy} = await import('@11ty/eleventy');
		const eleventy = new Eleventy(input, output, {
			quietMode: true,
		});
		await eleventy.init();
		return eleventy;
	}

	const main = function () {
		return eleventy().then(eleventy => eleventy.write()).catch(e => {
			throw e.name === 'EleventyConfigError' ? e.originalError : e;
		});
	}

	const watch = function () {
		eleventy().then(eleventy => eleventy.watch());
	}

	const serve = function () {
		eleventy().then(eleventy => eleventy.serve());
	}

	main.displayName = 'html';
	watch.displayName = 'html:watch';
	serve.displayName = 'html:serve';

	return {main, watch, serve}
};
