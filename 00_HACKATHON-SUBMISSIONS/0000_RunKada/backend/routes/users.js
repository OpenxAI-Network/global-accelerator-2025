import express from 'express';
import { supabaseAdmin, TABLES } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    // Remove sensitive data
    const { created_at, updated_at, ...publicProfile } = user;

    res.json({
      success: true,
      user: publicProfile
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstname, lastname, city, state, country } = req.body;
    
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (firstname) updateData.firstname = firstname;
    if (lastname) updateData.lastname = lastname;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (country) updateData.country = country;

    const { data: user, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ error: 'Failed to update user profile' });
    }

    // Remove sensitive data
    const { created_at, updated_at, ...publicProfile } = user;

    res.json({
      success: true,
      user: publicProfile
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get user leaderboard data (public endpoint)
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all', limit = 50 } = req.query;
    
    let dateFilter = {};
    
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter.gte = weekAgo.toISOString();
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter.gte = monthAgo.toISOString();
    } else if (period === 'year') {
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      dateFilter.gte = yearAgo.toISOString();
    }

    // Get user statistics for leaderboard with clan information
    const { data: leaderboard, error } = await supabaseAdmin
      .from(TABLES.ACTIVITIES)
      .select(`
        user_id,
        users!inner(firstname, lastname, profile_picture),
        count(*) as activity_count,
        sum(distance) as total_distance,
        sum(moving_time) as total_moving_time,
        sum(total_elevation_gain) as total_elevation_gain
      `)
      .gte('start_date', dateFilter.gte || '1900-01-01')
      .group('user_id, users.firstname, users.lastname, users.profile_picture')
      .order('total_distance', { ascending: false })
      .limit(parseInt(limit));

    // Get clan information for each user
    const userIds = leaderboard.map(entry => entry.user_id);
    const { data: clanMemberships, error: clanError } = await supabaseAdmin
      .from(TABLES.CLAN_MEMBERS)
      .select(`
        user_id,
        clans(name)
      `)
      .in('user_id', userIds);

    // Create a map of user_id to clan name
    const userClanMap = {};
    if (clanMemberships && !clanError) {
      clanMemberships.forEach(membership => {
        userClanMap[membership.user_id] = membership.clans?.name || null;
      });
    }

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }

    // Format leaderboard data with clan information
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      user_id: entry.user_id,
      name: `${entry.users.firstname} ${entry.users.lastname}`,
      profile_picture: entry.users.profile_picture,
      clan: userClanMap[entry.user_id] || null,
      activity_count: parseInt(entry.activity_count),
      total_distance: parseFloat(entry.total_distance) || 0,
      total_moving_time: parseInt(entry.total_moving_time) || 0,
      total_elevation_gain: parseFloat(entry.total_elevation_gain) || 0
    }));

    res.json({
      success: true,
      leaderboard: formattedLeaderboard,
      period,
      total_users: leaderboard.length
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user's clan information
router.get('/clan', authenticateToken, async (req, res) => {
  try {
    const { data: clanMembership, error } = await supabaseAdmin
      .from(TABLES.CLAN_MEMBERS)
      .select(`
        *,
        clans(*)
      `)
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching clan membership:', error);
      return res.status(500).json({ error: 'Failed to fetch clan information' });
    }

    res.json({
      success: true,
      clan: clanMembership ? clanMembership.clans : null,
      membership: clanMembership ? {
        joined_at: clanMembership.joined_at,
        role: clanMembership.role
      } : null
    });

  } catch (error) {
    console.error('Error fetching clan information:', error);
    res.status(500).json({ error: 'Failed to fetch clan information' });
  }
});

export default router;
