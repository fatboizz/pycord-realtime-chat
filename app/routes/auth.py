from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from flask_bcrypt import check_password_hash, generate_password_hash
from app.services import auth_service
from app.utils.validators import validate_email, validate_password

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Handle user login."""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        if not username or not password:
            flash('Vui lòng điền đầy đủ thông tin', 'error')
            return render_template('auth/login.html')

        try:
            user = auth_service.get_user_by_username(username)
            if user and check_password_hash(user['password'], password):
                session['user_id'] = user['id']
                flash('Đăng nhập thành công!', 'success')
                return redirect(url_for('main.index'))

            flash('Sai tên đăng nhập hoặc mật khẩu', 'error')
        except Exception as e:
            print(f"[Auth Error] login: {e}")
            flash('Đã xảy ra lỗi, vui lòng thử lại sau', 'error')

    return render_template('auth/login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Handle user registration."""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')

        if not username or not email or not password:
            flash('Vui lòng điền đầy đủ thông tin', 'error')
            return render_template('auth/register.html')

        if not validate_email(email):
            flash('Email không hợp lệ', 'error')
            return render_template('auth/register.html')

        if not validate_password(password):
            flash('Mật khẩu phải có ít nhất 6 ký tự', 'error')
            return render_template('auth/register.html')

        try:
            if auth_service.get_user_by_username(username):
                flash('Tên đăng nhập đã tồn tại', 'error')
                return render_template('auth/register.html')

            if auth_service.get_user_by_email(email):
                flash('Email đã tồn tại', 'error')
                return render_template('auth/register.html')

            password_hash = generate_password_hash(password).decode('utf-8')
            auth_service.create_user(username, email, password_hash)

            flash('Đăng ký thành công! Vui lòng đăng nhập', 'success')
            return redirect(url_for('auth.login'))

        except Exception as e:
            print(f"[Auth Error] register: {e}")
            flash('Đã xảy ra lỗi, vui lòng thử lại sau', 'error')

    return render_template('auth/register.html')

@auth_bp.route('/logout')
def logout():
    """Handle user logout."""
    session.pop('user_id', None)
    return redirect(url_for('auth.login'))

