import express from 'express';
import { supabaseAdmin, TABLES } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all clans with Strava-based statistics
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const { data: clans, error } = await supabaseAdmin
      .from(TABLES.CLANS)
      .select(`
        *,
        clan_members(user_id)
      `)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      console.error('Error fetching clans:', error);
      return res.status(500).json({ error: 'Failed to fetch clans' });
    }

    // Calculate Strava-based stats for each clan
    const clansWithStats = await Promise.all(
      clans.map(async (clan) => {
        const memberIds = clan.clan_members.map(m => m.user_id);
        
        if (memberIds.length === 0) {
          return {
            ...clan,
            member_count: 0,
            total_distance: 0,
            avg_distance: 0,
            total_activities: 0
          };
        }

        // Get aggregated activity data for all clan members
        const { data: activities, error: activitiesError } = await supabaseAdmin
          .from(TABLES.ACTIVITIES)
          .select('distance')
          .in('user_id', memberIds);

        if (activitiesError) {
          console.error('Error fetching clan activities:', activitiesError);
          return {
            ...clan,
            member_count: memberIds.length,
            total_distance: 0,
            avg_distance: 0,
            total_activities: 0
          };
        }

        const totalDistance = activities.reduce((sum, act) => sum + (parseFloat(act.distance) || 0), 0);
        const totalActivities = activities.length;
        const avgDistance = memberIds.length > 0 ? totalDistance / memberIds.length : 0;

        return {
          ...clan,
          member_count: memberIds.length,
          total_distance: totalDistance,
          avg_distance: avgDistance,
          total_activities: totalActivities
        };
      })
    );

    res.json({
      success: true,
      clans: clansWithStats
    });

  } catch (error) {
    console.error('Error fetching clans:', error);
    res.status(500).json({ error: 'Failed to fetch clans' });
  }
});

// Get specific clan details
router.get('/:clanId', async (req, res) => {
  try {
    const { clanId } = req.params;
    
    const { data: clan, error } = await supabaseAdmin
      .from(TABLES.CLANS)
      .select(`
        *,
        clan_members(
          *,
          users(firstname, lastname, profile_picture)
        )
      `)
      .eq('id', clanId)
      .single();

    if (error) {
      console.error('Error fetching clan:', error);
      return res.status(500).json({ error: 'Failed to fetch clan details' });
    }

    if (!clan) {
      return res.status(404).json({ error: 'Clan not found' });
    }

    // Format member data and get their Strava stats
    const membersWithStats = await Promise.all(
      clan.clan_members.map(async (member) => {
        // Get member's total distance from Strava activities
        const { data: activities, error: activitiesError } = await supabaseAdmin
          .from(TABLES.ACTIVITIES)
          .select('distance')
          .eq('user_id', member.user_id);

        const totalDistance = activities && !activitiesError
          ? activities.reduce((sum, act) => sum + (parseFloat(act.distance) || 0), 0)
          : 0;

        return {
          id: member.user_id,
          firstname: member.users.firstname,
          lastname: member.users.lastname,
          profile_picture: member.users.profile_picture,
          role: member.role,
          joined_at: member.joined_at,
          total_distance: totalDistance,
          activity_count: activities?.length || 0
        };
      })
    );

    // Sort members by total distance (descending)
    membersWithStats.sort((a, b) => b.total_distance - a.total_distance);

    res.json({
      success: true,
      clan: {
        ...clan,
        members: membersWithStats,
        member_count: membersWithStats.length
      }
    });

  } catch (error) {
    console.error('Error fetching clan details:', error);
    res.status(500).json({ error: 'Failed to fetch clan details' });
  }
});

// Create a new clan
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, is_private = false } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Clan name is required' });
    }

    // Check if user is already in a clan
    const { data: existingMembership, error: membershipError } = await supabaseAdmin
      .from(TABLES.CLAN_MEMBERS)
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (membershipError && membershipError.code !== 'PGRST116') {
      console.error('Error checking existing membership:', membershipError);
      return res.status(500).json({ error: 'Failed to check existing membership' });
    }

    if (existingMembership) {
      return res.status(400).json({ error: 'You are already a member of a clan' });
    }

    // Create the clan
    const { data: clan, error: clanError } = await supabaseAdmin
      .from(TABLES.CLANS)
      .insert({
        name,
        description,
        is_private,
        created_by: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (clanError) {
      console.error('Error creating clan:', clanError);
      return res.status(500).json({ error: 'Failed to create clan' });
    }

    // Add creator as admin member
    const { error: memberError } = await supabaseAdmin
      .from(TABLES.CLAN_MEMBERS)
      .insert({
        clan_id: clan.id,
        user_id: req.user.id,
        role: 'admin',
        joined_at: new Date().toISOString()
      });

    if (memberError) {
      console.error('Error adding creator to clan:', memberError);
      return res.status(500).json({ error: 'Failed to add creator to clan' });
    }

    res.status(201).json({
      success: true,
      clan: {
        ...clan,
        member_count: 1
      }
    });

  } catch (error) {
    console.error('Error creating clan:', error);
    res.status(500).json({ error: 'Failed to create clan' });
  }
});

// Join a clan
router.post('/:clanId/join', authenticateToken, async (req, res) => {
  try {
    const { clanId } = req.params;
    
    // Check if user is already in a clan
    const { data: existingMembership, error: membershipError } = await supabaseAdmin
      .from(TABLES.CLAN_MEMBERS)
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (membershipError && membershipError.code !== 'PGRST116') {
      console.error('Error checking existing membership:', membershipError);
      return res.status(500).json({ error: 'Failed to check existing membership' });
    }

    if (existingMembership) {
      return res.status(400).json({ error: 'You are already a member of a clan' });
    }

    // Check if clan exists and is not private
    const { data: clan, error: clanError } = await supabaseAdmin
      .from(TABLES.CLANS)
      .select('*')
      .eq('id', clanId)
      .single();

    if (clanError) {
      console.error('Error fetching clan:', clanError);
      return res.status(500).json({ error: 'Failed to fetch clan' });
    }

    if (!clan) {
      return res.status(404).json({ error: 'Clan not found' });
    }

    if (clan.is_private) {
      return res.status(403).json({ error: 'This clan is private. You need an invitation to join.' });
    }

    // Add user to clan
    const { error: joinError } = await supabaseAdmin
      .from(TABLES.CLAN_MEMBERS)
      .insert({
        clan_id: clanId,
        user_id: req.user.id,
        role: 'member',
        joined_at: new Date().toISOString()
      });

    if (joinError) {
      console.error('Error joining clan:', joinError);
      return res.status(500).json({ error: 'Failed to join clan' });
    }

    res.json({
      success: true,
      message: 'Successfully joined clan'
    });

  } catch (error) {
    console.error('Error joining clan:', error);
    res.status(500).json({ error: 'Failed to join clan' });
  }
});

// Get clan leaderboard (ranked by total distance from Strava activities)
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

    // Get all clans with their members and aggregate their Strava activities
    const { data: clans, error: clansError } = await supabaseAdmin
      .from(TABLES.CLANS)
      .select(`
        id,
        name,
        description,
        created_at,
        clan_members(user_id)
      `);

    if (clansError) {
      console.error('Error fetching clans:', clansError);
      return res.status(500).json({ error: 'Failed to fetch clans' });
    }

    // Calculate total distance for each clan based on member activities
    const clanStats = await Promise.all(
      clans.map(async (clan) => {
        const memberIds = clan.clan_members.map(m => m.user_id);
        
        if (memberIds.length === 0) {
          return {
            ...clan,
            total_distance: 0,
            member_count: 0,
            avg_distance: 0,
            total_activities: 0
          };
        }

        // Get aggregated activity data for all clan members
        let query = supabaseAdmin
          .from(TABLES.ACTIVITIES)
          .select('distance, user_id')
          .in('user_id', memberIds);

        if (dateFilter.gte) {
          query = query.gte('start_date', dateFilter.gte);
        }

        const { data: activities, error: activitiesError } = await query;

        if (activitiesError) {
          console.error('Error fetching clan activities:', activitiesError);
          return {
            ...clan,
            total_distance: 0,
            member_count: memberIds.length,
            avg_distance: 0,
            total_activities: 0
          };
        }

        const totalDistance = activities.reduce((sum, act) => sum + (parseFloat(act.distance) || 0), 0);
        const totalActivities = activities.length;
        const avgDistance = memberIds.length > 0 ? totalDistance / memberIds.length : 0;

        return {
          id: clan.id,
          name: clan.name,
          description: clan.description,
          created_at: clan.created_at,
          total_distance: totalDistance,
          member_count: memberIds.length,
          avg_distance: avgDistance,
          total_activities: totalActivities
        };
      })
    );

    // Sort by total distance and add rank
    const rankedClans = clanStats
      .filter(clan => clan.member_count > 0)
      .sort((a, b) => b.total_distance - a.total_distance)
      .slice(0, parseInt(limit))
      .map((clan, index) => ({
        ...clan,
        rank: index + 1
      }));

    res.json({
      success: true,
      leaderboard: rankedClans,
      period,
      total_clans: rankedClans.length
    });

  } catch (error) {
    console.error('Error fetching clan leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch clan leaderboard' });
  }
});

// Leave a clan
router.post('/:clanId/leave', authenticateToken, async (req, res) => {
  try {
    const { clanId } = req.params;
    
    // Check if user is a member of this clan
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from(TABLES.CLAN_MEMBERS)
      .select('*')
      .eq('clan_id', clanId)
      .eq('user_id', req.user.id)
      .single();

    if (membershipError) {
      console.error('Error checking membership:', membershipError);
      return res.status(500).json({ error: 'Failed to check membership' });
    }

    if (!membership) {
      return res.status(404).json({ error: 'You are not a member of this clan' });
    }

    // If user is admin, check if there are other admins
    if (membership.role === 'admin') {
      const { data: otherAdmins, error: adminError } = await supabaseAdmin
        .from(TABLES.CLAN_MEMBERS)
        .select('*')
        .eq('clan_id', clanId)
        .eq('role', 'admin')
        .neq('user_id', req.user.id);

      if (adminError) {
        console.error('Error checking other admins:', adminError);
        return res.status(500).json({ error: 'Failed to check admin status' });
      }

      if (otherAdmins.length === 0) {
        return res.status(400).json({ error: 'Cannot leave clan as the only admin. Transfer ownership or promote another member first.' });
      }
    }

    // Remove user from clan
    const { error: leaveError } = await supabaseAdmin
      .from(TABLES.CLAN_MEMBERS)
      .delete()
      .eq('clan_id', clanId)
      .eq('user_id', req.user.id);

    if (leaveError) {
      console.error('Error leaving clan:', leaveError);
      return res.status(500).json({ error: 'Failed to leave clan' });
    }

    res.json({
      success: true,
      message: 'Successfully left clan'
    });

  } catch (error) {
    console.error('Error leaving clan:', error);
    res.status(500).json({ error: 'Failed to leave clan' });
  }
});

export default router;
