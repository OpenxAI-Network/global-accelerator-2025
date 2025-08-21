#!/usr/bin/env python3
"""
Test Google Calendar Integration

This script tests the Google Calendar authentication and basic operations.
Run this to verify your setup is working correctly.

Usage:
    python test_google_calendar.py
"""

from google_calendar import get_google_calendar_service, check_credentials
import datetime

def test_google_calendar():
    """
    Test Google Calendar functionality
    """
    print("🧪 Testing Google Calendar Integration")
    print("=" * 50)
    
    # Test 1: Check credentials
    print("\n1. Testing credentials...")
    if check_credentials():
        print("✅ Credentials check passed")
    else:
        print("❌ Credentials check failed")
        return False
    
    # Test 2: Get service
    print("\n2. Testing service connection...")
    service = get_google_calendar_service()
    if service:
        print("✅ Service connection successful")
    else:
        print("❌ Service connection failed")
        return False
    
    # Test 3: List calendars
    print("\n3. Testing calendar list...")
    try:
        calendar_list = service.calendarList().list().execute()
        calendars = calendar_list.get('items', [])
        print(f"✅ Found {len(calendars)} calendar(s)")
        for calendar in calendars[:3]:  # Show first 3
            print(f"   📅 {calendar['summary']}")
    except Exception as e:
        print(f"❌ Error listing calendars: {e}")
        return False
    
    # Test 4: Get events
    print("\n4. Testing event retrieval...")
    try:
        now = datetime.datetime.utcnow()
        start_time = now.isoformat() + 'Z'
        end_time = (now + datetime.timedelta(days=7)).isoformat() + 'Z'
        
        events_result = service.events().list(
            calendarId='primary',
            timeMin=start_time,
            timeMax=end_time,
            maxResults=5,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        print(f"✅ Found {len(events)} events in the next 7 days")
        
        if events:
            for event in events[:3]:  # Show first 3 events
                start = event['start'].get('dateTime', event['start'].get('date'))
                print(f"   📅 {event['summary']} - {start}")
        else:
            print("   ℹ️  No events found in the next 7 days")
            
    except Exception as e:
        print(f"❌ Error retrieving events: {e}")
        return False
    
    print("\n🎉 All tests passed! Google Calendar integration is working correctly.")
    return True

def main():
    """
    Main function
    """
    success = test_google_calendar()
    
    if success:
        print("\n✅ Google Calendar integration is ready to use!")
        print("🔗 You can now use calendar features in PlanThat")
    else:
        print("\n❌ Google Calendar integration test failed!")
        print("📖 Please check the credentials/README.md for troubleshooting")
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())
