from db_config import get_db_connection, get_db_cursor
from users import *
from notifications import *

#regular calendar events

def init_regular_calendar_table():
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("DROP TABLE IF EXISTS invitation_to_regular_calendar_event CASCADE")
    cursor.execute("DROP TABLE IF EXISTS event_to_user CASCADE")
    cursor.execute("DROP TABLE IF EXISTS regular_calendar CASCADE")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS regular_calendar (
            event_id SERIAL PRIMARY KEY,
            location TEXT,
            latitude REAL,
            longitude REAL,
            date TEXT,
            start_time TEXT,
            end_time TEXT,
            description TEXT,
            host_id INTEGER,
            FOREIGN KEY (host_id) REFERENCES users (id)
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

def add_regular_calendar_event(location, latitude, longitude, date, start_time, end_time, description, host_id):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        INSERT INTO regular_calendar (location, latitude, longitude, date, start_time, end_time, description, host_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (location, latitude, longitude, date, start_time, end_time, description, host_id))
    conn.commit()
    cursor.close()
    conn.close()

def get_latest_event_id(user_id):
    conn = get_db_connection()
    if not conn:
        return 0
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return 0
    
    cursor.execute("""
        SELECT event_id FROM regular_calendar WHERE host_id = %s ORDER BY event_id DESC LIMIT 1
    """, (user_id,))
    event_id = cursor.fetchone()
    cursor.close()
    conn.close()
    return event_id['event_id'] if event_id else 0

def get_regular_calendar_event(event_id):
    conn = get_db_connection()
    if not conn:
        return None
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return None
    
    cursor.execute("""
        SELECT location, latitude, longitude, date, start_time, end_time, description, host_id FROM regular_calendar WHERE event_id = %s
    """, (event_id,))
    event = cursor.fetchone()
    cursor.close()
    conn.close()
    return event

def remove_regular_calendar_event(event_id):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    # Delete dependent tables first to avoid foreign key constraint violations
    cursor.execute("""
        DELETE FROM event_to_user WHERE event_id = %s
    """, (event_id,))
    cursor.execute("""
        DELETE FROM invitation_to_regular_calendar_event WHERE event_id = %s
    """, (event_id,))
    cursor.execute("""
        DELETE FROM regular_calendar WHERE event_id = %s
    """, (event_id,))
    conn.commit()
    cursor.close()
    conn.close()

def delete_event_by_host(event_id, host_id):
    """Delete an event (host only)"""
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    # Verify that the user is the host of this event
    cursor.execute("""
        SELECT host_id FROM regular_calendar WHERE event_id = %s
    """, (event_id,))
    result = cursor.fetchone()
    
    if not result:
        cursor.close()
        conn.close()
        raise ValueError("Event not found")
    
    if result['host_id'] != host_id:
        cursor.close()
        conn.close()
        raise ValueError("Only the event host can delete this event")
    
    # Get all participants to notify them
    cursor.execute("""
        SELECT user_id FROM event_to_user WHERE event_id = %s
    """, (event_id,))
    attending_users = cursor.fetchall()
    
    cursor.execute("""
        SELECT user_id FROM invitation_to_regular_calendar_event WHERE event_id = %s
    """, (event_id,))
    invited_users = cursor.fetchall()
    
    # Get event details for notification
    event_data = get_regular_calendar_event(event_id)
    event_location = event_data['location'] if event_data else "Unknown Event"
    host_username = get_username_from_user_id(host_id)
    
    # Delete the event and all related data (delete dependent tables first)
    cursor.execute("""
        DELETE FROM event_to_user WHERE event_id = %s
    """, (event_id,))
    cursor.execute("""
        DELETE FROM invitation_to_regular_calendar_event WHERE event_id = %s
    """, (event_id,))
    cursor.execute("""
        DELETE FROM regular_calendar WHERE event_id = %s
    """, (event_id,))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    # Send notifications to all participants
    notification_message = f"Event '{event_location}' has been cancelled by {host_username}"
    
    for user in attending_users:
        if user['user_id'] != host_id:  # Don't notify the host
            add_notification(user['user_id'], notification_message)
    
    for user in invited_users:
        if user['user_id'] != host_id:  # Don't notify the host
            add_notification(user['user_id'], notification_message)

def leave_event(user_id, event_id):
    """Leave an event (non-host users only)"""
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    # Verify that the user is not the host
    cursor.execute("""
        SELECT host_id FROM regular_calendar WHERE event_id = %s
    """, (event_id,))
    result = cursor.fetchone()
    
    if not result:
        cursor.close()
        conn.close()
        raise ValueError("Event not found")
    
    if result['host_id'] == user_id:
        cursor.close()
        conn.close()
        raise ValueError("Event hosts cannot leave their own events. Use delete instead.")
    
    # Check if user is attending the event
    cursor.execute("""
        SELECT 1 FROM event_to_user WHERE event_id = %s AND user_id = %s
    """, (event_id, user_id))
    is_attending = cursor.fetchone()
    
    if not is_attending:
        cursor.close()
        conn.close()
        raise ValueError("You are not attending this event")
    
    # Remove user from event
    cursor.execute("""
        DELETE FROM event_to_user WHERE event_id = %s AND user_id = %s
    """, (event_id, user_id))
    
    # Also remove any pending invitations
    cursor.execute("""
        DELETE FROM invitation_to_regular_calendar_event WHERE event_id = %s AND user_id = %s
    """, (event_id, user_id))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    # Send notification to host
    event_data = get_regular_calendar_event(event_id)
    if event_data:
        host_id = event_data['host_id']
        user_username = get_username_from_user_id(user_id)
        event_location = event_data['location']
        notification = f"{user_username} has left your event '{event_location}'"
        add_notification(host_id, notification)

def update_regular_calendar_event(event_id, location, date, start_time, end_time, description, host_id):
    """Update an existing regular calendar event"""
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    # First verify that the user is the host of this event
    cursor.execute("""
        SELECT host_id FROM regular_calendar WHERE event_id = %s
    """, (event_id,))
    result = cursor.fetchone()
    
    if not result:
        cursor.close()
        conn.close()
        raise ValueError("Event not found")
    
    if result['host_id'] != host_id:
        cursor.close()
        conn.close()
        raise ValueError("Only the event host can update this event")
    
    # Update the event
    cursor.execute("""
        UPDATE regular_calendar 
        SET location = %s, date = %s, start_time = %s, end_time = %s, description = %s
        WHERE event_id = %s
    """, (location, date, start_time, end_time, description, event_id))
    
    # Get all users invited to this event to notify them of the update
    cursor.execute("""
        SELECT user_id FROM event_to_user WHERE event_id = %s
    """, (event_id,))
    invited_users = cursor.fetchall()
    
    # Get all users with pending invitations
    cursor.execute("""
        SELECT user_id FROM invitation_to_regular_calendar_event WHERE event_id = %s
    """, (event_id,))
    pending_users = cursor.fetchall()
    
    conn.commit()
    cursor.close()
    conn.close()
    
    # Send notifications to all invited and pending users
    host_username = get_username_from_user_id(host_id)
    notification_message = f"Event '{location}' has been updated by {host_username}"
    
    # Notify accepted users
    for user in invited_users:
        if user['user_id'] != host_id:  # Don't notify the host
            add_notification(user['user_id'], notification_message)
    
    # Notify users with pending invitations
    for user in pending_users:
        if user['user_id'] != host_id:  # Don't notify the host
            add_notification(user['user_id'], notification_message)

#user events

def init_event_to_user_table():
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS event_to_user (
            event_id INTEGER,
            user_id INTEGER,
            FOREIGN KEY (event_id) REFERENCES regular_calendar (event_id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """)
    conn.commit()
    cursor.close()
    conn.close()

def get_users_for_event(event_id):
    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return []
    
    cursor.execute("""
        SELECT user_id FROM event_to_user WHERE event_id = %s
    """, (event_id,))
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return [user['user_id'] for user in users]

def add_user_to_event(event_id, user_id):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        INSERT INTO event_to_user (event_id, user_id)
        VALUES (%s, %s)
    """, (event_id, user_id))
    conn.commit()
    cursor.close()
    conn.close()

def remove_event_from_user(event_id, user_id):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        DELETE FROM event_to_user WHERE event_id = %s AND user_id = %s
    """, (event_id, user_id))
    conn.commit()
    cursor.close()
    conn.close()

def get_user_events(user_id):
    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return []
    
    cursor.execute("""
        SELECT event_id FROM event_to_user WHERE user_id = %s
    """, (user_id,))
    events = cursor.fetchall()
    cursor.close()
    conn.close()
    return [event['event_id'] for event in events]

#invitations for the user to an event

def init_invitation_to_regular_calendar_event_table():
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS invitation_to_regular_calendar_event (
            event_id INTEGER,
            user_id INTEGER,
            status TEXT,
            FOREIGN KEY (event_id) REFERENCES regular_calendar (event_id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

def add_invitation_to_regular_calendar_event(event_id, user_id, status):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        INSERT INTO invitation_to_regular_calendar_event (event_id, user_id, status)
        VALUES (%s, %s, %s)
    """, (event_id, user_id, status))
    conn.commit()
    cursor.close()
    conn.close()
    
    # Send notification to the invited user
    if status == "pending":
        # Get event details and host username
        event_data = get_regular_calendar_event(event_id)
        if event_data:
            host_id = event_data['host_id']  # host_id is at index 7
            host_username = get_username_from_user_id(host_id)
            event_location = event_data['location']  # location is at index 0
            notify_user_of_invitation(event_id, user_id, host_username, event_location)

def remove_invitation_to_regular_calendar_event(event_id, user_id):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        DELETE FROM invitation_to_regular_calendar_event WHERE event_id = %s AND user_id = %s
    """, (event_id, user_id))
    conn.commit()
    cursor.close()
    conn.close()

def get_invitations_for_event(event_id):
    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return []
    
    cursor.execute("""
        SELECT user_id FROM invitation_to_regular_calendar_event WHERE event_id = %s
    """, (event_id,))
    invitations = cursor.fetchall()
    cursor.close()
    conn.close()
    return [invitation['user_id'] for invitation in invitations]

def get_invitations_for_user(user_id):
    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return []
    
    cursor.execute("""
        SELECT event_id FROM invitation_to_regular_calendar_event WHERE user_id = %s
    """, (user_id,))
    invitations = cursor.fetchall()
    cursor.close()
    conn.close()
    return [invitation['event_id'] for invitation in invitations]

# Notification functions for events

def notify_user_of_invitation(event_id, user_id, host_username, event_location):
    """Send notification to user when they receive an invitation"""
    notification = f"You have been invited to '{event_location}' by {host_username}"
    add_notification(user_id, notification)

def notify_host_of_acceptance(event_id, user_id, host_id, user_username, event_location):
    """Send notification to host when someone accepts their invitation"""
    notification = f"{user_username} has accepted your invitation to '{event_location}'"
    add_notification(host_id, notification)

def notify_host_of_rejection(event_id, user_id, host_id, user_username, event_location):
    """Send notification to host when someone rejects their invitation"""
    notification = f"{user_username} has declined your invitation to '{event_location}'"
    add_notification(host_id, notification)

def remove_user_from_event(event_id, user_id, host_id):
    """Remove a user from an event (host only)"""
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    # Verify that the user is the host of this event
    cursor.execute("""
        SELECT host_id FROM regular_calendar WHERE event_id = %s
    """, (event_id,))
    result = cursor.fetchone()
    
    if not result:
        cursor.close()
        conn.close()
        raise ValueError("Event not found")
    
    if result['host_id'] != host_id:
        cursor.close()
        conn.close()
        raise ValueError("Only the event host can remove users from this event")
    
    # Remove user from event_to_user table
    cursor.execute("""
        DELETE FROM event_to_user WHERE event_id = %s AND user_id = %s
    """, (event_id, user_id))
    
    # Also remove any pending invitations for this user
    cursor.execute("""
        DELETE FROM invitation_to_regular_calendar_event WHERE event_id = %s AND user_id = %s
    """, (event_id, user_id))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    # Send notification to the removed user
    event_data = get_regular_calendar_event(event_id)
    if event_data:
        host_username = get_username_from_user_id(host_id)
        event_location = event_data['location']
        notification = f"You have been removed from '{event_location}' by {host_username}"
        add_notification(user_id, notification)

def add_invitation_by_host(event_id, user_id, host_id):
    """Add an invitation to an event (host only)"""
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    # Verify that the user is the host of this event
    cursor.execute("""
        SELECT host_id FROM regular_calendar WHERE event_id = %s
    """, (event_id,))
    result = cursor.fetchone()
    
    if not result:
        cursor.close()
        conn.close()
        raise ValueError("Event not found")
    
    if result['host_id'] != host_id:
        cursor.close()
        conn.close()
        raise ValueError("Only the event host can add invitations to this event")
    
    # Check if user is already in the event or has a pending invitation
    cursor.execute("""
        SELECT 1 FROM event_to_user WHERE event_id = %s AND user_id = %s
    """, (event_id, user_id))
    already_attending = cursor.fetchone()
    
    cursor.execute("""
        SELECT 1 FROM invitation_to_regular_calendar_event WHERE event_id = %s AND user_id = %s
    """, (event_id, user_id))
    already_invited = cursor.fetchone()
    
    if already_attending or already_invited:
        cursor.close()
        conn.close()
        raise ValueError("User is already attending or has a pending invitation")
    
    # Add invitation
    cursor.execute("""
        INSERT INTO invitation_to_regular_calendar_event (event_id, user_id, status)
        VALUES (%s, %s, %s)
    """, (event_id, user_id, "pending"))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    # Send notification to the invited user
    event_data = get_regular_calendar_event(event_id)
    if event_data:
        host_username = get_username_from_user_id(host_id)
        event_location = event_data['location']
        notify_user_of_invitation(event_id, user_id, host_username, event_location)

def get_event_participants(event_id):
    """Get all participants (attending and invited) for an event"""
    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return []
    
    # Get attending users
    cursor.execute("""
        SELECT u.id, u.username, 'attending' as status
        FROM users u
        JOIN event_to_user e ON u.id = e.user_id
        WHERE e.event_id = %s
    """, (event_id,))
    attending_users = cursor.fetchall()
    
    # Get users with pending invitations
    cursor.execute("""
        SELECT u.id, u.username, 'invited' as status
        FROM users u
        JOIN invitation_to_regular_calendar_event i ON u.id = i.user_id
        WHERE i.event_id = %s
    """, (event_id,))
    invited_users = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    # Combine and format results
    participants = []
    for user in attending_users:
        participants.append({
            'id': user['id'],
            'username': user['username'],
            'status': user['status']
        })
    
    for user in invited_users:
        participants.append({
            'id': user['id'],
            'username': user['username'],
            'status': user['status']
        })
    
    return participants
