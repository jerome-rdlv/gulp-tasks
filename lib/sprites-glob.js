const {globSync} = require('glob');
const fs = require('fs');
const path = require('path');

module.exports = function (glob, cwd) {
	const sprites = {};
	globSync(glob, {cwd}).forEach(dir => {
		sprites[`${dir}.svg`] = fs.globSync(`${cwd}/${dir}/*.svg`)
			.map(p => fs.realpathSync(p))
			.map(p => path.relative(process.cwd(), p));
	});
	return sprites;
};
