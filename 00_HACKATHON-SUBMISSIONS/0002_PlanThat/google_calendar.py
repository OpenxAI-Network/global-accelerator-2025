from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from users import *
import os
import json
import datetime

def get_google_calendar_service():
    """
    Get authenticated Google Calendar service
    """
    SCOPES = ['https://www.googleapis.com/auth/calendar']
    creds = None
    
    # Get the path to credentials and token files
    credentials_path = os.path.join(os.path.dirname(__file__), 'credentials', 'credentials.json')
    token_path = os.path.join(os.path.dirname(__file__), 'credentials', 'token.json')
    
    # Check if credentials file exists
    if not os.path.exists(credentials_path):
        print("❌ Google Calendar credentials not found!")
        print("📁 Please add your credentials.json file to the credentials/ directory")
        print("📖 See credentials/README.md for setup instructions")
        return None
    
    # The file token.json stores the user's access and refresh tokens
    if os.path.exists(token_path):
        try:
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)
            print("✅ Found existing token.json")
        except Exception as e:
            print(f"⚠️  Error reading existing token: {e}")
            creds = None
    
    # If there are no (valid) credentials available, let the user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                print("🔄 Refreshed access token")
            except Exception as e:
                print(f"⚠️  Error refreshing token: {e}")
                creds = None
        
        if not creds:
            try:
                print("🔐 Starting OAuth authentication...")
                flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
                creds = flow.run_local_server(port=0)
                print("✅ Authentication successful!")
            except Exception as e:
                print(f"❌ Authentication failed: {e}")
                return None
        
        # Save the credentials for the next run
        try:
            with open(token_path, 'w') as token:
                token.write(creds.to_json())
            print(f"💾 Token saved to {token_path}")
        except Exception as e:
            print(f"❌ Error saving token: {e}")
            return None
    
    try:
        service = build('calendar', 'v3', credentials=creds)
        return service
    except Exception as e:
        print(f"❌ Error building calendar service: {e}")
        return None

def check_credentials():
    """
    Check if Google Calendar credentials are properly set up
    """
    service = get_google_calendar_service()
    return service is not None

def get_calendar(user):
    """
    Get all events from user's Google Calendar for the current month
    """
    try:
        # Get authenticated service
        service = get_google_calendar_service()
        if not service:
            print(f"⚠️  Skipping calendar fetch for {user.email} - credentials not configured")
            return []
        
        events = []
        
        # Get current month's events
        now = datetime.datetime.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if now.month == 12:
            end_of_month = now.replace(year=now.year + 1, month=1, day=1) - datetime.timedelta(seconds=1)
        else:
            end_of_month = now.replace(month=now.month + 1, day=1) - datetime.timedelta(seconds=1)
        
        try:
            # Get events from primary calendar
            events_result = service.events().list(
                calendarId='primary',
                timeMin=start_of_month.isoformat() + 'Z',
                timeMax=end_of_month.isoformat() + 'Z',
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events_list = events_result.get('items', [])
            
            for event in events_list:
                try:
                    start = event['start'].get('dateTime', event['start'].get('date'))
                    end = event['end'].get('dateTime', event['end'].get('date'))
                    
                    event_data = {
                        'summary': event.get('summary', 'No Title'),
                        'description': event.get('description', ''),
                        'start': start,
                        'end': end,
                        'location': event.get('location', ''),
                        'attendees': [],
                        'attendees_emails': [],
                        'attendees_names': []
                    }
                    
                    # Add attendees if available
                    if 'attendees' in event:
                        for attendee in event['attendees']:
                            event_data['attendees'].append(str(attendee))
                            if 'email' in attendee:
                                event_data['attendees_emails'].append(attendee['email'])
                            if 'displayName' in attendee:
                                event_data['attendees_names'].append(attendee['displayName'])
                    
                    events.append(event_data)
                except Exception as event_error:
                    print(f"Error processing event: {event_error}")
                    continue
            
            print(f"Successfully retrieved {len(events)} events from Google Calendar")
            return events
            
        except HttpError as error:
            print(f"Error fetching calendar events: {error}")
            return []
            
    except Exception as e:
        print(f"Error getting calendar for user {user.email}: {e}")
        return []

def set_calendar_event(user, event):
    """
    Set a new event in the user's Google Calendar
    """
    try:
        # Get authenticated service
        service = get_google_calendar_service()
        if not service:
            print(f"⚠️  Cannot add event for {user.email} - credentials not configured")
            return False
        
        # Prepare event data
        event_data = {
            'summary': event.get("summary", "New Event"),
            'description': event.get("description", ""),
            'location': event.get("location", ""),
            'start': {
                'dateTime': event.get("start"),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': event.get("end"),
                'timeZone': 'UTC',
            }
        }
        
        # Add attendees if provided
        attendees = event.get("attendees_emails", [])
        if attendees:
            event_data['attendees'] = [{'email': email} for email in attendees]
        
        # Add event to calendar
        event_result = service.events().insert(
            calendarId='primary',
            body=event_data
        ).execute()
        
        print(f"Successfully added event '{event.get('summary', 'New Event')}' to calendar for user {user.email}")
        print(f"Event ID: {event_result.get('id')}")
        return True
        
    except HttpError as error:
        print(f"Error setting calendar event for user {user.email}: {error}")
        return False
    except Exception as e:
        print(f"Error setting calendar event for user {user.email}: {e}")
        return False