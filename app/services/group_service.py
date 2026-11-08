from app.database import get_db_connection, execute_query
from app.utils.helpers import format_timestamp

def get_user_groups(user_id: int):
    """Retrieve all groups the user is a member of with member counts."""
    groups = execute_query(
        """
        SELECT g.id, g.name, g.created_at, COUNT(gm2.user_id) AS member_count
        FROM `groups` g
        JOIN group_members gm1 ON g.id = gm1.group_id
        LEFT JOIN group_members gm2 ON g.id = gm2.group_id
        WHERE gm1.user_id = %s
        GROUP BY g.id, g.name, g.created_at
        ORDER BY g.created_at DESC
        """,
        (user_id,)
    )
    for g in groups:
        g['created_at'] = format_timestamp(g.get('created_at'))
    return groups

def is_group_member(group_id: int, user_id: int) -> bool:
    """Check if a user is a member of a given group."""
    result = execute_query(
        "SELECT id FROM group_members WHERE group_id = %s AND user_id = %s",
        (group_id, user_id)
    )
    return len(result) > 0

def get_group_members(group_id: int):
    """Retrieve all members of a group."""
    return execute_query(
        """
        SELECT u.id, u.username, u.email, u.status
        FROM users u
        JOIN group_members gm ON u.id = gm.user_id
        WHERE gm.group_id = %s
        """,
        (group_id,)
    )

def create_group(name: str, creator_id: int, member_ids: list):
    """
    Create a new group, attach members, and post an initial welcome message.
    Executes in a single atomic database transaction.
    """
    all_members = set(int(m) for m in member_ids)
    all_members.add(int(creator_id))

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # 1. Create group
        cursor.execute("INSERT INTO `groups` (name, created_at) VALUES (%s, NOW())", (name,))
        group_id = cursor.lastrowid

        # 2. Add members
        for member_id in all_members:
            cursor.execute(
                "INSERT INTO group_members (group_id, user_id, joined_at) VALUES (%s, %s, NOW())",
                (group_id, member_id)
            )

        # 3. Add system welcome message
        welcome_message = f"Nhóm '{name}' đã được tạo"
        cursor.execute(
            "INSERT INTO group_messages (group_id, sender_id, content, created_at) VALUES (%s, %s, %s, NOW())",
            (group_id, creator_id, welcome_message)
        )

        conn.commit()

        # 4. Fetch created group details
        cursor.execute(
            """
            SELECT g.id, g.name, g.created_at, COUNT(gm.user_id) AS member_count
            FROM `groups` g
            LEFT JOIN group_members gm ON g.id = gm.group_id
            WHERE g.id = %s
            GROUP BY g.id, g.name, g.created_at
            """,
            (group_id,)
        )
        group_info = cursor.fetchone()
        if group_info:
            group_info['created_at'] = format_timestamp(group_info.get('created_at'))
        return group_info

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

