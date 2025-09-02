from db_config import get_db_connection, get_db_cursor

class User():
    def __init__(self, username, dob, city, country, zipcode, email, bio, interests, hobbies, food, drinks, nightlife, nature, arts, entertainment, sports, shopping, music, diet_restrictions, dislikes):
        self.username = username
        self.dob = dob
        self.city = city
        self.country = country
        self.zipcode = zipcode
        self.email = email
        self.bio = bio
        self.food = food
        self.drinks = drinks
        self.nightlife = nightlife
        self.nature = nature
        self.arts = arts
        self.entertainment = entertainment
        self.sports = sports
        self.shopping = shopping
        self.music = music
        self.diet_restrictions = diet_restrictions
        self.dislikes = dislikes
    
    def get_diet_restrictions(self):
        return self.diet_restrictions.split(",")
    
    def get_dislikes(self):
        return self.dislikes.split(",")

    def get_city(self):
        return self.city
    
    def get_country(self):
        return self.country

def init_userdb():
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    #cursor.execute("DROP TABLE IF EXISTS users")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            dob DATE NOT NULL,
            city VARCHAR(255) NOT NULL,
            country VARCHAR(255) NOT NULL,
            zipcode VARCHAR(50) NOT NULL,
            email VARCHAR(255) NOT NULL,
            bio TEXT,
            food INTEGER NOT NULL DEFAULT 5,
            drinks INTEGER NOT NULL DEFAULT 5,
            nightlife INTEGER NOT NULL DEFAULT 5,
            nature INTEGER NOT NULL DEFAULT 5,
            arts INTEGER NOT NULL DEFAULT 5,
            entertainment INTEGER NOT NULL DEFAULT 5,
            sports INTEGER NOT NULL DEFAULT 5,
            shopping INTEGER NOT NULL DEFAULT 5,
            music INTEGER NOT NULL DEFAULT 5,
            diet_restrictions TEXT,
            dislikes TEXT
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

def add_user(username, password, dob, city, country, zipcode, email, bio, food, drinks, nightlife, nature, arts, entertainment, sports, shopping, music, diet_restrictions, dislikes):
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return
    
    cursor.execute("""
        INSERT INTO users (username, password, dob, city, country, zipcode, email, bio, food, drinks, nightlife, nature, arts, entertainment, sports, shopping, music, diet_restrictions, dislikes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (username, password, dob, city, country, zipcode, email, bio, food, drinks, nightlife, nature, arts, entertainment, sports, shopping, music, diet_restrictions, dislikes))
    conn.commit()
    cursor.close()
    conn.close()

def get_user(userID):
    conn = get_db_connection()
    if not conn:
        return None
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return None
    
    cursor.execute("""
        SELECT * FROM users WHERE id = %s
    """, (userID,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not user:
        return None
    
    # user is now a dict with column names as keys
    user_class = User(
        user['username'],
        user['dob'],
        user['city'],
        user['country'],
        user['zipcode'],
        user['email'],
        user['bio'],
        None,     # interests (not in DB)
        None,     # hobbies (not in DB)
        user['food'],
        user['drinks'],
        user['nightlife'],
        user['nature'],
        user['arts'],
        user['entertainment'],
        user['sports'],
        user['shopping'],
        user['music'],
        user['diet_restrictions'],
        user['dislikes']
    )
    return user_class

def login_user(username, password):
    conn = get_db_connection()
    if not conn:
        return None
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return None
    
    cursor.execute("""
        SELECT * FROM users WHERE username = %s AND password = %s
    """, (username, password,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if user:
        # Convert dict to tuple for compatibility with existing code
        return tuple(user.values())
    return None

def search_users_autocomplete(username, limit=10):
    """
    Search users for autocomplete:
    - Exact matches ranked highest
    - Partial matches after exact matches
    - Case-insensitive
    """
    username = username.strip()
    if not username:
        return []

    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return []

    query = """
    SELECT id, username,
           CASE
               WHEN username = %s THEN 0
               ELSE 1
           END AS rank
    FROM users
    WHERE username ILIKE %s
    ORDER BY rank, username
    LIMIT %s
    """
    cursor.execute(query, (username, f"%{username}%", limit))
    results = cursor.fetchall()
    cursor.close()
    conn.close()

    # Convert results to list of dicts for easy JSON serialisation
    return [dict(row) for row in results]

def get_username_from_user_id(user_id):
    conn = get_db_connection()
    if not conn:
        return "Unknown User"
    
    cursor = get_db_cursor(conn)
    if not cursor:
        conn.close()
        return "Unknown User"
    
    cursor.execute("""
        SELECT username FROM users WHERE id = %s
    """, (user_id,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return result['username'] if result else "Unknown User"