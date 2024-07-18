const fs = require('fs/promises');

module.exports = function ({dist, entries}) {
    function critical() {
        return Promise.all(entries.map(entry => {
            return require('critical').generate({
                src: entry.url,
                dimensions: [
                    {
                        height: 640,
                        width: 360,
                    },
                    {
                        height: 700,
                        width: 1300,
                    },
                ]
            }, null)
                .then(function ({css}) {
                    return fs.mkdir(dist, {recursive: true}).then(function () {
                        return fs.writeFile(`${dist}/${entry.name}.css`, css);
                    });
                })
                .catch(console.error);
        }));
    }

    critical.displayName = 'critical';
    return critical;
};
