from flask import Flask, render_template, request, abort, url_for, send_from_directory, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
import requests
import json
from datetime import datetime
import sqlite3
from typing import List, Dict, Any
import hashlib
import secrets
from users import *
from friends import *
from google_calendar import *
from regular_calendar import *
from notifications import *
from bookmarks import *
from invite import *
import os

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
init_userdb()
init_frienddb()
init_friend_requests()
init_notification_table()
init_bookmark_table()
init_invite_table()
init_regular_calendar_table()
init_event_to_user_table()
init_invitation_to_regular_calendar_event_table()

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Handle user login"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        # Use the existing login_user function from users.py
        user = login_user(username, password)
        
        if not user:
            return jsonify({"error": "Invalid username or password"}), 401

        # Create user object
        user_data = {
            "id": user[0],
            "username": user[1],
            "password": user[2],
            "dob": user[3],
            "city": user[4],
            "country": user[5],
            "zipcode": user[6],
            "email": user[7],
            "bio": user[8],
            "food": user[9],
            "drinks": user[10],
            "nightlife": user[11],
            "nature": user[12],
            "arts": user[13],
            "entertainment": user[14],
            "sports": user[15],
            "shopping": user[16],
            "music": user[17],
            "diet_restrictions": user[18],
            "dislikes": user[19]
        }
        
        # Generate token
        token = secrets.token_urlsafe(32)
        
        return jsonify({
            "user": user_data,
            "token": token
        })
        
    except Exception as e:
        print(f"Error in login: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Handle user registration"""
    try:
        data = request.get_json()
        
        # Required fields
        username = data.get('username', '').strip()
        password = data.get('password', '')
        email = data.get('email', '').strip()
        dob = data.get('dob', '')
        city = data.get('city', '').strip()
        country = data.get('country', '').strip()
        zipcode = data.get('zipcode', '').strip()
        
        # Optional fields
        bio = data.get('bio', '').strip()
        diet_restrictions = data.get('diet_restrictions', '').strip()
        dislikes = data.get('dislikes', '').strip()
        food = data.get('food', 5)
        drinks = data.get('drinks', 5)
        nightlife = data.get('nightlife', 5)
        nature = data.get('nature', 5)
        arts = data.get('arts', 5)
        entertainment = data.get('entertainment', 5)
        sports = data.get('sports', 5)
        shopping = data.get('shopping', 5)
        music = data.get('music', 5)

        # Validation
        if not all([username, password, email, dob, city, country, zipcode]):
            return jsonify({"error": "All required fields must be provided"}), 400

        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400

        # Use the existing add_user function from users.py
        add_user(username, password, dob, city, country, zipcode, email, bio, food, drinks, nightlife, nature, arts, entertainment, sports, shopping, music, diet_restrictions, dislikes)
        
        # Get the created user
        user = login_user(username, password)
        
        if not user:
            return jsonify({"error": "Failed to create user"}), 500

        # Create user object
        user_data = {
            "id": user[0],
            "username": user[1],
            "password": user[2],
            "dob": user[3],
            "city": user[4],
            "country": user[5],
            "zipcode": user[6],
            "email": user[7],
            "bio": user[8],
            "food": user[9],
            "drinks": user[10],
            "nightlife": user[11],
            "nature": user[12],
            "arts": user[13],
            "entertainment": user[14],
            "sports": user[15],
            "shopping": user[16],
            "music": user[17],
            "diet_restrictions": user[18],
            "dislikes": user[19]
        }
        
        # Generate token
        token = secrets.token_urlsafe(32)
        
        return jsonify({
            "user": user_data,
            "token": token
        })
        
    except Exception as e:
        print(f"Error in signup: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/')
def index():
    return render_template('index.html')


#ignore these routes, they are for the google calendar integration
@app.route('/calendar/get', methods=['GET'])
def get_user_calendar():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id parameter is required"}), 400
    
    try:
        user = get_user(int(user_id))
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        calendar = get_calendar(user)
        return jsonify(calendar)
    except Exception as e:
        print(f"Error getting calendar: {e}")
        return jsonify({"error": "Failed to get calendar"}), 500

@app.route('/calendar/set', methods=['POST'])
def set_calendar():
    data = request.get_json()
    event = data["event"]
    current_user = get_user(data["user_id"])
    set_calendar_event(current_user, event)
    extra_users = get_friends(data["extra_users"])
    for user in extra_users:
        set_calendar_event(user, event)
    return jsonify({"message": "Event set successfully"})

#friends

@app.route('/friends/send_request', methods=['POST'])
def send_user_friend_request():
    try:
        data = request.get_json()
        send_friend_request(data["friend_1_id"], data["friend_2_id"])
        return jsonify({"message": "Friend request sent successfully"})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error sending friend request: {e}")
        return jsonify({"error": "Failed to send friend request"}), 500

@app.route('/friends/accept_request', methods=['POST'])
def accept_user_friend_request():
    data = request.get_json()
    print(f"Accepting friend request for {data['friend_1_id']} and {data['friend_2_id']}")
    accept_friend_request(data["friend_1_id"], data["friend_2_id"])
    return jsonify({"message": "Friend request accepted successfully"})

@app.route('/friends/remove_request', methods=['POST'])
def remove_user_friend_request():
    data = request.get_json()
    remove_friend_request(data["friend_1_id"], data["friend_2_id"])
    return jsonify({"message": "Friend request removed successfully"})

@app.route('/friends/get_requests', methods=['GET'])
def get_user_friend_requests():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id parameter is required"}), 400
    
    try:
        print(f"Getting friend requests for user {user_id}")
        friend_requests_raw = get_friend_requests(int(user_id))
        print(f"Friend requests raw: {friend_requests_raw}")
        
        # Convert RealDictRow objects to regular dictionaries
        friend_requests = []
        for friend_request in friend_requests_raw:
            friend_requests.append({
                "id": friend_request['id'],  # Use the actual database ID
                "friend_1_id": friend_request['friend_1_id'],  # The user who sent the request
                "friend_1_name": get_username_from_user_id(friend_request['friend_1_id']),  # The user who sent the request
                "friend_2_id": friend_request['friend_2_id'],  # The current user
                "friend_2_name": get_username_from_user_id(friend_request['friend_2_id'])  # The current user's name
            })
        
        print(f"Friend requests processed: {friend_requests}")
        return jsonify(friend_requests)
    except Exception as e:
        print(f"Error getting friend requests: {e}")
        return jsonify({"error": "Failed to get friend requests"}), 500

@app.route('/friends/get_sent_requests', methods=['GET'])
def get_user_sent_friend_requests():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id parameter is required"}), 400
    
    try:
        print(f"Getting sent friend requests for user {user_id}")
        sent_requests_raw = get_sent_friend_requests(int(user_id))
        print(f"Sent requests raw: {sent_requests_raw}")
        
        # Convert RealDictRow objects to regular dictionaries
        sent_requests = []
        for sent_request in sent_requests_raw:
            sent_requests.append({
                "id": sent_request['id'],  # Use the actual database ID
                "friend_1_id": sent_request['friend_1_id'],  # The current user (who sent the request)
                "friend_1_name": get_username_from_user_id(sent_request['friend_1_id']),  # The current user's name
                "friend_2_id": sent_request['friend_2_id'],  # The user who received the request
                "friend_2_name": get_username_from_user_id(sent_request['friend_2_id'])  # The user who received the request
            })
        
        print(f"Sent requests processed: {sent_requests}")
        return jsonify(sent_requests)
    except Exception as e:
        print(f"Error getting sent friend requests: {e}")
        return jsonify({"error": "Failed to get sent friend requests"}), 500

@app.route('/friends/get_friends', methods=['GET'])
def get_user_friends():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id parameter is required"}), 400
    
    try:
        friends_raw = get_friends(int(user_id))
        print(f"Friends raw: {friends_raw}")
        
        # Convert RealDictRow objects to regular dictionaries
        friends = []
        for friend in friends_raw:
            friends.append({
                "id": friend['id'],
                "friend_1_id": friend['friend_1_id'],
                "friend_1_name": get_username_from_user_id(friend['friend_1_id']),
                "friend_2_id": friend['friend_2_id'],
                "friend_2_name": get_username_from_user_id(friend['friend_2_id'])
            })
        
        print(f"Friends processed: {friends}")
        return jsonify(friends)
    except Exception as e:
        print(f"Error getting friends: {e}")
        return jsonify({"error": "Failed to get friends"}), 500

@app.route('/friends/remove_friend', methods=['POST'])
def remove_user_friend():
    data = request.get_json()
    remove_friend(data["friend_1_id"], data["friend_2_id"])
    return jsonify({"message": "Friend removed successfully"})

@app.route('/friends/status', methods=['GET'])
def get_friendship_status():
    friend_1_id = request.args.get('friend_1_id')
    friend_2_id = request.args.get('friend_2_id')
    
    if not friend_1_id or not friend_2_id:
        return jsonify({"error": "Both friend_1_id and friend_2_id parameters are required"}), 400
    
    try:
        status = get_friendship_status(int(friend_1_id), int(friend_2_id))
        return jsonify({"status": status})
    except Exception as e:
        print(f"Error getting friendship status: {e}")
        return jsonify({"error": "Failed to get friendship status"}), 500

@app.route("/search/get_results", methods=['POST'])
def get_search_user():
    data = request.get_json()
    query = data["query"]
    results = search_users_autocomplete(query)
    return jsonify(results)


#notifications
@app.route("/notifications/get", methods=['GET'])
def get_user_notifications():
    user_id = request.args.get('user_id')
    print("test")
    if not user_id:
        return jsonify({"error": "user_id parameter is required"}), 400
    try:
        notifications_raw = get_notifications(int(user_id))
        print(f"Notifications raw: {notifications_raw}")
        
        # Convert RealDictRow objects to regular dictionaries
        notifications = []
        for notification in notifications_raw:
            created_at = notification['created_at']
            if created_at:
                try:
                    if isinstance(created_at, str):
                        from datetime import datetime
                        try:
                            parsed_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                        except:
                            try:
                                parsed_date = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S.%f')
                            except:
                                try:
                                    parsed_date = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S')
                                except:
                                    parsed_date = datetime.now()
                        created_at = parsed_date.isoformat()
                except:
                    created_at = datetime.now().isoformat()
            else:
                created_at = datetime.now().isoformat()
            
            notifications.append({
                "id": notification['id'],
                "user_id": notification['user_id'],
                "notification": notification['notification'],
                "read": notification['read'],
                "created_at": created_at
            })
        
        print(f"Notifications processed: {notifications}")
        return jsonify(notifications)
    except Exception as e:
        print(f"Error getting notifications: {e}")
        return jsonify({"error": "Failed to get notifications"}), 500

@app.route("/notifications/read", methods=['POST'])
def mark_notifications_as_read():
    print("test222")
    data = request.get_json()
    try:
        print(f"Received notification data: {data}")
        if "notifications" in data:
            for notification in data["notifications"]:
                if "id" in notification:
                    read_notification(notification["id"])
                else:
                    print(f"Notification missing id: {notification}")
        else:
            print(f"Data missing notifications key: {data}")
        return jsonify({"message": "Notifications marked as read successfully"})
    except Exception as e:
        print(f"Error marking notifications as read: {e}")
        return jsonify({"error": "Failed to mark notifications as read"}), 500

@app.route("/notifications/delete", methods=['POST'])
def delete_user_notification():
    data = request.get_json()
    remove_notification(data["notification_id"])
    return jsonify({"message": "Notification deleted successfully"})



#bookmarks
@app.route("/bookmarks/get", methods=['GET'])
def get_user_bookmarks():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id parameter is required"}), 400
    try:
        bookmarks_raw = get_bookmarks(int(user_id))
        print(f"Bookmarks raw: {bookmarks_raw}")
        
        # Convert RealDictRow objects to regular dictionaries
        bookmarks = []
        for bookmark in bookmarks_raw:
            bookmarks.append({
                "id": bookmark['id'],
                "user_id": bookmark['user_id'], 
                "latitude": bookmark['latitude'],
                "longitude": bookmark['longitude'],
                "name": bookmark['name'],
                "description": bookmark['description'],
                "image": bookmark['image'],
                "suburb": bookmark['suburb'],
                "hours": bookmark['hours'],
                "website": bookmark['website']
            })
        
        print(f"Bookmarks processed: {bookmarks}")
        return jsonify(bookmarks)
    except Exception as e:
        print(f"Error getting bookmarks: {e}")
        return jsonify({"error": "Failed to get bookmarks"}), 500

@app.route("/bookmarks/add", methods=['POST'])
def add_user_bookmark():
    data = request.get_json()
    bookmark_id = add_bookmark(data["user_id"], data["latitude"], data["longitude"], data["name"], data["description"], data["image"], data["suburb"], data["hours"], data["website"])
    if bookmark_id:
        return jsonify({"message": "Bookmark added successfully", "id": bookmark_id})
    else:
        return jsonify({"error": "Failed to add bookmark"}), 500

@app.route("/bookmarks/remove", methods=['POST'])
def remove_user_bookmark():
    data = request.get_json()
    remove_bookmark(data["bookmark_id"])
    return jsonify({"message": "Bookmark removed successfully"})

@app.route("/bookmarks/check_exists", methods=['POST'])
def check_user_bookmark_exists():
    data = request.get_json()
    exists = check_bookmark_exists(data["user_id"], data["latitude"], data["longitude"])
    return jsonify({"exists": exists})

@app.route("/input/user_search", methods=['POST'])
def getuser_search():
    data = request.get_json()
    user_id = data["user_id"]
    username = get_username_from_user_id(user_id)
    query = data["query"]
    results = search_friends_autocomplete(user_id, query, 10)
    all_results_usernames = [result.get("username") for result in results]
    if len(results) < 10:
        extra = search_users_autocomplete(query, 10)
        for user in extra:
            if user.get("username") not in all_results_usernames and user.get("username") != username:
                results.append(user)
            if len(results) >= 10:
                break    
    return jsonify(results)
    
#regular calendar

@app.route("/regular_calendar", methods=['POST'])
def get_user_regular_calendar():
    data = request.get_json()
    user_id = data["user_id"]
    events = get_user_events(user_id)
    events_data = []
    
    for event in events:
        event_data = get_regular_calendar_event(event)
        if event_data:
            # Get users for this specific event
            event_users = get_users_for_event(event)
            user_names = []
            for user in event_users:
                user_names.append(get_username_from_user_id(user))
            
            # Get invitations for this specific event
            event_invitations = get_invitations_for_event(event)
            invite_names = []
            for invitation in event_invitations:
                invite_names.append(get_username_from_user_id(invitation))
            
            events_data.append({
                "event_id": event,
                "location": event_data['location'],
                "latitude": event_data['latitude'],
                "longitude": event_data['longitude'],
                "date": event_data['date'],
                "start_time": event_data['start_time'],
                "end_time": event_data['end_time'],
                "description": event_data['description'],
                "host_id": event_data['host_id'],
                "users": user_names,
                "invitations": invite_names
            })
    
    return jsonify(events_data)

@app.route("/regular_calendar/add", methods=['POST'])
def add_user_regular_calendar():
    data = request.get_json()
    users = data["users"]
    add_regular_calendar_event(data["location"], data["latitude"], data["longitude"], data["date"], data["start_time"], data["end_time"], data["description"], data["host_id"])
    event_id = get_latest_event_id(data["host_id"])
    add_user_to_event(event_id, data["host_id"])
    for user in users:
        if user.get("id") != data["host_id"]:
            add_invitation_to_regular_calendar_event(event_id, user.get("id"), "pending")
    return jsonify({"message": "Event added successfully"})

@app.route("/regular_calendar/remove", methods=['POST'])
def remove_user_regular_calendar():
    data = request.get_json()
    remove_regular_calendar_event(data["event_id"])
    return jsonify({"message": "Event removed successfully"})

@app.route("/regular_calendar/update", methods=['POST'])
def update_user_regular_calendar():
    try:
        data = request.get_json()
        event_id = data["event_id"]
        location = data["location"]
        date = data["date"]
        start_time = data["start_time"]
        end_time = data["end_time"]
        description = data["description"]
        host_id = data["host_id"]
        
        update_regular_calendar_event(event_id, location, date, start_time, end_time, description, host_id)
        return jsonify({"message": "Event updated successfully"})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error updating event: {e}")
        return jsonify({"error": "Failed to update event"}), 500

#invitations
@app.route("/regular_calendar/invite", methods=['POST'])
def invite_user_regular_calendar():
    data = request.get_json()
    add_invitation_to_regular_calendar_event(data["event_id"], data["user_id"], "pending")
    return jsonify({"message": "Invitation sent successfully"})

@app.route("/regular_calendar/accept_invitation", methods=['POST'])
def accept_user_regular_calendar_invitation():
    data = request.get_json()
    event_id = data["event_id"]
    user_id = data["user_id"]
    
    # Get event details and user info for notification
    event_data = get_regular_calendar_event(event_id)
    if event_data:
        host_id = event_data['host_id']
        event_location = event_data['location']
        user_username = get_username_from_user_id(user_id)
        
        # Add user to event and remove invitation
        add_user_to_event(event_id, user_id)
        remove_invitation_to_regular_calendar_event(event_id, user_id)
        
        # Send notification to host about acceptance
        notify_host_of_acceptance(event_id, user_id, host_id, user_username, event_location)
    
    return jsonify({"message": "Invitation accepted successfully"})

@app.route("/regular_calendar/reject_invitation", methods=['POST'])
def reject_user_regular_calendar_invitation():
    data = request.get_json()
    event_id = data["event_id"]
    user_id = data["user_id"]
    
    # Get event details and user info for notification
    event_data = get_regular_calendar_event(event_id)
    if event_data:
        host_id = event_data['host_id']
        event_location = event_data['location']
        user_username = get_username_from_user_id(user_id)
        
        # Remove invitation
        remove_invitation_to_regular_calendar_event(event_id, user_id)
        
        # Send notification to host about rejection
        notify_host_of_rejection(event_id, user_id, host_id, user_username, event_location)
    
    return jsonify({"message": "Invitation rejected successfully"})

@app.route("/regular_calendar/user_invitations", methods=['POST'])
def get_user_event_invitations():
    data = request.get_json()
    user_id = data["user_id"]
    
    # Get all events where this user has pending invitations
    user_invitations = get_invitations_for_user(user_id)
    invitations_data = []
    
    for event_id in user_invitations:
        event_data = get_regular_calendar_event(event_id)
        if event_data:
            host_id = event_data['host_id']
            host_username = get_username_from_user_id(host_id)
            
            invitations_data.append({
                "event_id": event_id,
                "location": event_data['location'],
                "date": event_data['date'],
                "start_time": event_data['start_time'],
                "end_time": event_data['end_time'],
                "description": event_data['description'],
                "host_username": host_username
            })
    
    return jsonify(invitations_data)

@app.route("/regular_calendar/participants", methods=['POST'])
def get_event_participants_route():
    try:
        data = request.get_json()
        event_id = data["event_id"]
        
        participants = get_event_participants(event_id)
        return jsonify(participants)
    except Exception as e:
        print(f"Error getting event participants: {e}")
        return jsonify({"error": "Failed to get event participants"}), 500

@app.route("/regular_calendar/remove_participant", methods=['POST'])
def remove_event_participant():
    try:
        data = request.get_json()
        event_id = data["event_id"]
        user_id = data["user_id"]
        host_id = data["host_id"]
        
        remove_user_from_event(event_id, user_id, host_id)
        return jsonify({"message": "Participant removed successfully"})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error removing participant: {e}")
        return jsonify({"error": "Failed to remove participant"}), 500

@app.route("/regular_calendar/add_invitation", methods=['POST'])
def add_event_invitation():
    try:
        data = request.get_json()
        event_id = data["event_id"]
        user_id = data["user_id"]
        host_id = data["host_id"]
        
        add_invitation_by_host(event_id, user_id, host_id)
        return jsonify({"message": "Invitation added successfully"})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error adding invitation: {e}")
        return jsonify({"error": "Failed to add invitation"}), 500

@app.route("/regular_calendar/delete", methods=['POST'])
def delete_event_route():
    try:
        data = request.get_json()
        event_id = data["event_id"]
        host_id = data["host_id"]
        
        delete_event_by_host(event_id, host_id)
        return jsonify({"message": "Event deleted successfully"})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error deleting event: {e}")
        return jsonify({"error": "Failed to delete event"}), 500

@app.route("/regular_calendar/leave", methods=['POST'])
def leave_event_route():
    try:
        data = request.get_json()
        event_id = data["event_id"]
        user_id = data["user_id"]
        
        leave_event(user_id, event_id)
        return jsonify({"message": "Left event successfully"})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error leaving event: {e}")
        return jsonify({"error": "Failed to leave event"}), 500



if __name__ == "__main__":
    print("Starting PlanThat Flask Backend...")
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)