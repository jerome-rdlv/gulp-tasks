function handleError(error) {
	console.error(error.toString());
	this.emit('end');
}

export {handleError as default, handleError as 'module.exports'};
