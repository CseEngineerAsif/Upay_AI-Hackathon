export type FraudBlocklistSource =
  | 'bangladesh_bank_alert'
  | 'analyst_escalation'
  | 'community_verified'
  | 'mfs_federated_feed';

export interface FraudBlocklistEntry {
  phoneHash: string;
  maskedPhone?: string;
  source: FraudBlocklistSource;
  addedBy: string;
  addedAt: string;
  version: number;
  status: 'active' | 'revoked';
  reason?: string;
}

// Pure FIPS 180-4 SHA-256 implementation (works identically in Node.js and Browser without Node built-ins)
const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

function rotr(n: number, x: number): number {
  return (x >>> n) | (x << (32 - n));
}

function sha256Hex(ascii: string): string {
  const bytes = new TextEncoder().encode(ascii);
  const bitLen = bytes.length * 8;
  const totalBytes = (((bytes.length + 8) >> 6) + 1) << 6;
  const buf = new Uint8Array(totalBytes);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(totalBytes - 4, bitLen >>> 0, false);
  view.setUint32(totalBytes - 8, Math.floor(bitLen / 0x100000000), false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let offset = 0; offset < totalBytes; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
      const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map(v => v.toString(16).padStart(8, '0'))
    .join('');
}

/**
 * Normalizes a Bangladeshi phone number to standard 11-digit format before SHA-256 hashing.
 */
export function normalizePhoneForHash(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.startsWith('8801') && digits.length === 13) {
    return digits.slice(2);
  }
  return digits;
}

/**
 * Computes the governed SHA-256 hex digest of a normalized phone number.
 * Raw phone numbers are never stored in the blocklist collection.
 */
export function hashPhoneSha256(phone: string): string {
  const normalized = normalizePhoneForHash(phone);
  return sha256Hex(normalized);
}

function maskPhoneDisplay(phone: string): string {
  const norm = normalizePhoneForHash(phone);
  if (norm.length < 7) return '***';
  return `${norm.slice(0, 3)}****${norm.slice(-4)}`;
}

// Governed blocklist state with monotonic versioning
let currentBlocklistVersion = 1;
const blocklistCache = new Map<string, FraudBlocklistEntry>();

// Seed initial governed SHA-256 entries (computed from test vectors at startup, never stored as plain numbers)
const INITIAL_GOVERNED_ENTRIES: Array<{
  rawTestVector: string;
  source: FraudBlocklistSource;
  reason: string;
}> = [
  {
    rawTestVector: '01700000000',
    source: 'bangladesh_bank_alert',
    reason: 'Confirmed lottery & fake prize advance-fee mule account'
  },
  {
    rawTestVector: '01999999999',
    source: 'analyst_escalation',
    reason: 'Impersonation scam ring targeting MFS PIN/OTP'
  },
  {
    rawTestVector: '01812345678',
    source: 'mfs_federated_feed',
    reason: 'Cross-wallet high-velocity cash-out mule'
  },
  {
    rawTestVector: '01300001111',
    source: 'community_verified',
    reason: 'Multiple verified F-Commerce non-delivery complaints'
  }
];

function seedGovernedBlocklist(): void {
  const timestamp = '2026-03-01T00:00:00.000Z';
  for (const item of INITIAL_GOVERNED_ENTRIES) {
    const phoneHash = hashPhoneSha256(item.rawTestVector);
    blocklistCache.set(phoneHash, {
      phoneHash,
      maskedPhone: maskPhoneDisplay(item.rawTestVector),
      source: item.source,
      addedBy: 'system_governance_seed',
      addedAt: timestamp,
      version: currentBlocklistVersion,
      status: 'active',
      reason: item.reason
    });
  }
}

seedGovernedBlocklist();

/**
 * Synchronously checks whether a phone number's SHA-256 hash is active in the governed blocklist.
 */
export function isPhoneHashBlocklisted(phone: string): {
  listed: boolean;
  entry?: FraudBlocklistEntry;
  blocklistVersion: number;
  phoneHash: string;
} {
  const phoneHash = hashPhoneSha256(phone);
  const entry = blocklistCache.get(phoneHash);
  const listed = Boolean(entry && entry.status === 'active');
  return {
    listed,
    entry: listed ? entry : undefined,
    blocklistVersion: currentBlocklistVersion,
    phoneHash
  };
}

export function getBlocklistVersion(): number {
  return currentBlocklistVersion;
}

export function listBlocklistEntries(): FraudBlocklistEntry[] {
  return Array.from(blocklistCache.values()).sort((a, b) =>
    b.addedAt.localeCompare(a.addedAt)
  );
}

/**
 * Admin-only governed addition to `fraud_blocklist`.
 */
export async function addBlocklistEntry(params: {
  phone?: string;
  phoneHash?: string;
  source: FraudBlocklistSource;
  addedBy: string;
  reason?: string;
}): Promise<FraudBlocklistEntry> {
  const computedHash = params.phoneHash
    ? params.phoneHash.toLowerCase().trim()
    : hashPhoneSha256(params.phone || '');

  if (!/^[a-f0-9]{64}$/.test(computedHash)) {
    throw new Error('Invalid SHA-256 phoneHash');
  }

  currentBlocklistVersion += 1;
  const entry: FraudBlocklistEntry = {
    phoneHash: computedHash,
    maskedPhone: params.phone ? maskPhoneDisplay(params.phone) : 'sha256-only',
    source: params.source,
    addedBy: params.addedBy,
    addedAt: new Date().toISOString(),
    version: currentBlocklistVersion,
    status: 'active',
    reason: params.reason || 'Admin governance blocklist addition'
  };

  blocklistCache.set(computedHash, entry);
  return entry;
}

/**
 * Admin-only governed removal/revocation from `fraud_blocklist`.
 */
export async function removeBlocklistEntry(
  phoneOrHash: string,
  removedBy: string
): Promise<{ removed: boolean; phoneHash: string; version: number }> {
  const cleaned = phoneOrHash.trim().toLowerCase();
  const targetHash = /^[a-f0-9]{64}$/.test(cleaned)
    ? cleaned
    : hashPhoneSha256(cleaned);

  const existing = blocklistCache.get(targetHash);
  if (!existing || existing.status === 'revoked') {
    return { removed: false, phoneHash: targetHash, version: currentBlocklistVersion };
  }

  currentBlocklistVersion += 1;
  const updated: FraudBlocklistEntry = {
    ...existing,
    status: 'revoked',
    addedBy: removedBy,
    version: currentBlocklistVersion
  };
  blocklistCache.set(targetHash, updated);

  return { removed: true, phoneHash: targetHash, version: currentBlocklistVersion };
}
