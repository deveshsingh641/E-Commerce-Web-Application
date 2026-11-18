/**
 * In-memory TTL Cache middleware for read-heavy API routes.
 * Reduces database strain and delivers ~1ms response latencies for repeated queries.
 */
class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlSeconds = 60) {
    this.store.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  invalidate(pattern = '') {
    if (!pattern) {
      this.store.clear();
      return;
    }
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) {
        this.store.delete(key);
      }
    }
  }

  size() {
    return this.store.size;
  }
}

export const cacheStore = new MemoryCache();

export const cacheMiddleware = (ttlSeconds = 60) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET' || process.env.NODE_ENV === 'test') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedData = cacheStore.get(key);

    if (cachedData !== null) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    res.setHeader('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // Only cache successful 200 responses
      if (res.statusCode === 200) {
        cacheStore.set(key, body, ttlSeconds);
      }
      return originalJson(body);
    };

    next();
  };
};

export const invalidateCache = (pattern) => {
  cacheStore.invalidate(pattern);
};
