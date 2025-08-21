from db_config import get_db_connection, get_db_cursor
from datetime import datetime

def init_notification_table():
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            notification TEXT,
            read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

def add_notification(user_id, notification):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        INSERT INTO notifications (user_id, notification, read, created_at)
        VALUES (%s, %s, %s, %s)
    """, (user_id, notification, False, datetime.now().isoformat()))
    conn.commit()
    cursor.close()
    conn.close()

def get_notifications(user_id):
    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return []
    
    cursor.execute("""
        SELECT * FROM notifications WHERE user_id = %s
    """, (user_id,))
    notifications = cursor.fetchall()
    cursor.close()
    conn.close()
    return notifications

def remove_notification(notification_id):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        DELETE FROM notifications WHERE id = %s
    """, (notification_id,))
    conn.commit()
    cursor.close()
    conn.close()

def read_notification(notification_id):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        UPDATE notifications SET read = TRUE WHERE id = %s
    """, (notification_id,))
    conn.commit()
    cursor.close()
    conn.close()