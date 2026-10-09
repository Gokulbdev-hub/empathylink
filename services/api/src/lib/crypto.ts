import * as argon2 from 'argon2';
import crypto from 'node:crypto';
import { SECURITY_CONFIG } from '@empathylink/config';

export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: SECURITY_CONFIG.ARGON2.memoryCost,
      timeCost: SECURITY_CONFIG.ARGON2.timeCost,
      parallelism: SECURITY_CONFIG.ARGON2.parallelism,
    });
  } catch (err) {
    // Cryptographically secure fallback using pbkdf2 if native argon2 bindings are unavailable
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `pbkdf2$${salt}$${hash}`;
  }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    if (hash.startsWith('pbkdf2$')) {
      const [, salt, originalHash] = hash.split('$');
      const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
      return crypto.timingSafeEqual(Buffer.from(testHash), Buffer.from(originalHash));
    }
    return await argon2.verify(hash, password);
  } catch (err) {
    return false;
  }
}

export function generateSecureId(prefix = 'id'): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function generatePublicCode(universeKey: string): string {
  const shortUniverse = universeKey.slice(0, 2).toUpperCase();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `EL-${shortUniverse}-${randomNum}`;
}
