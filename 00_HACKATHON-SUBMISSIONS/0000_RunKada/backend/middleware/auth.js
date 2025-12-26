import jwt from 'jsonwebtoken';
import { supabaseAdmin, TABLES } from '../config/supabase.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user exists in database
    const { data: user, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const verifyStravaToken = async (req, res, next) => {
  try {
    const { data: tokenData, error } = await supabaseAdmin
      .from(TABLES.STRAVA_TOKENS)
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error || !tokenData) {
      return res.status(401).json({ error: 'No Strava connection found' });
    }

    // Check if token is expired
    const now = new Date();
    const tokenExpiry = new Date(tokenData.expires_at);
    
    if (now >= tokenExpiry) {
      return res.status(401).json({ error: 'Strava token expired. Please reconnect.' });
    }

    req.stravaToken = tokenData;
    next();
  } catch (error) {
    console.error('Strava token verification error:', error);
    return res.status(500).json({ error: 'Error verifying Strava token' });
  }
};
