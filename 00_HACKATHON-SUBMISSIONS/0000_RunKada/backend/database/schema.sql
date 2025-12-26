-- RunKada Database Schema for Supabase
-- This file contains the complete database schema for the RunKada application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    strava_id VARCHAR(50) UNIQUE NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    profile_picture TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strava tokens table
CREATE TABLE IF NOT EXISTS strava_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    strava_activity_id VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    distance DECIMAL(10,2), -- in meters
    moving_time INTEGER, -- in seconds
    elapsed_time INTEGER, -- in seconds
    total_elevation_gain DECIMAL(8,2), -- in meters
    type VARCHAR(50),
    sport_type VARCHAR(50),
    start_date TIMESTAMP WITH TIME ZONE,
    start_date_local TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(100),
    utc_offset DECIMAL(5,2),
    location_country VARCHAR(100),
    location_state VARCHAR(100),
    location_city VARCHAR(100),
    achievement_count INTEGER DEFAULT 0,
    kudos_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    athlete_count INTEGER DEFAULT 0,
    photo_count INTEGER DEFAULT 0,
    map JSONB,
    trainer BOOLEAN DEFAULT FALSE,
    commute BOOLEAN DEFAULT FALSE,
    manual BOOLEAN DEFAULT FALSE,
    private BOOLEAN DEFAULT FALSE,
    flagged BOOLEAN DEFAULT FALSE,
    gear_id VARCHAR(50),
    from_accepted_tag BOOLEAN DEFAULT FALSE,
    average_speed DECIMAL(8,2), -- in m/s
    max_speed DECIMAL(8,2), -- in m/s
    average_cadence DECIMAL(5,2), -- in rpm
    average_temp DECIMAL(4,1), -- in celsius
    has_heartrate BOOLEAN DEFAULT FALSE,
    average_heartrate DECIMAL(5,2), -- in bpm
    max_heartrate DECIMAL(5,2), -- in bpm
    heartrate_opt_out BOOLEAN DEFAULT FALSE,
    display_hide_heartrate_option BOOLEAN DEFAULT FALSE,
    elev_high DECIMAL(8,2), -- in meters
    elev_low DECIMAL(8,2), -- in meters
    upload_id BIGINT,
    upload_id_str VARCHAR(50),
    external_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, strava_activity_id)
);

-- Clans table
CREATE TABLE IF NOT EXISTS clans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clan members table
CREATE TABLE IF NOT EXISTS clan_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clan_id, user_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_strava_id ON users(strava_id);
CREATE INDEX IF NOT EXISTS idx_strava_tokens_user_id ON strava_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_clan_members_clan_id ON clan_members(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_user_id ON clan_members(user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strava_tokens_updated_at BEFORE UPDATE ON strava_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clans_updated_at BEFORE UPDATE ON clans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE strava_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clan_members ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Strava tokens are private to the user
CREATE POLICY "Users can manage own tokens" ON strava_tokens
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Activities are private to the user
CREATE POLICY "Users can manage own activities" ON activities
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Clans are public for reading, but only admins can modify
CREATE POLICY "Anyone can view clans" ON clans
    FOR SELECT USING (true);

CREATE POLICY "Users can create clans" ON clans
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Clan admins can update clans" ON clans
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM clan_members 
            WHERE clan_id = clans.id 
            AND user_id = auth.uid()::uuid 
            AND role = 'admin'
        )
    );

-- Clan members policies
CREATE POLICY "Anyone can view clan members" ON clan_members
    FOR SELECT USING (true);

CREATE POLICY "Users can join clans" ON clan_members
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can leave clans" ON clan_members
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Views for common queries
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.firstname,
    u.lastname,
    u.profile_picture,
    COUNT(a.id) as total_activities,
    COALESCE(SUM(a.distance), 0) as total_distance,
    COALESCE(SUM(a.moving_time), 0) as total_moving_time,
    COALESCE(SUM(a.total_elevation_gain), 0) as total_elevation_gain,
    COALESCE(AVG(a.average_speed), 0) as avg_speed,
    COALESCE(MAX(a.average_speed), 0) as max_speed
FROM users u
LEFT JOIN activities a ON u.id = a.user_id
GROUP BY u.id, u.firstname, u.lastname, u.profile_picture;

-- Function to get clan leaderboard
CREATE OR REPLACE FUNCTION get_clan_leaderboard(clan_uuid UUID)
RETURNS TABLE (
    user_id UUID,
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    profile_picture TEXT,
    total_distance DECIMAL(10,2),
    total_activities BIGINT,
    rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH clan_activities AS (
        SELECT 
            cm.user_id,
            u.firstname,
            u.lastname,
            u.profile_picture,
            COALESCE(SUM(a.distance), 0) as total_distance,
            COUNT(a.id) as total_activities
        FROM clan_members cm
        JOIN users u ON cm.user_id = u.id
        LEFT JOIN activities a ON u.id = a.user_id
        WHERE cm.clan_id = clan_uuid
        GROUP BY cm.user_id, u.firstname, u.lastname, u.profile_picture
    )
    SELECT 
        ca.user_id,
        ca.firstname,
        ca.lastname,
        ca.profile_picture,
        ca.total_distance,
        ca.total_activities,
        ROW_NUMBER() OVER (ORDER BY ca.total_distance DESC) as rank
    FROM clan_activities ca
    ORDER BY ca.total_distance DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
