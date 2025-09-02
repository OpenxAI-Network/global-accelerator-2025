from db_config import get_db_connection, get_db_cursor

def init_invite_table():
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS invites (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            invite_code TEXT,
            timestamp TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

def create_invite(user_id, invite_code, timestamp):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        INSERT INTO invites (user_id, invite_code, timestamp)
        VALUES (%s, %s, %s)
    """, (user_id, invite_code, timestamp))
    conn.commit()
    cursor.close()
    conn.close()

def get_invites(user_id):
    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return []
    
    cursor.execute("""
        SELECT * FROM invites WHERE user_id = %s
    """, (user_id,))
    invites = cursor.fetchall()
    cursor.close()
    conn.close()
    return invites

def remove_invite(invite_id):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        DELETE FROM invites WHERE id = %s
    """, (invite_id,))
    #add to google calendar
    conn.commit()
    cursor.close()
    conn.close()