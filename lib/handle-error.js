export default function handleError(error) {
	console.error(error.toString());
	this.emit('end');
}
