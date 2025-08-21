import os
import psycopg2
from psycopg2.extras import RealDictCursor

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'planthat_db',
    'user': 'nathanroland',
    'password': 'password'
}

def get_db_connection():
    """Get a database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def get_db_cursor(conn):
    """Get a database cursor with RealDictCursor for named columns"""
    try:
        return conn.cursor(cursor_factory=RealDictCursor)
    except Exception as e:
        print(f"Error creating cursor: {e}")
        return None
