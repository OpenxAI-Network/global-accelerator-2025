# Google Calendar Authentication Troubleshooting

## Error 400: "Access blocked: This app's request is invalid"

This error occurs when there are issues with your Google Cloud OAuth configuration. Here's how to fix it:

### 🔧 **Step-by-Step Fix**

#### 1. **Check OAuth Consent Screen Configuration**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "OAuth consent screen"
4. Make sure the following are configured:

**Required Settings:**
- ✅ **App name**: Set a name for your application
- ✅ **User support email**: Your email address
- ✅ **Developer contact information**: Your email address
- ✅ **Authorized domains**: Add `localhost` for testing
- ✅ **Scopes**: Add `https://www.googleapis.com/auth/calendar`

#### 2. **Verify OAuth 2.0 Client Configuration**

1. Go to "APIs & Services" > "Credentials"
2. Click on your OAuth 2.0 Client ID
3. Check these settings:

**Required Settings:**
- ✅ **Application type**: Desktop application
- ✅ **Name**: Any name you prefer
- ✅ **Authorized redirect URIs**: Should include `http://localhost:8080/` or similar

#### 3. **Enable Required APIs**

1. Go to "APIs & Services" > "Library"
2. Search for and enable these APIs:
   - ✅ **Google Calendar API**
   - ✅ **Google+ API** (if available)

#### 4. **Fix Common Issues**

**Issue: "Access blocked" error**
- **Solution**: Add your email to "Test users" in OAuth consent screen
- **Steps**: 
  1. Go to OAuth consent screen
  2. Scroll to "Test users" section
  3. Click "Add Users"
  4. Add your Google email address

**Issue: "Invalid redirect URI"**
- **Solution**: Update redirect URIs in OAuth client
- **Steps**:
  1. Go to Credentials > OAuth 2.0 Client IDs
  2. Edit your client
  3. Add these redirect URIs:
     - `http://localhost:8080/`
     - `http://localhost:3000/`
     - `http://localhost:5001/`

**Issue: "App not verified"**
- **Solution**: For testing, you can bypass this
- **Steps**:
  1. When you see "Go to [App Name] (unsafe)"
  2. Click "Advanced" > "Go to [App Name] (unsafe)"
  3. This is safe for personal use

#### 5. **Recreate Credentials (If Needed)**

If the above doesn't work:

1. **Delete existing credentials**:
   - Go to Credentials
   - Delete your OAuth 2.0 Client ID

2. **Create new credentials**:
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Desktop application"
   - Download the new `credentials.json`

3. **Replace your credentials file**:
   - Replace the old `credentials.json` with the new one
   - Delete `token.json` if it exists

#### 6. **Test the Fix**

1. **Run the authentication script**:
   ```bash
   cd credentials/
   python authenticate_google_calendar.py
   ```

2. **Or test with the main app**:
   ```bash
   python test_google_calendar.py
   ```

### 🚨 **Common Mistakes to Avoid**

1. **❌ Using wrong application type**: Must be "Desktop application"
2. **❌ Missing scopes**: Must include calendar scope
3. **❌ Wrong redirect URIs**: Must include localhost URLs
4. **❌ Not adding test users**: Your email must be in test users list
5. **❌ Using expired credentials**: Download fresh credentials

### 🔍 **Debug Steps**

If you're still having issues:

1. **Check the exact error message** in the browser
2. **Look at the URL** when the error occurs
3. **Check browser console** for additional error details
4. **Verify your Google account** has calendar access

### 📞 **Still Having Issues?**

If none of the above works:

1. **Check Google Cloud Console logs**:
   - Go to "APIs & Services" > "Dashboard"
   - Look for any error messages

2. **Verify API quotas**:
   - Make sure you haven't exceeded API limits

3. **Try a different Google account**:
   - Sometimes account-specific settings can cause issues

### ✅ **Success Indicators**

You'll know it's working when:
- ✅ Browser opens for OAuth consent
- ✅ You can click "Allow" without errors
- ✅ `token.json` file is created
- ✅ Test script runs without errors
- ✅ Calendar events appear in the app
