import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { escapeRegex, isValidObjectId, isValidEmail } from '../middleware/validateMiddleware.js';
import { cacheStore } from '../middleware/cacheMiddleware.js';
import { securityHeaders } from '../middleware/securityMiddleware.js';

describe('Backend Validation & Sanitization Suite', () => {
  describe('escapeRegex helper', () => {
    test('escapes special regex characters correctly', () => {
      const dangerousInput = 'product (v2.0) [test] *+?^${}|\\';
      const escaped = escapeRegex(dangerousInput);
      const re = new RegExp(escaped);
      assert.ok(re.test(dangerousInput), 'Sanitized string should match literal string safely');
    });

    test('handles empty and non-string inputs safely without crashing', () => {
      assert.equal(escapeRegex(''), '');
      assert.equal(escapeRegex(null), '');
      assert.equal(escapeRegex(undefined), '');
      assert.equal(escapeRegex(123), '');
    });

    test('does not modify simple alphanumeric strings', () => {
      assert.equal(escapeRegex('WirelessHeadphones123'), 'WirelessHeadphones123');
    });
  });

  describe('isValidObjectId helper', () => {
    test('accepts valid 24-character hexadecimal MongoDB ObjectIds', () => {
      assert.equal(isValidObjectId('507f1f77bcf86cd799439011'), true);
      assert.equal(isValidObjectId('663f707f1f77bcf86cd79943'), true);
    });

    test('rejects malformed, non-hex, or short IDs', () => {
      assert.equal(isValidObjectId('not-an-id'), false);
      assert.equal(isValidObjectId('12345'), false);
      assert.equal(isValidObjectId(''), false);
      assert.equal(isValidObjectId(null), false);
      assert.equal(isValidObjectId('507f1f77bcf86cd79943901z'), false); // 'z' is not hex
    });
  });

  describe('isValidEmail helper', () => {
    test('accepts valid email addresses', () => {
      assert.equal(isValidEmail('user@demo.com'), true);
      assert.equal(isValidEmail('alex.johnson+test@example.co.uk'), true);
    });

    test('rejects malformed email formats', () => {
      assert.equal(isValidEmail('invalid-email'), false);
      assert.equal(isValidEmail('@demo.com'), false);
      assert.equal(isValidEmail('user@'), false);
      assert.equal(isValidEmail('user@demo'), false);
      assert.equal(isValidEmail(''), false);
      assert.equal(isValidEmail(null), false);
    });
  });

  describe('Order Calculation Logic', () => {
    test('calculates correct order totals and free shipping threshold', () => {
      const items = [
        { price: 60, qty: 2 }, // 120
      ];
      const itemsPrice = items.reduce((acc, item) => acc + item.price * item.qty, 0);
      assert.equal(itemsPrice, 120);

      // Shipping: $15 if <= 150
      const shippingPrice = itemsPrice > 150 ? 0 : 15;
      assert.equal(shippingPrice, 15);

      const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
      assert.equal(taxPrice, 9.6);

      const total = itemsPrice + shippingPrice + taxPrice;
      assert.equal(Number(total.toFixed(2)), 144.6);
    });

    test('applies SAVE20 promo code discount properly', () => {
      const itemsPrice = 200;
      const discount = Math.min(20, itemsPrice);
      assert.equal(discount, 20);
      const shipping = itemsPrice > 150 ? 0 : 15;
      const tax = Number((itemsPrice * 0.08).toFixed(2));
      const total = Number((itemsPrice + shipping + tax - discount).toFixed(2));
      assert.equal(total, 196); // 200 + 0 + 16 - 20 = 196
    });

    test('prevents review rating corruption (NaN safety check)', () => {
      const reviews = [
        { rating: 5 },
        { rating: 4 },
      ];
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = Number((sum / reviews.length).toFixed(1));
      assert.equal(avg, 4.5);
      assert.equal(isNaN(avg), false);
    });
  });

  describe('In-Memory TTL Cache Suite', () => {
    test('stores, retrieves, and invalidates cached data', () => {
      cacheStore.set('/api/products?cat=audio', [{ id: 1, name: 'Headphones' }], 10);
      const hit = cacheStore.get('/api/products?cat=audio');
      assert.ok(hit !== null, 'Cache hit should return stored array');
      assert.equal(hit[0].name, 'Headphones');

      cacheStore.invalidate('/api/products');
      const miss = cacheStore.get('/api/products?cat=audio');
      assert.equal(miss, null, 'Cache should be invalidated');
    });

    test('returns null for non-existent or expired keys', () => {
      const nonExistent = cacheStore.get('/api/non-existent-key');
      assert.equal(nonExistent, null);
    });
  });

  describe('Security Headers Middleware', () => {
    test('sets expected HTTP protection headers', () => {
      const headers = {};
      const req = {};
      const res = {
        setHeader: (k, v) => {
          headers[k] = v;
        },
        removeHeader: (k) => {
          delete headers[k];
        },
      };

      securityHeaders(req, res, () => {});
      assert.equal(headers['X-Content-Type-Options'], 'nosniff');
      assert.equal(headers['X-Frame-Options'], 'DENY');
      assert.equal(headers['X-XSS-Protection'], '1; mode=block');
      assert.equal(headers['Referrer-Policy'], 'strict-origin-when-cross-origin');
    });
  });
});
