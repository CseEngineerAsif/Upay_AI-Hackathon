import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import rateLimit from 'express-rate-limit';
import request from 'supertest';

describe('Security: Rate Limiting (DDoS & Brute-force Defense)', () => {
  it('should return 429 Too Many Requests once the limit is exceeded', async () => {
    const testApp = express();

    // Create rate limiter with small threshold (3 requests)
    const strictLimiter = rateLimit({
      windowMs: 1000,
      max: 3,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many requests, please try again later.' }
    });

    testApp.use('/test-rate-limit', strictLimiter, (req, res) => {
      res.json({ ok: true });
    });

    // 1st request -> 200
    const res1 = await request(testApp).get('/test-rate-limit');
    assert.equal(res1.status, 200);

    // 2nd request -> 200
    const res2 = await request(testApp).get('/test-rate-limit');
    assert.equal(res2.status, 200);

    // 3rd request -> 200
    const res3 = await request(testApp).get('/test-rate-limit');
    assert.equal(res3.status, 200);

    // 4th request -> 429 Too Many Requests
    const res4 = await request(testApp).get('/test-rate-limit');
    assert.equal(res4.status, 429, 'Expected 429 Too Many Requests after limit');
    assert.equal(res4.body.error, 'Too many requests, please try again later.');
  });
});
