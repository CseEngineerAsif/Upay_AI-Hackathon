import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readPinApiResponse } from '../../src/utils/pinApi';

describe('PIN API response parsing', () => {
  it('reports an empty response with its HTTP status', async () => {
    await assert.rejects(
      readPinApiResponse(new Response(null, { status: 200 }), 'PIN verification'),
      /PIN verification returned an empty response \(HTTP 200\)/
    );
  });

  it('reports non-JSON responses without exposing a JSON parser error', async () => {
    await assert.rejects(
      readPinApiResponse(
        new Response('<!doctype html>', {
          status: 404,
          headers: { 'Content-Type': 'text/html' }
        }),
        'PIN verification'
      ),
      /PIN verification returned an invalid JSON response \(HTTP 404\)/
    );
  });

  it('reads a valid PIN API response', async () => {
    const result = await readPinApiResponse(
      new Response(JSON.stringify({ valid: false, error: 'Invalid PIN' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }),
      'PIN verification'
    );

    assert.deepEqual(result, { valid: false, success: undefined, error: 'Invalid PIN' });
  });
});
