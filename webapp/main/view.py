from flask import Blueprint, jsonify, redirect, url_for, render_template, request
from flask_login import login_required, current_user
from .. import db
from ..auth.models import User, Role
main_blueprint = Blueprint(
		    'main',
		    __name__,
		    template_folder='../templates',
		    url_prefix='/'
		)


@main_blueprint.route('/')
def index():
	doctors = db.session.query(
        User.username,
        User.specialty,
        User.bio,
		User.image_filename
    ).join(User.roles).filter(Role.name == 'doctor').all()
	doctor_list = [
		{
			"username": doctor.username,
			"specialty": doctor.specialty,
			"bio": doctor.bio,
			"image_filename": doctor.image_filename
		} for doctor in doctors
	]
	specialties = list(set(doctor.specialty for doctor in doctors))
	return jsonify({"doctors": doctor_list, "specialties": specialties})	

