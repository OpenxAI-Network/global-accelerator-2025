import { pool } from '../database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const OTP_EXPIRATION_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 * @returns A 6-digit OTP as a string.
 */
function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Creates and stores a new OTP for a given email and flow.
 * It invalidates any previous OTPs for the same email and flow.
 * @param email The user's email.
 * @param flow The OTP flow (e.g., 'SIGNUP', 'FORGOT_PASSWORD').
 * @returns The raw, un-hashed OTP to be sent to the user.
 */
export async function createOtp(email: string, flow: string): Promise<string> {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  // Invalidate previous OTPs for the same flow to prevent misuse.
  await pool.query(
    'UPDATE otps SET used = TRUE WHERE email = $1 AND flow = $2 AND used = FALSE',
    [email, flow]
  );

  // Insert the new OTP
  await pool.query(
    'INSERT INTO otps (email, otp_hash, flow, expires_at) VALUES ($1, $2, $3, $4)',
    [email, otpHash, flow, expiresAt]
  );

  return otp;
}

/**
 * Verifies an OTP for a given email and flow.
 * @param email The user's email.
 * @param otp The 6-digit OTP provided by the user.
 * @param flow The OTP flow.
 * @returns An object indicating success or an error message.
 */
export async function verifyOtp(email: string, otp: string, flow: string): Promise<{ success: boolean; message: string }> {
  const result = await pool.query(
    'SELECT * FROM otps WHERE email = $1 AND flow = $2 AND used = FALSE ORDER BY created_at DESC LIMIT 1',
    [email, flow]
  );

  const storedOtp = result.rows[0];

  if (!storedOtp) {
    return { success: false, message: 'No valid OTP found. Please request a new one.' };
  }

  if (new Date() > new Date(storedOtp.expires_at)) {
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (storedOtp.attempts >= MAX_OTP_ATTEMPTS) {
    return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }

  const isMatch = await bcrypt.compare(otp, storedOtp.otp_hash);

  if (!isMatch) {
    await pool.query('UPDATE otps SET attempts = attempts + 1 WHERE id = $1', [storedOtp.id]);
    return { success: false, message: 'Invalid OTP.' };
  }

  await pool.query('UPDATE otps SET used = TRUE WHERE id = $1', [storedOtp.id]);

  return { success: true, message: 'OTP verified successfully.' };
}
