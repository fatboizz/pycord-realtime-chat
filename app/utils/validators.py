import re

EMAIL_REGEX = re.compile(r'^[\w\.-]+@[\w\.-]+\.\w+$')

def validate_email(email: str) -> bool:
    """Validate email address format."""
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email.strip()))

def validate_password(password: str, min_length: int = 6) -> bool:
    """Validate password minimum length."""
    if not password or not isinstance(password, str):
        return False
    return len(password) >= min_length

