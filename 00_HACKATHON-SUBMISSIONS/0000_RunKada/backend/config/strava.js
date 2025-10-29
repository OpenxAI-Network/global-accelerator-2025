import axios from 'axios';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';
const STRAVA_AUTH_BASE = 'https://www.strava.com/oauth';

export const stravaConfig = {
  clientId: process.env.STRAVA_CLIENT_ID,
  clientSecret: process.env.STRAVA_CLIENT_SECRET,
  redirectUri: process.env.STRAVA_REDIRECT_URI,
  scope: 'read,activity:read_all'
};

export const getStravaAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: stravaConfig.clientId,
    redirect_uri: stravaConfig.redirectUri,
    response_type: 'code',
    scope: stravaConfig.scope,
    approval_prompt: 'force'
  });
  
  return `${STRAVA_AUTH_BASE}/authorize?${params.toString()}`;
};

export const exchangeCodeForToken = async (code) => {
  try {
    const response = await axios.post(`${STRAVA_AUTH_BASE}/token`, {
      client_id: stravaConfig.clientId,
      client_secret: stravaConfig.clientSecret,
      code: code,
      grant_type: 'authorization_code'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error exchanging code for token:', error.response?.data || error.message);
    throw new Error('Failed to exchange authorization code for access token');
  }
};

export const refreshStravaToken = async (refreshToken) => {
  try {
    const response = await axios.post(`${STRAVA_AUTH_BASE}/token`, {
      client_id: stravaConfig.clientId,
      client_secret: stravaConfig.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    throw new Error('Failed to refresh access token');
  }
};

export const getStravaAthlete = async (accessToken) => {
  try {
    const response = await axios.get(`${STRAVA_API_BASE}/athlete`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching athlete data:', error.response?.data || error.message);
    throw new Error('Failed to fetch athlete data');
  }
};

export const getStravaActivities = async (accessToken, page = 1, perPage = 30) => {
  try {
    const response = await axios.get(`${STRAVA_API_BASE}/athlete/activities`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        page,
        per_page: perPage
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching activities:', error.response?.data || error.message);
    throw new Error('Failed to fetch activities');
  }
};
