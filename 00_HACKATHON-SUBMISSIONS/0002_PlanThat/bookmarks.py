from db_config import get_db_connection, get_db_cursor

def init_bookmark_table():
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookmarks (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            name TEXT,
            description TEXT,
            image TEXT,
            suburb TEXT,
            hours TEXT,
            website TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, latitude, longitude)
        )
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id
        ON bookmarks (user_id)
    """)

    conn.commit()
    cursor.close()
    conn.close()

def add_bookmark(user_id, latitude, longitude, name, description, image, suburb, hours, website):
    conn = get_db_connection()
    if not conn:
        return None
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return None
    
    cursor.execute("""
        INSERT INTO bookmarks (user_id, latitude, longitude, name, description, image, suburb, hours, website)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (user_id, latitude, longitude, name, description, image, suburb, hours, website))
    
    result = cursor.fetchone()
    bookmark_id = result['id'] if result else None
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return bookmark_id

def get_bookmarks(user_id):
    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return []
    
    cursor.execute("""
        SELECT * FROM bookmarks WHERE user_id = %s
    """, (user_id,))
    bookmarks = cursor.fetchall()
    cursor.close()
    conn.close()
    return bookmarks

def remove_bookmark(bookmark_id):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        DELETE FROM bookmarks WHERE id = %s
    """, (bookmark_id,))
    conn.commit()
    cursor.close()
    conn.close()

def check_bookmark_exists(user_id, latitude, longitude):
    conn = get_db_connection()
    if not conn:
        return False
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return False
    
    cursor.execute("""
        SELECT * FROM bookmarks WHERE user_id = %s AND latitude = %s AND longitude = %s
    """, (user_id, latitude, longitude))
    bookmark = cursor.fetchone()
    cursor.close()
    conn.close()
    return bookmark is not None