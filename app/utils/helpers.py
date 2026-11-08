from datetime import datetime

def format_timestamp(dt) -> str:
    """Format datetime object or string to ISO string."""
    if isinstance(dt, datetime):
        return dt.isoformat()
    return str(dt) if dt else ''

def sanitize_user(user_dict: dict) -> dict:
    """Remove sensitive fields like password hash from user dict."""
    if not user_dict or not isinstance(user_dict, dict):
        return {}
    clean_user = dict(user_dict)
    clean_user.pop('password', None)
    return clean_user

