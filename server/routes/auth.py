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
import sqlalchemy
from db_dto.user_dto import create_user_dto, edit_user_dto
import marshmallow
from utils.utils_photo import resize_image

import boto3
from botocore.client import Config

auth = Blueprint("routes", __name__)


s3_client = boto3.client(
    's3',
    endpoint_url='http://storage:9000',
    aws_access_key_id='myappuser',
    aws_secret_access_key='app_user_password',
    config=Config(signature_version='s3v4')
)


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
        return jsonify({"error": str(ve), "msg": ve.messages}), 400


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

    if request.method == "GET":
        link = s3_client.generate_presigned_url(
            "get_object",
            Params={'Bucket': 'upload', 'Key': 'user_photo/abc.webp'},
            ExpiresIn=3600
        ).replace("http://storage:9000", "/storage")
        return jsonify({**edit_user_dto.dump(user), "file_link": link})

    file = request.files.get("photo")
    if not file:
        print("File was not uploaded")
        # USUNIĘCIE ZDJĘCIA Z SERWERA

    try:
        json_data = {}
                
        if 'json' in request.form:
            import json
            json_data = json.loads(request.form['json'])
        
        if json_data:
            edit_user_dto.load(json_data, instance=user, partial=True)

        from io import BytesIO

        if file:
            print("file in request")
            # ZAPISANIE ZDJĘCIA NA SERWERZE LUB ZMIANA NA NOWE ZDJĘCIE I ZAPISANIE/AKTUALIZACJA W TABELI
            file_to_save = resize_image(file)

            s3_client.put_object(
                Bucket="upload",
                Key='user_photo/abc.webp',
                Body=file_to_save.getvalue(),
                ContentType='image/webp'
            )

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
        return jsonify({"error": str(ve), "msg": ve.messages}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Unexpected error: {str(e)}")
        return jsonify({"msg": f"Wystąpił błąd: {str(e)}"}), 500