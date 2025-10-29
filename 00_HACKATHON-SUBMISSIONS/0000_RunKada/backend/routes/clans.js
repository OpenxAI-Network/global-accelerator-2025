import express from 'express';
import { supabaseAdmin, TABLES } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all clans
router.get('/', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const { data: clans, error } = await supabaseAdmin
      .from(TABLES.CLANS)
      .select(`
        *,
        clan_members(count)
      `)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      console.error('Error fetching clans:', error);
      return res.status(500).json({ error: 'Failed to fetch clans' });
    }

    // Format clan data with member count
    const formattedClans = clans.map(clan => ({
      ...clan,
      member_count: clan.clan_members[0]?.count || 0
    }));

    res.json({
      success: true,
      clans: formattedClans
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

    // Format member data
    const members = clan.clan_members.map(member => ({
      id: member.user_id,
      firstname: member.users.firstname,
      lastname: member.users.lastname,
      profile_picture: member.users.profile_picture,
      role: member.role,
      joined_at: member.joined_at
    }));

    res.json({
      success: true,
      clan: {
        ...clan,
        members,
        member_count: members.length
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
