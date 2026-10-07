import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../../server';

describe('Security: Authentication & User Spoofing Protection', () => {
  it('should return 401 Unauthorized when request lacks Bearer token and AUTH_DISABLED is false', async () => {
    const prevAuth = process.env.AUTH_DISABLED;
    try {
      process.env.AUTH_DISABLED = 'false';

      const res = await request(app)
        .post('/api/safety/risk-check')
        .send({
          amount: 500,
          recipientPhone: '01712345678'
        });

      assert.equal(res.status, 401, 'Expected 401 Unauthorized without token');
      assert.ok(res.body.error, 'Expected error message in response');
    } finally {
      process.env.AUTH_DISABLED = prevAuth;
    }
  });

  it('should reject requests with invalid Bearer token format', async () => {
    const prevAuth = process.env.AUTH_DISABLED;
    try {
      process.env.AUTH_DISABLED = 'false';

      const res = await request(app)
        .post('/api/safety/risk-check')
        .set('Authorization', 'Basic invalid_token_format')
        .send({
          amount: 500,
          recipientPhone: '01712345678'
        });

      assert.equal(res.status, 401);
    } finally {
      process.env.AUTH_DISABLED = prevAuth;
    }
  });

  it('should ignore client userId in request body and strictly use authenticated token uid', async () => {
    const prevAuth = process.env.AUTH_DISABLED;
    const prevAllow = process.env.ALLOW_TEST_TOKENS;

    try {
      process.env.AUTH_DISABLED = 'false';
      process.env.ALLOW_TEST_TOKENS = 'true';

      // Authenticated as victim_user_1
      const res = await request(app)
        .post('/api/safety/risk-check')
        .set('Authorization', 'Bearer test_token_victim_user_1_user')
        .send({
          amount: 500,
          recipientPhone: '01712345678',
          // Malicious attempt to spoof another user
          userId: 'target_victim_99'
        });

      // Unknown field "userId" is rejected by strict validation schema OR if ignored, never used
      // If validation rejects unknown fields, status is 400 with "Invalid request payload"
      assert.equal(res.status, 400, 'Spoofed userId field must be rejected by strict schema');
      assert.ok(
        res.body.details?.some((d: any) => d.field?.includes('userId') || d.message?.includes('userId')),
        'Error should flag unrecognized userId field'
      );
    } finally {
      process.env.AUTH_DISABLED = prevAuth;
      process.env.ALLOW_TEST_TOKENS = prevAllow;
    }
  });

  it('should allow public health check and seed GET without authentication', async () => {
    const prevAuth = process.env.AUTH_DISABLED;
    try {
      process.env.AUTH_DISABLED = 'false';

      const healthRes = await request(app).get('/api/health');
      assert.equal(healthRes.status, 200);
      assert.equal(healthRes.body.status, 'ok');

      const seedRes = await request(app).get('/api/seed');
      assert.equal(seedRes.status, 200);
    } finally {
      process.env.AUTH_DISABLED = prevAuth;
    }
  });
});
