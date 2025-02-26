/**
 * Configuration can be disabled in svg files
 * with following script:
 *
 *   <script type="application/json" id="svgo-disable">
 *     [
 *     "removeHiddenElems",
 *     "convertPathData",
 *     ]
 *   </script>
 *
 * or:
 *
 *   <script type="text/plain" id="svgo-disable">
 *     removeHiddenElems,
 *     convertPathData,
 *   </script>
 *
 */
module.exports = function svgoDisabled ({document, file}) {

	// create property for later detection anyway
	file.svgo = null;

	const node = document.getElementById('svgo-disable');
	if (!node) {
		return;
	}

	const disabled = node.innerHTML.trim();
	const type = node.getAttribute('type');
	node.remove();

	if (!disabled) {
		return;
	}

	try {
		switch (type) {
			case 'application/json':
				file.svgo = JSON.parse(disabled);
				return;
			case 'text/plain':
			default:
				file.svgo = disabled
					.split(',')
					.map(token => token.trim())
					.filter(token => token.length);
				return;
		}
	} catch (error) {
		console.error(error);
	}
};
