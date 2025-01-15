from flask import Blueprint, request, jsonify, current_app, render_template_string, url_for
from flask_login import login_user, logout_user, current_user
from werkzeug.utils import secure_filename
import os
from .models import db, User, Role
from .. import mail
from flask_mailman import EmailMessage
from .reset_password_email_content import reset_password_email_html_content


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

auth_blueprint = Blueprint('auth', __name__)

@auth_blueprint.route('/register', methods=['POST'])
def register():
    "register new user"
    data = request.get_json()

    # Check if username already exists
    existing_user = User.query.filter_by(email=data.get('email')).first()
    if existing_user:
        return jsonify({"status": "error", "message": "Username already exists"}), 409

    #Create new user and populate it using from_dict method 
    new_user = User()
    new_user.from_dict(data)

    #Retrieve and assign role
    role_name = data.get('role')
    selected_role = Role.query.filter_by(name=role_name).first()
    if selected_role:
        new_user.roles.append(selected_role)

    #Handle file upload if provided
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            new_user.image_filename = filename

    #Add user to the database and commit
    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    #Return success response
    return jsonify({
        "status": "success",
        "message": "User registered successfully"
        }), 201


@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    user = User.query.filter_by(email=data.get('email')).first()

    if user and user.check_password(data.get('password')):
        login_user(user, remember=data.get('remember', False))
        return jsonify({'message': 'You have been logged in.'}), 200
    else:
        return jsonify({'error': 'Invalid email or password'}), 401


@auth_blueprint.route('/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({'message': 'You have been logged out.'}), 200


@auth_blueprint.route('/reset_password', methods=['POST'])
def reset_password_request():
    '''Handle password reset requests'''
    if current_user.is_authenticated:
        return jsonify({'message': 'Already authenticated'}), 400
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    user = User.query.filter_by(email=email).first()
    if user:
        send_reset_password_email(user)
        return jsonify({'message': 'Instructions to reset your password were sent to your email address if it exists in our system.'}), 200
    else:
        return jsonify({'error': 'User not found'}), 404


def send_reset_password_email(user):
    '''Send email  for the user to reset his password'''
    reset_password_url = url_for("auth.reset_password",
        token=user.generate_reset_password_token(),
        user_id=user.id,
        _external=True,
    )
    email_body = render_template_string(
        reset_password_email_html_content,
        reset_password_url=reset_password_url
    )
    message = EmailMessage(
            subject="Reset your password",
            body=email_body,
            to=[user.email]
    )
    message.content_subtype = 'html'

    message.send()

@auth_blueprint.route('/reset_password/<token>/<int:user_id>', methods=['POST'])
def reset_password(token, user_id):
    if current_user.is_authenticated:
        return jsonify({'message': 'Already authenticated'}), 400

    user = User.validate_reset_password_token(token,user_id)
    if not user:
        return jsonify({'error': 'Invalid or expired token'}), 400
    data = request.get_json()
    password = data.get('password')
    if not password:
        return jsonify({'error': 'Password is required'}), 400
    
    user.set_password(password)
    db.session.commit()
    return jsonify({'message': 'Password has been reset successfully'}), 200
