import express from 'express';
import { supabaseAdmin, TABLES } from '../config/supabase.js';
import { getStravaAuthUrl, exchangeCodeForToken, getStravaAthlete, refreshStravaToken } from '../config/strava.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Get Strava authorization URL
router.get('/strava/url', async (req, res) => {
  try {
    // If already authenticated and connected to Strava, prevent re-authorizing
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const jwtPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const userId = jwtPayload.userId;
        if (userId) {
          const { data: existing, error } = await supabaseAdmin
            .from(TABLES.STRAVA_TOKENS)
            .select('user_id')
            .eq('user_id', userId)
            .maybeSingle();

          if (!error && existing) {
            return res.json({ alreadyAuthorized: true });
          }
        }
      } catch (_e) {
        // ignore JWT parse errors and proceed to provide authUrl
      }
    }

    const authUrl = getStravaAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating Strava auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

// Handle Strava OAuth callback (GET request from Strava)
router.get('/strava/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      return res.status(400).json({ error: `Strava authorization failed: ${error}` });
    }
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);
    const { access_token, refresh_token, expires_at, athlete } = tokenData;

    // Get detailed athlete information
    const athleteData = await getStravaAthlete(access_token);

    // Check if user already exists
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('*')
      .eq('strava_id', athleteData.id.toString())
      .single();

    let userId;
    
    if (existingUser) {
      // Update existing user
      userId = existingUser.id;
      const { error: updateError } = await supabaseAdmin
        .from(TABLES.USERS)
        .update({
          firstname: athleteData.firstname,
          lastname: athleteData.lastname,
          profile_picture: athleteData.profile,
          city: athleteData.city,
          state: athleteData.state,
          country: athleteData.country,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user:', updateError);
        return res.status(500).json({ error: 'Failed to update user data' });
      }
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin
        .from(TABLES.USERS)
        .insert({
          strava_id: athleteData.id.toString(),
          firstname: athleteData.firstname,
          lastname: athleteData.lastname,
          email: athleteData.email || null,
          profile_picture: athleteData.profile,
          city: athleteData.city,
          state: athleteData.state,
          country: athleteData.country,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      userId = newUser.id;
    }

    // Store or update Strava tokens
    const { error: tokenError } = await supabaseAdmin
      .from(TABLES.STRAVA_TOKENS)
      .upsert({
        user_id: userId,
        access_token,
        refresh_token,
        expires_at: new Date(expires_at * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (tokenError) {
      console.error('Error storing Strava tokens:', tokenError);
      return res.status(500).json({ error: 'Failed to store authentication tokens' });
    }

    // Generate JWT token
    const jwtToken = generateToken(userId);

    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/?token=${jwtToken}&user=${encodeURIComponent(JSON.stringify({
      id: userId,
      firstname: athleteData.firstname,
      lastname: athleteData.lastname,
      profile_picture: athleteData.profile,
      strava_id: athleteData.id
    }))}`);

  } catch (error) {
    console.error('Strava callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`);
  }
});

// Handle Strava OAuth callback (POST request for API)
router.post('/strava/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);
    const { access_token, refresh_token, expires_at, athlete } = tokenData;

    // Get detailed athlete information
    const athleteData = await getStravaAthlete(access_token);

    // Check if user already exists
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('*')
      .eq('strava_id', athleteData.id.toString())
      .single();

    let userId;
    
    if (existingUser) {
      // Update existing user
      userId = existingUser.id;
      const { error: updateError } = await supabaseAdmin
        .from(TABLES.USERS)
        .update({
          firstname: athleteData.firstname,
          lastname: athleteData.lastname,
          profile_picture: athleteData.profile,
          city: athleteData.city,
          state: athleteData.state,
          country: athleteData.country,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user:', updateError);
        return res.status(500).json({ error: 'Failed to update user data' });
      }
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin
        .from(TABLES.USERS)
        .insert({
          strava_id: athleteData.id.toString(),
          firstname: athleteData.firstname,
          lastname: athleteData.lastname,
          email: athleteData.email || null,
          profile_picture: athleteData.profile,
          city: athleteData.city,
          state: athleteData.state,
          country: athleteData.country,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      userId = newUser.id;
    }

    // Store or update Strava tokens
    const { error: tokenError } = await supabaseAdmin
      .from(TABLES.STRAVA_TOKENS)
      .upsert({
        user_id: userId,
        access_token,
        refresh_token,
        expires_at: new Date(expires_at * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (tokenError) {
      console.error('Error storing Strava tokens:', tokenError);
      return res.status(500).json({ error: 'Failed to store authentication tokens' });
    }

    // Generate JWT token
    const jwtToken = generateToken(userId);

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: userId,
        firstname: athleteData.firstname,
        lastname: athleteData.lastname,
        profile_picture: athleteData.profile,
        strava_id: athleteData.id
      }
    });

  } catch (error) {
    console.error('Strava callback error:', error);
    res.status(500).json({ error: error.message || 'Authentication failed' });
  }
});

// Refresh Strava token
router.post('/strava/refresh', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Get current refresh token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from(TABLES.STRAVA_TOKENS)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return res.status(404).json({ error: 'No Strava tokens found' });
    }

    // Refresh the token
    const newTokenData = await refreshStravaToken(tokenData.refresh_token);

    // Update tokens in database
    const { error: updateError } = await supabaseAdmin
      .from(TABLES.STRAVA_TOKENS)
      .update({
        access_token: newTokenData.access_token,
        refresh_token: newTokenData.refresh_token,
        expires_at: new Date(newTokenData.expires_at * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating refreshed tokens:', updateError);
      return res.status(500).json({ error: 'Failed to update tokens' });
    }

    res.json({ success: true, message: 'Token refreshed successfully' });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: error.message || 'Failed to refresh token' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the JWT token
    // For now, we'll just return success as the client will remove the token
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
