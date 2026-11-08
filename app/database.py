import mysql.connector
from mysql.connector import Error
from app.config import get_db_config

def get_db_connection():
    """Establish and return a new MySQL database connection."""
    config = get_db_config()
    return mysql.connector.connect(**config)

def execute_query(query, params=None, fetch=True):
    """
    Execute a parameterized SQL query safely.

    :param query: SQL query with %s placeholders
    :param params: Tuple or list of parameters to bind
    :param fetch: True to return fetched rows (list of dicts), 
                  False to commit transaction and return lastrowid
    :return: list[dict] if fetch=True, or int (lastrowid / affected rows) if fetch=False
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, params or ())
        if fetch:
            result = cursor.fetchall()
            return result
        conn.commit()
        # Return cursor.lastrowid if an insert occurred, else affected rowcount or True
        return cursor.lastrowid if cursor.lastrowid else (cursor.rowcount or True)
    except Exception as e:
        conn.rollback()
        print(f"[Database Error]: {e} | Query: {query} | Params: {params}")
        raise e
    finally:
        cursor.close()
        conn.close()

