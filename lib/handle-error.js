function handleError(error) {
	if (handleError.watch) {
		// display and swallow
		console.error(error.toString());
		this.emit('end');
	} else {
		// break, needed to stop CI job on failure
		throw error;
	}
}

handleError.watch = false;

export {handleError as default, handleError as 'module.exports'};
