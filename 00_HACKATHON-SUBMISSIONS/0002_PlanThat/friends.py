from db_config import get_db_connection, get_db_cursor
from users import *
from notifications import *

def init_frienddb():
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS friends (
            id SERIAL PRIMARY KEY,
            friend_1_id INTEGER,
            friend_2_id INTEGER,
            FOREIGN KEY (friend_1_id) REFERENCES users (id),
            FOREIGN KEY (friend_2_id) REFERENCES users (id),
            UNIQUE(friend_1_id, friend_2_id)
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

def init_friend_requests():
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS friend_requests (
            id SERIAL PRIMARY KEY,
            friend_1_id INTEGER,
            friend_2_id INTEGER,
            FOREIGN KEY (friend_1_id) REFERENCES users (id),
            FOREIGN KEY (friend_2_id) REFERENCES users (id),
            UNIQUE(friend_1_id, friend_2_id)
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

def check_friend_request_exists(friend_1_id, friend_2_id):
    conn = get_db_connection()
    if not conn:
        return False
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return False
    
    cursor.execute("""
        SELECT 1 FROM friend_requests WHERE friend_1_id = %s AND friend_2_id = %s
    """, (friend_1_id, friend_2_id))
    exists = cursor.fetchone() is not None
    cursor.close()
    conn.close()
    return exists

def check_are_friends(friend_1_id, friend_2_id):
    conn = get_db_connection()
    if not conn:
        return False
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return False
    
    cursor.execute("""
        SELECT 1 FROM friends WHERE 
        (friend_1_id = %s AND friend_2_id = %s) OR 
        (friend_1_id = %s AND friend_2_id = %s)
    """, (friend_1_id, friend_2_id, friend_2_id, friend_1_id))
    exists = cursor.fetchone() is not None
    cursor.close()
    conn.close()
    return exists

def get_friendship_status(friend_1_id, friend_2_id):
    """
    Get the friendship status between two users.
    Returns: 'friends', 'request_sent', 'request_received', 'none'
    """
    # Check if they are already friends
    if check_are_friends(friend_1_id, friend_2_id):
        return 'friends'
    
    # Check if friend request was sent by friend_1 to friend_2
    if check_friend_request_exists(friend_1_id, friend_2_id):
        return 'request_sent'
    
    # Check if friend request was sent by friend_2 to friend_1
    if check_friend_request_exists(friend_2_id, friend_1_id):
        return 'request_received'
    
    return 'none'

def send_friend_request(friend_1_id, friend_2_id):
    # Check if they are already friends
    if check_are_friends(friend_1_id, friend_2_id):
        raise ValueError("Users are already friends")
    
    # Check if a friend request already exists (in either direction)
    if check_friend_request_exists(friend_1_id, friend_2_id):
        raise ValueError("Friend request already sent")
    
    if check_friend_request_exists(friend_2_id, friend_1_id):
        raise ValueError("Friend request already received from this user")
    
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    try:
        cursor.execute("""
            INSERT INTO friend_requests (friend_1_id, friend_2_id)
            VALUES (%s, %s)
        """, (friend_1_id, friend_2_id))
        conn.commit()
        cursor.close()
        conn.close()
        
        # Add notification after closing the friend request connection
        add_notification(friend_2_id, f"{get_username_from_user_id(friend_1_id)} sent you a friend request")
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        if "unique constraint" in str(e).lower() or "duplicate key" in str(e).lower():
            raise ValueError("Friend request already exists")
        else:
            raise e

def accept_friend_request(friend_1_id, friend_2_id):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        INSERT INTO friends (friend_1_id, friend_2_id)
        VALUES (%s, %s)
    """, (friend_1_id, friend_2_id))
    cursor.execute("""
        DELETE FROM friend_requests WHERE friend_1_id = %s AND friend_2_id = %s
    """, (friend_1_id, friend_2_id))
    conn.commit()
    cursor.close()
    conn.close()
    
    # Add notification after closing the friend request connection
    add_notification(friend_1_id, f"{get_username_from_user_id(friend_2_id)} accepted your friend request")

def remove_friend_request(friend_1_id, friend_2_id):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        DELETE FROM friend_requests WHERE friend_1_id = %s AND friend_2_id = %s
    """, (friend_1_id, friend_2_id))
    conn.commit()
    cursor.close()
    conn.close()

def get_friend_requests(user_id):
    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return []
    
    cursor.execute("""
        SELECT id, friend_1_id, friend_2_id FROM friend_requests WHERE friend_2_id = %s
    """, (user_id, ))
    friend_requests = cursor.fetchall()
    cursor.close()
    conn.close()
    return friend_requests

def get_sent_friend_requests(user_id):
    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return []
    
    cursor.execute("""
        SELECT id, friend_1_id, friend_2_id FROM friend_requests WHERE friend_1_id = %s
    """, (user_id, ))
    sent_requests = cursor.fetchall()
    cursor.close()
    conn.close()
    return sent_requests

def add_friend(friend_1_id, friend_2_id):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        INSERT INTO friends (friend_1_id, friend_2_id)
        VALUES (%s, %s)
    """, (friend_1_id, friend_2_id))
    conn.commit()
    cursor.close()
    conn.close()

def get_friends(user_id):
    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return []
    
    cursor.execute("""
        SELECT * FROM friends WHERE friend_1_id = %s OR friend_2_id = %s
    """, (user_id, user_id))
    friends = cursor.fetchall()
    cursor.close()
    conn.close()
    return friends

def remove_friend(friend_1_id, friend_2_id):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        DELETE FROM friends WHERE friend_1_id = %s AND friend_2_id = %s
    """, (friend_1_id, friend_2_id))
    conn.commit()
    cursor.close()
    conn.close()

def search_friends_autocomplete(user_id, search_term, limit=10):
    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return []

    query = """
    SELECT u.id AS friend_id, u.username
    FROM users u
    JOIN (
        SELECT friend_1_id AS friend_id FROM friends WHERE friend_2_id = %s
        UNION
        SELECT friend_2_id AS friend_id FROM friends WHERE friend_1_id = %s
    ) f ON u.id = f.friend_id
    WHERE u.username ILIKE %s
    ORDER BY 
        CASE 
            WHEN u.username ILIKE %s THEN 0  -- starts with search term
            ELSE 1                         -- contains search term elsewhere
        END,
        u.username ASC
    LIMIT %s
    """
    
    cursor.execute(
        query,
        (user_id, user_id, f"%{search_term}%", f"{search_term}%", limit)
    )
    results = cursor.fetchall()
    cursor.close()
    conn.close()

    return [dict(row) for row in results]
