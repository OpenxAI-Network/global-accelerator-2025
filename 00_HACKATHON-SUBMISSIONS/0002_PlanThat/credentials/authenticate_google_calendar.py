#!/usr/bin/env python3
"""
Google Calendar Authentication Script

This script handles the OAuth 2.0 authentication flow for Google Calendar API.
It will create a token.json file that contains the access and refresh tokens.

Usage:
    python authenticate_google_calendar.py
"""

import os
import json
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar']

def authenticate_google_calendar():
    """
    Authenticate with Google Calendar API and create token.json
    """
    creds = None
    token_path = os.path.join(os.path.dirname(__file__), 'token.json')
    credentials_path = os.path.join(os.path.dirname(__file__), 'credentials.json')
    
    # Check if credentials file exists
    if not os.path.exists(credentials_path):
        print("❌ Error: credentials.json not found!")
        print("📁 Please add your credentials.json file to this directory")
        print("📖 See README.md for setup instructions")
        return False
    
    # The file token.json stores the user's access and refresh tokens,
    # and is created automatically when the authorization flow completes for the first time.
    if os.path.exists(token_path):
        try:
            with open(token_path, 'r') as token:
                creds = json.load(token)
            print("✅ Found existing token.json")
        except Exception as e:
            print(f"⚠️  Error reading existing token: {e}")
            creds = None
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.get('token'):
        if creds and creds.get('refresh_token'):
            try:
                # Try to refresh the token
                from google.auth.transport.requests import Request
                creds = Request()
                print("🔄 Refreshing access token...")
            except Exception as e:
                print(f"⚠️  Error refreshing token: {e}")
                creds = None
        
        if not creds:
            try:
                print("🔐 Starting OAuth authentication...")
                print("📖 If you see 'Access blocked' error, check TROUBLESHOOTING.md")
                flow = InstalledAppFlow.from_client_secrets_file(
                    credentials_path, SCOPES)
                creds = flow.run_local_server(port=8080)
                print("✅ Authentication successful!")
            except Exception as e:
                print(f"❌ Authentication failed: {e}")
                if "Access blocked" in str(e) or "400" in str(e):
                    print("\n🔧 This is likely an OAuth configuration issue.")
                    print("📖 Please check TROUBLESHOOTING.md for detailed fix steps.")
                    print("🔑 Common fixes:")
                    print("   - Add your email to 'Test users' in OAuth consent screen")
                    print("   - Check that Google Calendar API is enabled")
                    print("   - Verify OAuth client is configured as 'Desktop application'")
                return False
        
        # Save the credentials for the next run
        try:
            with open(token_path, 'w') as token:
                json.dump(creds, token)
            print(f"💾 Token saved to {token_path}")
        except Exception as e:
            print(f"❌ Error saving token: {e}")
            return False
    
    # Test the credentials by making a simple API call
    try:
        print("🧪 Testing credentials...")
        service = build('calendar', 'v3', credentials=creds)
        
        # Try to get the user's calendar list
        calendar_list = service.calendarList().list().execute()
        calendars = calendar_list.get('items', [])
        
        if not calendars:
            print("⚠️  No calendars found")
        else:
            print(f"✅ Found {len(calendars)} calendar(s)")
            for calendar in calendars[:3]:  # Show first 3 calendars
                print(f"   📅 {calendar['summary']}")
        
        print("🎉 Google Calendar authentication successful!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing credentials: {e}")
        return False

def main():
    """
    Main function to run the authentication
    """
    print("🚀 Google Calendar Authentication Script")
    print("=" * 50)
    
    success = authenticate_google_calendar()
    
    if success:
        print("\n✅ Authentication completed successfully!")
        print("📁 You can now use Google Calendar features in PlanThat")
        print("🔗 Visit http://localhost:3000/calendar to view your calendar")
    else:
        print("\n❌ Authentication failed!")
        print("📖 Please check the README.md for troubleshooting steps")
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())
