import express from 'express';
import { supabaseAdmin, TABLES } from '../config/supabase.js';
import { getStravaActivities } from '../config/strava.js';
import { authenticateToken, verifyStravaToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's activities
router.get('/', authenticateToken, verifyStravaToken, async (req, res) => {
  try {
    const { page = 1, per_page = 30 } = req.query;
    
    // Get activities from Strava
    const activities = await getStravaActivities(
      req.stravaToken.access_token,
      parseInt(page),
      parseInt(per_page)
    );

    // Filter for running activities only
    const runningActivities = activities.filter(activity => 
      activity.type === 'Run' || activity.sport_type === 'Running'
    );

    // Store activities in database for caching and analytics
    if (runningActivities.length > 0) {
      const activitiesToStore = runningActivities.map(activity => ({
        user_id: req.user.id,
        strava_activity_id: activity.id.toString(),
        name: activity.name,
        distance: activity.distance,
        moving_time: activity.moving_time,
        elapsed_time: activity.elapsed_time,
        total_elevation_gain: activity.total_elevation_gain,
        type: activity.type,
        sport_type: activity.sport_type,
        start_date: activity.start_date,
        start_date_local: activity.start_date_local,
        timezone: activity.timezone,
        utc_offset: activity.utc_offset,
        location_country: activity.location_country,
        location_state: activity.location_state,
        location_city: activity.location_city,
        achievement_count: activity.achievement_count,
        kudos_count: activity.kudos_count,
        comment_count: activity.comment_count,
        athlete_count: activity.athlete_count,
        photo_count: activity.photo_count,
        map: activity.map,
        trainer: activity.trainer,
        commute: activity.commute,
        manual: activity.manual,
        private: activity.private,
        flagged: activity.flagged,
        gear_id: activity.gear_id,
        from_accepted_tag: activity.from_accepted_tag,
        average_speed: activity.average_speed,
        max_speed: activity.max_speed,
        average_cadence: activity.average_cadence,
        average_temp: activity.average_temp,
        has_heartrate: activity.has_heartrate,
        average_heartrate: activity.average_heartrate,
        max_heartrate: activity.max_heartrate,
        heartrate_opt_out: activity.heartrate_opt_out,
        display_hide_heartrate_option: activity.display_hide_heartrate_option,
        elev_high: activity.elev_high,
        elev_low: activity.elev_low,
        upload_id: activity.upload_id,
        upload_id_str: activity.upload_id_str,
        external_id: activity.external_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Upsert activities (insert or update if exists)
      const { error: storeError } = await supabaseAdmin
        .from(TABLES.ACTIVITIES)
        .upsert(activitiesToStore, { 
          onConflict: 'user_id,strava_activity_id',
          ignoreDuplicates: false 
        });

      if (storeError) {
        console.error('Error storing activities:', storeError);
        // Don't fail the request, just log the error
      }
    }

    res.json({
      success: true,
      activities: runningActivities,
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: runningActivities.length
      }
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch activities' });
  }
});

// Get user's activity statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { data: stats, error } = await supabaseAdmin
      .from(TABLES.ACTIVITIES)
      .select(`
        count(*),
        sum(distance) as total_distance,
        sum(moving_time) as total_moving_time,
        sum(total_elevation_gain) as total_elevation_gain,
        avg(average_speed) as avg_speed,
        max(average_speed) as max_speed
      `)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error fetching activity stats:', error);
      return res.status(500).json({ error: 'Failed to fetch activity statistics' });
    }

    const result = stats[0];
    
    res.json({
      success: true,
      stats: {
        total_activities: parseInt(result.count) || 0,
        total_distance: parseFloat(result.total_distance) || 0,
        total_moving_time: parseInt(result.total_moving_time) || 0,
        total_elevation_gain: parseFloat(result.total_elevation_gain) || 0,
        average_speed: parseFloat(result.avg_speed) || 0,
        max_speed: parseFloat(result.max_speed) || 0
      }
    });

  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ error: 'Failed to fetch activity statistics' });
  }
});

// Get recent activities (cached from database)
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const { data: activities, error } = await supabaseAdmin
      .from(TABLES.ACTIVITIES)
      .select('*')
      .eq('user_id', req.user.id)
      .order('start_date', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Error fetching recent activities:', error);
      return res.status(500).json({ error: 'Failed to fetch recent activities' });
    }

    res.json({
      success: true,
      activities: activities || []
    });

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
});

export default router;
