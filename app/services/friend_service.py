from app.database import execute_query

def get_friends_for_user(user_id: int):
    """Retrieve all accepted friends for a given user."""
    return execute_query(
        """
        SELECT DISTINCT u.id, u.username, u.email, u.status
        FROM users u
        INNER JOIN friendships f 
            ON (f.user_id = u.id AND f.friend_id = %s)
            OR (f.friend_id = u.id AND f.user_id = %s)
        WHERE f.status = 'accepted'
        AND u.id != %s
        """,
        (user_id, user_id, user_id)
    )

def are_friends(user_id_1: int, user_id_2: int) -> bool:
    """Check if two users have an accepted friendship."""
    result = execute_query(
        """
        SELECT id FROM friendships 
        WHERE ((user_id = %s AND friend_id = %s) 
            OR (user_id = %s AND friend_id = %s))
        AND status = 'accepted'
        """,
        (user_id_1, user_id_2, user_id_2, user_id_1)
    )
    return len(result) > 0

def search_users(user_id: int, search_term: str):
    """Search users by username or email with friendship status relative to user_id."""
    like_term = f"%{search_term}%"
    return execute_query(
        """
        SELECT 
            u.id, 
            u.username, 
            u.email,
            CASE
                WHEN f1.status IS NOT NULL THEN f1.status
                WHEN f2.status IS NOT NULL THEN f2.status
                ELSE NULL
            END as friendship_status,
            CASE
                WHEN f1.user_id = %s THEN 'sent'
                WHEN f2.user_id = %s THEN 'received'
                ELSE NULL
            END as request_type
        FROM users u
        LEFT JOIN friendships f1 ON (f1.user_id = %s AND f1.friend_id = u.id)
        LEFT JOIN friendships f2 ON (f2.user_id = u.id AND f2.friend_id = %s)
        WHERE u.id != %s 
        AND (u.username LIKE %s OR u.email LIKE %s)
        """,
        (user_id, user_id, user_id, user_id, user_id, like_term, like_term)
    )

def get_existing_friendship(user_id: int, friend_id: int):
    """Check if any friendship record exists between two users."""
    result = execute_query(
        """
        SELECT * FROM friendships 
        WHERE (user_id = %s AND friend_id = %s)
           OR (user_id = %s AND friend_id = %s)
        """,
        (user_id, friend_id, friend_id, user_id)
    )
    return result[0] if result else None

def send_friend_request(user_id: int, friend_id: int):
    """Insert a new pending friend request."""
    return execute_query(
        """
        INSERT INTO friendships (user_id, friend_id, status)
        VALUES (%s, %s, 'pending')
        """,
        (user_id, friend_id),
        fetch=False
    )

def handle_friend_request(sender_id: int, receiver_id: int, action: str):
    """Accept or reject (delete) a pending friend request."""
    if action == 'accept':
        return execute_query(
            """
            UPDATE friendships 
            SET status = 'accepted' 
            WHERE user_id = %s AND friend_id = %s
            """,
            (sender_id, receiver_id),
            fetch=False
        )
    else:
        return execute_query(
            """
            DELETE FROM friendships 
            WHERE user_id = %s AND friend_id = %s
            """,
            (sender_id, receiver_id),
            fetch=False
        )

def get_pending_friend_requests(user_id: int):
    """Retrieve all pending friend requests received by user_id."""
    return execute_query(
        """
        SELECT f.*, u.username, u.email
        FROM friendships f
        JOIN users u ON f.user_id = u.id
        WHERE f.friend_id = %s AND f.status = 'pending'
        """,
        (user_id,)
    )

