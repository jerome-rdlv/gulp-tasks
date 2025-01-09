const srcParser = require('css-font-face-src');
const {generateFontFace} = require('fontaine');
const unpack = require('@capsizecss/unpack');
const ufo = require('ufo');
const node_url = require('node:url');
const metrics = require('@capsizecss/metrics');
const magicRegexp = require('magic-regexp');

const QUOTES_RE = magicRegexp.createRegExp(
    magicRegexp.charIn(`"'`).at.lineStart().or(magicRegexp.charIn(`"'`).at.lineEnd()),
    ["g"]
);
const withoutQuotes = (str) => str.trim().replace(QUOTES_RE, "");

const generics = {
    'serif': ['Times New Roman', 'Noto Serif'],
    'sans-serif': ['Arial', 'Roboto'],
};

const metricsCache = {};
const handled = {};

async function getMetricsForFamily(family) {
    try {
        family = withoutQuotes(family);
        const name = metrics.fontFamilyToCamelCase(family);
        const {entireMetricsCollection} = await import('@capsizecss/metrics/entireMetricsCollection');
        return entireMetricsCollection[name];
    } catch {
        return null;
    }
}

async function getMetrics(source) {
    if (source in metricsCache) {
        return Promise.resolve(metricsCache[source]);
    }
    const {protocol} = ufo.parseURL(/^\//.test(source) ? `file://${source}` : source);
    const metrics = await (
        protocol
            ? (protocol === 'file:' ? unpack.fromFile(source) : unpack.fromUrl(source))
            : getMetricsForFamily(source)
    );
    metricsCache[source] = metrics;
    return metrics;
}

async function getMetricsForSrc(sources) {
    for (const source of sources) {
        if (!source.url) {
            return;
        }
        const metrics = await getMetrics(source.url);
        if (metrics) {
            return metrics;
        }
    }
    return null;
}

function getFont(rule) {
    const font = {};
    for (const node of rule.nodes) {
        if (node.type !== 'decl') {
            continue;
        }
        font[node.prop.replace(/^font-/, '')] = node.value;
    }
    if (!font.family || !font.src) {
        return;
    }
    font.family = font.family.replace(/['"]/g, '');
    font.src = srcParser.parse(font.src);
    return font;
}


module.exports = (fallbacks = {}) => {
    async function generateFallbacks(rule) {
        const font = getFont(rule);
        if (!font) {
            // no font found
            return;
        }

        if (font.family in handled) {
            return;
        }
        handled[font.family] = true;

        if (!fallbacks[font.family]) {
            // no fallback registered for this font
            return;
        }

        const metrics = await getMetricsForSrc(font.src);
        if (!metrics) {
            // can not read font metrics, maybe warn
            return;
        }

        if (fallbacks[font.family] in generics) {
            fallbacks[font.family] = generics[fallbacks[font.family]];
        }

        for (const fallback of fallbacks[font.family].reverse()) {
            const fallbackMetrics = await getMetrics(fallback);
            if (!fallbackMetrics) {
                continue;
            }
            const props = {
                name: `${font.family}-fallback`,
                font: fallbackMetrics.familyName,
                metrics: fallbackMetrics,
            };
            const fontFace = generateFontFace(metrics, props);
            rule.before(fontFace);
        }
    }

    return {
        postcssPlugin: 'font-fallback',
        AtRule: {
            'font-face': generateFallbacks,
        },
    }
}
