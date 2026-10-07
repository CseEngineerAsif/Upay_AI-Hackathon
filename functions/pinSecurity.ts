import crypto from 'crypto';

export interface ServerPinRecord {
  userKey: string;
  salt: string;
  hash: string;
  failedAttempts: number;
  lockedUntil: number | null;
  updatedAt: string;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Server-only in-memory store of salted scrypt hashes (never exposed to clients)
const pinStore = new Map<string, ServerPinRecord>();

function normalizeKey(userIdOrPhone: string): string {
  const cleaned = (userIdOrPhone || '').trim();
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length >= 10) {
    return `phone_${digits}`;
  }
  return cleaned || 'default_user';
}

function hashPinWithSalt(plainPin: string, saltHex: string): string {
  const derived = crypto.scryptSync(plainPin, Buffer.from(saltHex, 'hex'), 64);
  return derived.toString('hex');
}

function createPinRecord(userKey: string, plainPin: string): ServerPinRecord {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPinWithSalt(plainPin, salt);
  return {
    userKey,
    salt,
    hash,
    failedAttempts: 0,
    lockedUntil: null,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Seeds the demo user's hashed PIN on the SERVER ONLY when DEMO_MODE is enabled.
 * Plain PIN never exists in client bundles or localStorage.
 */
export function initServerPinSeed(): void {
  const isDemoMode = process.env.DEMO_MODE !== 'false';
  if (!isDemoMode) return;

  const demoPin = process.env.DEMO_USER_PIN || '1234';
  const demoKeys = [
    normalizeKey('01794809461'),
    'user_01794809461',
    'user_main_maynul'
  ];

  const record = createPinRecord('phone_01794809461', demoPin);
  for (const key of demoKeys) {
    pinStore.set(key, { ...record, userKey: key });
  }
}

// Initialize server-side demo seed on module load
initServerPinSeed();

export interface VerifyPinResult {
  valid: boolean;
  locked: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
  error?: string;
}

export function verifyServerPin(userIdOrPhone: string, plainPin: string): VerifyPinResult {
  const key = normalizeKey(userIdOrPhone);
  let record = pinStore.get(key) || pinStore.get(userIdOrPhone);

  // If DEMO_MODE is enabled and user is the demo user, ensure seeded
  if (!record && process.env.DEMO_MODE !== 'false') {
    if (
      key === 'phone_01794809461' ||
      userIdOrPhone === 'user_01794809461' ||
      userIdOrPhone === 'user_main_maynul'
    ) {
      initServerPinSeed();
      record = pinStore.get(key) || pinStore.get(userIdOrPhone);
    }
  }

  if (!record) {
    return {
      valid: false,
      locked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
      error: 'No PIN configured for this account on server'
    };
  }

  const now = Date.now();
  if (record.lockedUntil && now < record.lockedUntil) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      valid: false,
      locked: true,
      remainingAttempts: 0,
      retryAfterSeconds,
      error: `Account locked after ${MAX_FAILED_ATTEMPTS} failed PIN attempts. Try again in ${Math.ceil(retryAfterSeconds / 60)} min.`
    };
  }

  // If lockout period has expired, reset counter
  if (record.lockedUntil && now >= record.lockedUntil) {
    record.failedAttempts = 0;
    record.lockedUntil = null;
  }

  const candidateHex = hashPinWithSalt(plainPin, record.salt);
  const storedBuf = Buffer.from(record.hash, 'hex');
  const candidateBuf = Buffer.from(candidateHex, 'hex');

  const isMatch =
    storedBuf.length === candidateBuf.length &&
    crypto.timingSafeEqual(storedBuf, candidateBuf);

  if (!isMatch) {
    record.failedAttempts += 1;
    if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_DURATION_MS;
      const retryAfterSeconds = Math.ceil(LOCKOUT_DURATION_MS / 1000);
      return {
        valid: false,
        locked: true,
        remainingAttempts: 0,
        retryAfterSeconds,
        error: `Account locked for 15 minutes after ${MAX_FAILED_ATTEMPTS} failed PIN attempts.`
      };
    }
    const remaining = MAX_FAILED_ATTEMPTS - record.failedAttempts;
    return {
      valid: false,
      locked: false,
      remainingAttempts: remaining,
      error: `Invalid PIN. ${remaining} attempt(s) remaining before 15-minute lockout.`
    };
  }

  // Reset failed attempts on success
  record.failedAttempts = 0;
  record.lockedUntil = null;
  return {
    valid: true,
    locked: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS
  };
}

export interface SetPinResult {
  success: boolean;
  error?: string;
  locked?: boolean;
  retryAfterSeconds?: number;
}

export function setServerPin(params: {
  userId?: string;
  phone?: string;
  currentPin?: string;
  newPin: string;
}): SetPinResult {
  const primaryKey = normalizeKey(params.phone || params.userId || '');
  const existing =
    pinStore.get(primaryKey) ||
    (params.userId ? pinStore.get(params.userId) : undefined);

  // If an account already has a PIN set, verify currentPin first
  if (existing) {
    if (!params.currentPin) {
      return {
        success: false,
        error: 'Current PIN is required to change an existing PIN'
      };
    }
    const verifyRes = verifyServerPin(params.phone || params.userId || primaryKey, params.currentPin);
    if (!verifyRes.valid) {
      return {
        success: false,
        locked: verifyRes.locked,
        retryAfterSeconds: verifyRes.retryAfterSeconds,
        error: verifyRes.error || 'Current PIN verification failed'
      };
    }
  }

  const newRecord = createPinRecord(primaryKey, params.newPin);
  pinStore.set(primaryKey, newRecord);
  if (params.userId) {
    pinStore.set(params.userId, { ...newRecord, userKey: params.userId });
  }
  return { success: true };
}
