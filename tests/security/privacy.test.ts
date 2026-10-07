import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizePrivacyText,
  maskPhoneNumber,
  maskNid,
  stripSecrets,
  safeLogger
} from '../../functions/privacyGuardrails';

describe('Security: Privacy Guardrails & PII Sanitization', () => {
  it('should mask Bangladeshi phone numbers to safe format', () => {
    const rawPhone = '01794809461';
    const masked = maskPhoneNumber(rawPhone);
    assert.equal(masked, '017***461');
    assert.ok(!masked.includes('94809'));
  });

  it('should mask National ID (NID) numbers', () => {
    const nid10 = '1234567890';
    const masked10 = maskNid(nid10);
    assert.ok(!masked10.includes('345678'));

    const nid17 = '19951234567890123';
    const masked17 = maskNid(nid17);
    assert.ok(!masked17.includes('12345678901'));
  });

  it('should strip PINs, OTPs, and password declarations from text', () => {
    const rawText = 'আমার পিন হলো pin: 1234 এবং otp: 5678, password=secretPass123';
    const stripped = stripSecrets(rawText);
    assert.ok(!stripped.includes('1234'), 'PIN must be stripped');
    assert.ok(!stripped.includes('5678'), 'OTP must be stripped');
    assert.ok(!stripped.includes('secretPass123'), 'Password must be stripped');
    assert.ok(stripped.includes('[REDACTED_PIN]'));
    assert.ok(stripped.includes('[REDACTED_SECRET]'));
  });

  it('should sanitize full user text removing PINs, NIDs, and phone patterns', () => {
    const untrustedInput = 'ভাই আমার NID 19951234567890123 এবং পিন 4321, 01812345678 এ টাকা পাঠাও';
    const sanitized = sanitizePrivacyText(untrustedInput);

    // Assert that raw NID, raw PIN, and full phone number are scrubbed
    assert.ok(!sanitized.includes('19951234567890123'), 'Raw NID must not be present');
    assert.ok(!sanitized.includes('4321'), 'Raw PIN must not be present');
    assert.ok(!sanitized.includes('01812345678'), 'Full phone must be masked');
    assert.ok(sanitized.includes('018***678'), 'Phone must be privacy masked');
  });

  it('should ensure safeLogger scrubs PINs and sensitive PII from log outputs', () => {
    const logs: string[] = [];
    const originalConsoleInfo = console.info;

    try {
      console.info = (...args: any[]) => {
        logs.push(args.join(' '));
      };

      safeLogger.info('User attempt with pin: 9876 and nid 1234567890');

      assert.equal(logs.length, 1);
      assert.ok(!logs[0].includes('9876'), 'Console log must not contain raw PIN');
      assert.ok(!logs[0].includes('1234567890'), 'Console log must not contain raw NID');
      assert.ok(logs[0].includes('[REDACTED_PIN]'), 'Log should reflect redacted token');
    } finally {
      console.info = originalConsoleInfo;
    }
  });
});
