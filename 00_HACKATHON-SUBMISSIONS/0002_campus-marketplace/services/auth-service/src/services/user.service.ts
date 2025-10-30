import { pool } from '../database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const findUserByEmail = async (email: string) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const findUserById = async (id: number) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
};

export const createPasswordResetToken = async (email: string) => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
        'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE email = $3',
        [passwordResetToken, passwordResetExpires, email]
    );

    return resetToken;
};

export const findUserByResetToken = async (token: string) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
        [token]
    );
    return result.rows[0] || null;
};

export const updateUserPassword = async (userId: number, password: string) => {
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
        'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
        [passwordHash, userId]
    );
};

export const updateUserProfile = async (userId: number, updates: { name?: string; school?: string; bio?: string; phone?: string; avatar?: string; }) => {
  const fields = [];
  const values = [];
  let query = 'UPDATE users SET ';

  let i = 1;
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      fields.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }

  // If no fields to update, just return the user
  if (fields.length === 0) {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    return userResult.rows[0] || null;
  }

  query += fields.join(', ');
  query += `, updated_at = NOW() WHERE id = $${i} RETURNING *`;
  values.push(userId);

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const createUser = async (name: string, email: string, password: string, school: string) => {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (name, email, password_hash, school) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, passwordHash, school]
    );
    return result.rows[0] || null;
};

export const loginUser = async (email: string, password: string) => {
    const user = await findUserByEmail(email);
    if (!user) {
        return null;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
        return null;
    }

    return user;
};
