import random
import string
import sqlalchemy
import marshmallow

from flask import request, jsonify, make_response, Blueprint
from app import db, bcrypt, limiter
from db_models.database_tables import User, UserPhoto
from flask_jwt_extended import (
    jwt_required,
    create_access_token,
    get_jwt_identity,
    set_access_cookies,
    get_jwt,
    unset_jwt_cookies,
)
from db_dto.user_dto import create_user_dto, edit_user_dto
from utils.file_storage import generate_presigned_url, upload_object, delete_object


auth = Blueprint("routes", __name__)


@auth.route("/register", methods=["POST"])
def register_user_page():
    try:
        new_user = create_user_dto.load(request.json)
        new_user.password_hash = bcrypt.generate_password_hash(
            new_user.password_hash
        ).decode("utf-8")

        db.session.add(new_user)
        db.session.commit()
        access_token = create_access_token(
            identity=str(new_user.user_id),
            additional_claims=create_user_dto.dump(new_user),
        )

        response = make_response(jsonify({"msg": "Login successful"}))
        set_access_cookies(response, access_token, 86400000)
        return response, 201
    except sqlalchemy.exc.IntegrityError:
        return jsonify({"msg": "Login lub adres e-mail jest już zajęty."}), 406
    except marshmallow.exceptions.ValidationError as ve:
        return jsonify({"error": ve.messages}), 400


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
            identity=str(user.user_id),
            additional_claims={
                "name": user.name,
                "surname": user.surname,
                "email": user.email,
                "login": user.login,
            },
        )
        response = make_response(jsonify({"msg": "Login successful"}))
        set_access_cookies(response, access_token, 86400000)
        return response

    return jsonify({"msg": "Incorrect Password!"}), 401


@auth.route("/logout", methods=["GET"])
def logout():
    response = make_response(jsonify({"msg": "Logout successful"}))
    unset_jwt_cookies(response)  # Remove JWT cookie
    return response


@auth.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    claims = get_jwt()
    return jsonify(
        name=claims.get("name"),
        surname=claims.get("surname"),
        email=claims.get("email"),
        login=claims.get("login"),
    )


@auth.route("/edit_user", methods=["POST", "GET"])
@jwt_required()
def edit_user():
    user_id = get_jwt_identity()

    if not user_id:
        return jsonify({"msg": "Unauthorized user"}), 401

    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    photo = UserPhoto.query.filter_by(user_id=user_id).first()

    if request.method == "GET":
        user_dict = {**edit_user_dto.dump(user)}
        if photo:
            user_dict["file_link"] = generate_presigned_url('user_photo', photo.photo_name)
        return jsonify(user_dict)

    file = request.files.get("photo")
    if not file and photo:
        delete_object('user_photo', photo.photo_name)

    try:
        json_data = {}
        if 'json' in request.form:
            import json
            json_data = json.loads(request.form['json'])
        
        if json_data:
            edit_user_dto.load(json_data, instance=user, partial=True)

        if file:
            if not photo:
                characters = string.ascii_letters + string.digits
                while True:
                    filename = ''.join(random.choices(characters, k=20))
                    resp = UserPhoto.query.filter(UserPhoto.photo_name.like(f'%filename%')).first()
                    if not resp:
                        break

                photo_db = UserPhoto(photo_name=filename, user_id=user_id)
                db.session.add(photo_db)
            else:
                filename = photo.photo_name

            upload_object(file, "user_photo", filename)

        db.session.commit()
        return jsonify({"msg": "Zapisano zmiany!"}), 200
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return (
            jsonify(
                {
                    "msg": "Nie można zmienić danych w tym momencie! Sprubój ponownie za chwile!"
                }
            ),
            400,
        )
    except marshmallow.exceptions.ValidationError as ve:
        db.session.rollback()
        return jsonify({"error": ve.messages}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Unexpected error: {str(e)}")
        return jsonify({"msg": f"Wystąpił błąd: {str(e)}"}), 500