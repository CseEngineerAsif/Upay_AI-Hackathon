import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../../server';

describe('Security: Input Validation & Payload Size Limiting', () => {
  it('should reject malformed JSON with 400 and safe error message', async () => {
    const res = await request(app)
      .post('/api/safety/scam-check')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer test_token_user_1')
      .send('{ "message": "unclosed json string ... ');

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Malformed JSON payload');
  });

  it('should reject unknown/unrecognized fields with 400 and safe error message', async () => {
    const res = await request(app)
      .post('/api/safety/risk-check')
      .set('Authorization', 'Bearer test_token_user_1')
      .send({
        amount: 500,
        recipientPhone: '01712345678',
        // Illegal unknown injected fields
        injectedAdminPrivilege: true,
        userBaselineAvgAmount: 999999
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Invalid request payload');
    assert.ok(
      res.body.details?.some((d: any) => d.message?.includes('unrecognized') || d.field?.includes('injectedAdminPrivilege'))
    );
  });

  it('should reject strings exceeding maximum allowed length', async () => {
    // Note maximum length is 300 characters
    const overlyLongNote = 'A'.repeat(350);

    const res = await request(app)
      .post('/api/safety/risk-check')
      .set('Authorization', 'Bearer test_token_user_1')
      .send({
        amount: 500,
        recipientPhone: '01712345678',
        note: overlyLongNote
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Invalid request payload');
    assert.ok(
      res.body.details?.some((d: any) => d.field?.includes('note'))
    );
  });

  it('should reject negative or zero transaction amounts', async () => {
    const res = await request(app)
      .post('/api/safety/risk-check')
      .set('Authorization', 'Bearer test_token_user_1')
      .send({
        amount: -50,
        recipientPhone: '01712345678'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Invalid request payload');
  });

  it('should reject oversized payloads greater than 100kb with 413 Payload Too Large', async () => {
    // 120kb payload
    const largeMessage = 'x'.repeat(120 * 1024);

    const res = await request(app)
      .post('/api/safety/scam-check')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer test_token_user_1')
      .send(JSON.stringify({ message: largeMessage }));

    assert.equal(res.status, 413, 'Expected 413 Payload Too Large');
    assert.ok(
      res.body.error?.includes('Payload Too Large') || res.body.error?.includes('100kb'),
      'Expected safe 100kb limit message'
    );
  });
});
