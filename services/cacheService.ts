

const nodeCache = require('node-cache');

if (!nodeCache.instance) {
    nodeCache.instance = new nodeCache({  stdTTL: 3600, checkperiod: 120 });
}

export const dotCache = nodeCache.instance;

