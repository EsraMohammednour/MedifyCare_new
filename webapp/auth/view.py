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
        "message": "User registered successfully",
        "user": new_user.to_dict()
        }), 201


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
        return jsonify({'error': 'Invalid email or password'}), 401


@auth_blueprint.route('/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({'message': 'You have been logged out.'}), 200
