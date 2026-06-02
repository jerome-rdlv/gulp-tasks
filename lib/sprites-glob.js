const {globSync} = require('glob');

module.exports = function (glob, cwd) {
	const sprites = {};
	globSync(glob, {cwd}).forEach(dir => {
		sprites[`${dir}.svg`] = `${cwd}/${dir}/*.svg`;
	});
	return sprites;
};
