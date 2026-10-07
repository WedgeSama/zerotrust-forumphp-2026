const Twig = require('twig');
const path = require('path');

function asset(publicPath, assetPath) {
    const base = (publicPath || '/').replace(/\/+$/, '');
    const rel = String(assetPath).replace(/^\/+/, '');
    return `${base}/${rel}`;
}

module.exports = function (source) {
    const callback = this.async();
    const filePath = this.resourcePath;
    const { publicPath = '/' } = this.getOptions() || {};

    this.addContextDependency(path.join(path.dirname(filePath), 'slides'));

    Twig.cache(false);

    Twig.extendFunction('asset', (assetPath) => asset(publicPath, assetPath));

    Twig.renderFile(filePath, {}, (err, html) => {
        if (err) return callback(err);
        callback(null, `module.exports = () => ${JSON.stringify(html)};`);
    });
};
