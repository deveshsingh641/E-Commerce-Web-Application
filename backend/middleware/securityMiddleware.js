/**
 * Lightweight in-memory rate limiter to protect sensitive endpoints
 * (e.g., login, registration) against brute-force and credential-stuffing attacks.
 */
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 minutes default
  maxRequests = 20, // Max requests per window
  message = 'Too many requests from this IP, please try again later.',
} = {}) => {
  const ipHits = new Map();

  // Periodic cleanup of stale records every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipHits.entries()) {
      if (now > record.resetTime) {
        ipHits.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref(); // unref so it does not block Node event loop exit in tests

  return (req, res, next) => {
    // In test environment, skip rate limiting to avoid test interference
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    let clientRecord = ipHits.get(ip);

    if (!clientRecord || now > clientRecord.resetTime) {
      clientRecord = {
        count: 1,
        resetTime: now + windowMs,
      };
      ipHits.set(ip, clientRecord);
    } else {
      clientRecord.count += 1;
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - clientRecord.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(clientRecord.resetTime / 1000));

    if (clientRecord.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((clientRecord.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message,
        retryAfter: retryAfterSeconds,
      });
    }

    next();
  };
};

/**
 * Security headers middleware setting essential web protection headers.
 */
export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
};
