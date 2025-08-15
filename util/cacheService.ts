import NodeCache from 'node-cache';

declare global {
    var nodeCache: { instance: NodeCache };
}

if (!global.nodeCache?.instance) {
    global.nodeCache = { 
        instance: new NodeCache({ 
            stdTTL: 3600, // 1 hour default TTL
            checkperiod: 120, // Check for expired keys every 2 minutes
            maxKeys: 1000, // Limit cache to 1000 keys to prevent memory issues
            deleteOnExpire: true, // Automatically delete expired keys
            useClones: false // Better performance, but be careful with object mutations
        }) 
    };
}

export const dotCache: NodeCache = global.nodeCache.instance;

export const getCacheKey = (key: string): string => {
    // Use a more robust hash function to avoid collisions
    let hash = 0;
    if (key.length === 0) return hash.toString();
    
    for (let i = 0; i < key.length; i++) {
        const char = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    
    // Return absolute value as string to avoid negative keys
    return Math.abs(hash).toString();
}
