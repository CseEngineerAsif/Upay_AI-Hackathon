/**
 * Privacy Guardrails & Sanitization
 * Enforces masking of PII, stripping of PINs, NIDs, passwords,
 * and prompt injection defense.
 */

// Phone number regex for Bangladeshi & international formats
const PHONE_REGEX = /(?:\+?880|0)1[3-9]\d{8}\b/g;

// Standalone 4 to 6 digit numbers (potential PINs or OTPs)
// Especially matches when near pin/otp keywords or standard 4-6 digit numeric codes
const PIN_KEYWORD_REGEX = /(?:pin|পিন|otp|ওটিপি|code|কোড|password|পাসওয়ার্ড)[:=\s]*(\d{4,6})\b/gi;
const STANDALONE_PIN_REGEX = /\b\d{4,6}\b/g;

// NID (10, 13, or 17 digits)
const NID_REGEX = /\b(?:\d{10}|\d{13}|\d{17})\b/g;

// Passwords / secrets
const PASSWORD_REGEX = /(?:password|passwd|পাসওয়ার্ড|secret|apikey|api_key)[:=\s]*([^\s,;]+)/gi;

// Prompt injection keywords
const PROMPT_INJECTION_REGEX = /(?:system\s+prompt|ignore\s+(?:all\s+)?previous|you\s+are\s+now|disregard\s+all|override\s+instructions|drop\s+table|delete\s+all|<script|<\/script|<svg)/gi;

/**
 * Masks phone numbers to safe privacy format (e.g. 01794809461 -> 017***461)
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '01X***XXXX';
  const clean = phone.replace(/[\s-]/g, '');
  if (clean.length < 8) return '01X***';
  return clean.slice(0, 3) + '***' + clean.slice(-3);
}

/**
 * Masks Bangladeshi National ID (NID)
 */
export function maskNid(nid?: string): string {
  if (!nid) return '[REDACTED_NID]';
  const clean = nid.replace(/[\s-]/g, '');
  if (clean.length <= 4) return '[REDACTED_NID]';
  return clean.slice(0, 2) + '******' + clean.slice(-2);
}

/**
 * Masks user name for privacy (e.g. MD. AL-MAYNUL HASAN -> M*** H***)
 */
export function maskName(name?: string): string {
  if (!name) return 'গ্রাহক';
  const parts = name.trim().split(/\s+/);
  return parts.map(p => (p.length > 1 ? p[0] + '***' : p)).join(' ');
}

/**
 * Strips all sensitive secrets (PINs, passwords, NIDs) from text
 */
export function stripSecrets(text?: string): string {
  if (!text) return '';
  return text
    .replace(PIN_KEYWORD_REGEX, '[REDACTED_PIN]')
    .replace(PASSWORD_REGEX, '[REDACTED_SECRET]')
    .replace(NID_REGEX, '[REDACTED_NID]');
}

/**
 * Complete privacy sanitizer: strips PINs, NIDs, masks phones, and sanitizes prompt injections.
 * Use before sending user text to Gemini or writing to persistent logs.
 */
export function sanitizePrivacyText(text?: string): string {
  if (!text) return '';
  let sanitized = String(text);

  // 1. Escape XML/delimiter characters from raw user text first
  sanitized = sanitized.replace(/[<>{}[\]\\]/g, ' ');

  // 2. Strip password and secret declarations
  sanitized = sanitized.replace(PASSWORD_REGEX, '[REDACTED_SECRET]');

  // 3. Strip explicit PIN declarations
  sanitized = sanitized.replace(PIN_KEYWORD_REGEX, '[REDACTED_PIN]');

  // 4. Strip Bangladeshi National IDs (10, 13, 17 digits)
  sanitized = sanitized.replace(NID_REGEX, '[REDACTED_NID]');

  // 5. Mask phone numbers
  sanitized = sanitized.replace(PHONE_REGEX, match => maskPhoneNumber(match));

  // 6. Redact prompt injection markers
  sanitized = sanitized.replace(PROMPT_INJECTION_REGEX, '[SECURITY_FILTERED]');

  // 7. Strip standalone 4-digit PINs if suspicious
  sanitized = sanitized.replace(/\b(?:\d{4})\b/g, '[REDACTED_NUM]');

  return sanitized.trim().slice(0, 1000);
}

/**
 * Delimited block wrapper for prompt injection defense.
 * Ensures user-supplied input is clearly demarcated from system instructions.
 */
export function formatUntrustedUserInput(input: string): string {
  const sanitized = sanitizePrivacyText(input);
  return `<<<USER_SUPPLIED_DATA_START>>>\n${sanitized}\n<<<USER_SUPPLIED_DATA_END>>>`;
}

/**
 * Safe logger that ensures PINs and raw PII are never printed to stdout/stderr.
 */
export const safeLogger = {
  info: (...args: any[]) => {
    const sanitized = args.map(arg =>
      typeof arg === 'string' ? sanitizePrivacyText(arg) : arg
    );
    console.info(...sanitized);
  },
  warn: (...args: any[]) => {
    const sanitized = args.map(arg =>
      typeof arg === 'string' ? sanitizePrivacyText(arg) : arg
    );
    console.warn(...sanitized);
  },
  error: (...args: any[]) => {
    const sanitized = args.map(arg =>
      typeof arg === 'string' ? sanitizePrivacyText(arg) : arg
    );
    console.error(...sanitized);
  }
};
