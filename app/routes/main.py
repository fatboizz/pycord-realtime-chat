from flask import Blueprint, render_template, session, redirect, url_for
from app.services import auth_service, friend_service

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Main application dashboard."""
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))

    user_id = session['user_id']
    current_user = auth_service.get_user_by_id(user_id)
    if not current_user:
        session.pop('user_id', None)
        return redirect(url_for('auth.login'))

    users = friend_service.get_friends_for_user(user_id)
    return render_template('index.html', users=users, current_user=current_user)

