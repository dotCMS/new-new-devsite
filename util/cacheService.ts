import NodeCache from 'node-cache';

declare global {
    var navCache: { instance: NodeCache };
    var graphCache: { instance: NodeCache };
    var vanityCache: { instance: NodeCache };
    var pageCache: { instance: NodeCache };
}

// Only initialize caches on the server side using globalThis
if (typeof globalThis !== 'undefined' && typeof window === 'undefined') {
    if (!(globalThis as any).navCache?.instance) {
        (globalThis as any).navCache = { instance: new NodeCache({ stdTTL: 3600, checkperiod: 120 }) };
    }
    if (!(globalThis as any).graphCache?.instance) {
        (globalThis as any).graphCache = { instance: new NodeCache({ stdTTL: 600, checkperiod: 30 }) };
    }
    if (!(globalThis as any).vanityCache?.instance) {
        (globalThis as any).vanityCache = { instance: new NodeCache({ stdTTL: 600, checkperiod: 60 }) };
    }
    if (!(globalThis as any).pageCache?.instance) {
        (globalThis as any).pageCache = { instance: new NodeCache({ stdTTL: 300, checkperiod: 30 }) };
    }
}
export const navCache: NodeCache = (globalThis as any).navCache?.instance || new NodeCache({ stdTTL: 3600, checkperiod: 120 });
export const graphCache: NodeCache = (globalThis as any).graphCache?.instance || new NodeCache({ stdTTL: 600, checkperiod: 30 });
export const vanityCache: NodeCache = (globalThis as any).vanityCache?.instance || new NodeCache({ stdTTL: 600, checkperiod: 60 });
export const pageCache: NodeCache = (globalThis as any).pageCache?.instance || new NodeCache({ stdTTL: 300, checkperiod: 30 });



export const getCacheKey = (key: string) => {

        var hash = 0;
        for (var i = 0; i < key.length; i++) {
            var code = key.charCodeAt(i);
            hash = ((hash<<5)-hash)+code;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
}
