from datetime import datetime
from app.database import execute_query
from app.utils.helpers import format_timestamp

def get_direct_chat_history(user_id: int, friend_id: int):
    """Retrieve full chronological chat history between two users."""
    messages = execute_query(
        """
        SELECT m.id, m.sender_id, m.receiver_id, m.content, m.created_at,
               u.username AS sender_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE (m.sender_id = %s AND m.receiver_id = %s)
           OR (m.sender_id = %s AND m.receiver_id = %s)
        ORDER BY m.created_at ASC
        """,
        (user_id, friend_id, friend_id, user_id)
    )
    for msg in messages:
        msg['created_at'] = format_timestamp(msg.get('created_at'))
    return messages

def save_direct_message(sender_id: int, receiver_id: int, content: str):
    """Save a direct message and return the enriched message payload."""
    msg_id = execute_query(
        """
        INSERT INTO messages (sender_id, receiver_id, content, created_at)
        VALUES (%s, %s, %s, NOW())
        """,
        (sender_id, receiver_id, content),
        fetch=False
    )
    
    # Retrieve sender username
    sender = execute_query("SELECT username FROM users WHERE id = %s", (sender_id,))
    sender_name = sender[0]['username'] if sender else 'Unknown'

    return {
        'id': msg_id,
        'sender_id': sender_id,
        'receiver_id': receiver_id,
        'content': content,
        'sender_name': sender_name,
        'created_at': datetime.now().isoformat()
    }

def get_group_messages(group_id: int):
    """Retrieve full chronological chat history for a group."""
    messages = execute_query(
        """
        SELECT gm.id, gm.group_id, gm.sender_id, gm.content, gm.created_at,
               u.username AS sender_name
        FROM group_messages gm
        JOIN users u ON gm.sender_id = u.id
        WHERE gm.group_id = %s
        ORDER BY gm.created_at ASC
        """,
        (group_id,)
    )
    for msg in messages:
        msg['created_at'] = format_timestamp(msg.get('created_at'))
    return messages

def save_group_message(group_id: int, sender_id: int, content: str):
    """Save a group message and return the enriched message payload."""
    msg_id = execute_query(
        """
        INSERT INTO group_messages (group_id, sender_id, content, created_at)
        VALUES (%s, %s, %s, NOW())
        """,
        (group_id, sender_id, content),
        fetch=False
    )

    sender = execute_query("SELECT username FROM users WHERE id = %s", (sender_id,))
    sender_name = sender[0]['username'] if sender else 'Unknown'

    return {
        'id': msg_id,
        'group_id': group_id,
        'sender_id': sender_id,
        'content': content,
        'sender_name': sender_name,
        'created_at': datetime.now().isoformat()
    }

