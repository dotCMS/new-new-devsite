import NodeCache from 'node-cache';

declare global {
    var navCache: { instance: NodeCache };
    var graphCache: { instance: NodeCache };
    var vanityCache: { instance: NodeCache };
}

if (!global.navCache?.instance) {
    global.navCache = { instance: new NodeCache({ stdTTL: 3600, checkperiod: 120 }) };
}
if (!global.graphCache?.instance) {
    global.graphCache = { instance: new NodeCache({ stdTTL: 600, checkperiod: 30 }) };
}
if (!global.vanityCache?.instance) {
    global.vanityCache = { instance: new NodeCache({ stdTTL: 600, checkperiod: 60 }) };
}
export const navCache: NodeCache = global.navCache.instance;
export const graphCache: NodeCache = global.graphCache.instance;
export const vanityCache: NodeCache = global.vanityCache.instance;



export const getCacheKey = (key: string) => {

        var hash = 0;
        for (var i = 0; i < key.length; i++) {
            var code = key.charCodeAt(i);
            hash = ((hash<<5)-hash)+code;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
}