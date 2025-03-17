from flask import request, jsonify, session, make_response, Blueprint
from app import db, bcrypt, limiter
from db_models.database_tables import User
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity, set_access_cookies, unset_jwt_cookies
import sqlalchemy

auth = Blueprint("auth", __name__)


@auth.route("/register", methods=["POST"])
def register_user_page():
    login = request.json.get("login", None)
    password = request.json.get("password", None)
    email = request.json.get("email", None)
    name = request.json.get("name", None)
    surname = request.json.get("surname", None)

    new_hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    new_user = User(
        email=email,
        password_hash=new_hashed_password,
        login=login,
        name=name,
        surname=surname,
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        access_token = create_access_token(
            identity={
                "email": new_user.email,
                "login": new_user.login,
                "name": new_user.name,
                "surname": new_user.surname,
            }
        )
        session["petbuddies_user"] = new_user.user_id

        response = make_response(jsonify({"msg": "Login successful"}))
        set_access_cookies(response, access_token)
        return jsonify(response), 201
    except sqlalchemy.exc.IntegrityError:
        return jsonify({"msg": "Login lub adres e-mail jest już zajęty."}), 406


@auth.route("/login", methods=["POST"])
@limiter.limit("5 per 5 minutes")
def login_mail_page():
    email = request.json.get("email", None)
    login = request.json.get("login", None)
    password = request.json.get("password", None)

    if not email and not login:
        return jsonify({"msg": "Username and Email were not provided"}), 401

    user = (
        User.query.filter_by(email=email).first()
        if email
        else User.query.filter_by(login=login).first()
    )

    if not user:
        return jsonify({"msg": "Provided user does not exist!"}), 401

    if bcrypt.check_password_hash(
        user.password_hash.encode("utf-8"), password.encode("utf-8")
    ):
        access_token = create_access_token(
            identity={
                "name": user.name,
                "surname": user.surname,
                "email": user.email,
                "login": user.login,
            }
        )
        session["petbuddies_user"] = user.id
        response = make_response(jsonify({"msg": "Login successful"}))
        set_access_cookies(response, access_token)
        return jsonify(access_token=access_token)

    return jsonify({"msg": "Incorrect Password!"}), 401


@auth.route("/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({"msg": "Logout successful"}))
    unset_jwt_cookies(response)  # Remove JWT cookie
    return response


@auth.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(user=current_user)


@auth.route("/edit_user", methods=["POST"])
def edit_user():
    user_id = session.get("petbuddies_user")

    if not user_id:
        return jsonify({"msg": "Unauthorized user"}), 401

    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    new_country = request.json.get("country", None)
    new_city = request.json.get("city", None)
    new_postal_code = request.json.get("postal_code", None)
    new_street = request.json.get("street", None)
    new_house_number = request.json.get("house_number", None)
    new_apartment_number = request.json.get("apartment_number", None)
    new_phone_number = request.json.get("phone_number", None)

    # for changing email and password we should use other paths with special authorization?
    # new_email = request.json.get("email", None)

    if new_country:
        user.country = new_country
    if new_city:
        user.city = new_city
    if new_postal_code:
        user.postal_code = new_postal_code
    if new_street:
        user.street = new_street
    if new_house_number:
        user.house_number = new_house_number
    if new_apartment_number:
        user.apartment_number = new_apartment_number
    if new_phone_number:
        user.phone_number = new_phone_number

    try:
        db.session.commit()
        return jsonify({"msg": "User data updated successfully"}), 200
    except sqlalchemy.exc.IntegrityError:
        return jsonify({"msg": "User data cannot be updated!"}), 400
