from app.database import execute_query

def get_user_by_id(user_id: int):
    """Retrieve user record by user ID."""
    users = execute_query("SELECT * FROM users WHERE id = %s", (user_id,))
    return users[0] if users else None

def get_user_by_username(username: str):
    """Retrieve user record by username."""
    users = execute_query("SELECT * FROM users WHERE username = %s", (username,))
    return users[0] if users else None

def get_user_by_email(email: str):
    """Retrieve user record by email."""
    users = execute_query("SELECT * FROM users WHERE email = %s", (email,))
    return users[0] if users else None

def create_user(username: str, email: str, password_hash: str):
    """Create a new user with active status."""
    return execute_query(
        """
        INSERT INTO users (username, email, password, status, created_at)
        VALUES (%s, %s, %s, 'active', NOW())
        """,
        (username, email, password_hash),
        fetch=False
    )

