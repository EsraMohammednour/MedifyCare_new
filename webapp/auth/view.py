from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, logout_user
from werkzeug.utils import secure_filename
import os
from .models import db, User, Role


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

auth_blueprint = Blueprint('auth', __name__)

@auth_blueprint.route('/register', methods=['POST'])
def register():
    data = request.form

    new_user = User()
    new_user.form_dict({
        'username': data.get('username'),
        'email': data.get('email'),
        'password': data.get('password'),
        'specialty': data.get('specialty'),
        'bio': data.get('bio')
    })

    role_id = data.get('role')
    selected_role = Role.query.get(role_id)
    new_user.roles.append(selected_role)

    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            new_user.image_filename = filename

    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.to_dict()), 201


@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    user = User.query.filter_by(email=data.get('email')).first()

    if user and user.check_password(data.get('password')):
        login_user(user, remember=data.get('remember', False))
        return jsonify({'message': 'You have been logged in.', 'user': user.to_dict()}), 200
    else:
        return jsonify({'error': 'Invalid emaili or password'}), 401


@auth_blueprint.route('/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({'message': 'You have been logged out.'}), 200
