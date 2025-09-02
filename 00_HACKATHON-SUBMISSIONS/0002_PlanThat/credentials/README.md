# Google Calendar Credentials Setup

This directory contains the credentials needed for Google Calendar integration.

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API

### 2. Create OAuth 2.0 Credentials

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Desktop application" as the application type
4. Download the credentials file

### 3. Set Up Credentials

1. Rename the downloaded file to `credentials.json`
2. Place it in this directory
3. The file structure should look like:
   ```
   credentials/
   ├── README.md
   ├── credentials.json (your actual credentials file)
   └── token.json (will be created automatically)
   ```

### 4. Authentication Process

#### Option A: Automatic Authentication (Recommended)
1. Run the authentication script:
   ```bash
   python authenticate_google_calendar.py
   ```
2. Follow the browser prompts to authorize the application
3. The script will automatically create `token.json`

#### Option B: Manual Authentication
1. Run the Python backend: `python app.py`
2. Navigate to the calendar page in your browser
3. The first time you access calendar features, it will prompt for authentication
4. Follow the OAuth flow in your browser

### 5. First Time Setup

When you first run the application, it will:
1. Open a browser window for Google OAuth authentication
2. Ask you to authorize the application
3. Create a `token.json` file with your access tokens

### 6. File Structure

```
credentials/
├── README.md              # This file
├── credentials.json       # Your OAuth 2.0 credentials (add this)
├── token.json            # Access tokens (created automatically)
├── authenticate_google_calendar.py  # Authentication script
└── .gitignore           # Prevents committing sensitive files
```

## Authentication Troubleshooting

### Common Issues:

1. **"Invalid credentials" error**
   - Check that `credentials.json` is in the correct location
   - Verify the file format matches the example
   - Ensure Google Calendar API is enabled

2. **"Access denied" error**
   - Check OAuth consent screen configuration
   - Verify the application is properly configured
   - Try deleting `token.json` and re-authenticating

3. **"Token expired" error**
   - Delete `token.json` and re-authenticate
   - The refresh token should handle automatic renewal

4. **Browser doesn't open for authentication**
   - Check your firewall settings
   - Try running the authentication script manually
   - Verify you have internet connectivity

### Manual Token Refresh:
If tokens expire, delete `token.json` and re-run the authentication process.

## Security Notes

- **Never commit `credentials.json` or `token.json` to version control**
- Add these files to your `.gitignore`
- Keep your credentials secure and private
- Rotate credentials regularly for security

## Troubleshooting

If you encounter authentication issues:
1. Delete `token.json` and re-authenticate
2. Check that `credentials.json` is in the correct location
3. Verify that Google Calendar API is enabled
4. Ensure your OAuth consent screen is configured properly
