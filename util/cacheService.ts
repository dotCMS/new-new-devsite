import NodeCache from 'node-cache';

declare global {
    var nodeCache: { instance: NodeCache };
}

if (!global.nodeCache?.instance) {
    global.nodeCache = { instance: new NodeCache({ stdTTL: 3600, checkperiod: 120 }) };
}

export const dotCache: NodeCache = global.nodeCache.instance;

export const getCacheKey = (key: string) => {

        var hash = 0;
        for (var i = 0; i < key.length; i++) {
            var code = key.charCodeAt(i);
            hash = ((hash<<5)-hash)+code;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
}