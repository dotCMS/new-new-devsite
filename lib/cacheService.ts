import NodeCache from 'node-cache';

declare global {
    var nodeCache: { instance?: NodeCache };
}

if (!global.nodeCache?.instance) {
    global.nodeCache = { instance: new NodeCache({ stdTTL: 3600, checkperiod: 120 }) };
}

export const dotCache = global.nodeCache.instance;

