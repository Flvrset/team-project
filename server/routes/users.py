from flask import request, jsonify, Blueprint
from app import db
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from db_models.database_tables import (
    User,
    Pet,
    UserPhoto,
    PetPhoto,
    Post,
    PetCareApplication,
    UserRating,
    Report,
)
from db_dto.post_dto import get_user_dto
from db_dto.rating_dto import user_rating_dto, user_ratings_dto
from db_dto.report_dto import report_dto

import sqlalchemy
from utils.file_storage import generate_presigned_url
from datetime import datetime, timedelta

user_bprt = Blueprint("user", __name__)


@user_bprt.route("/user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    subquery_rating = (
        db.session.query(
            UserRating.user_id,
            sqlalchemy.func.avg(UserRating.star_number).label("rating_overall"),
            sqlalchemy.func.json_agg(
                sqlalchemy.func.json_build_object(
                    "usr_rating_id",
                    UserRating.user_rating_id,
                    "star_number",
                    UserRating.star_number,
                    "description",
                    UserRating.description,
                )
            ).label("rating_lst"),
        )
        .filter(UserRating.user_id == user_id)
        .group_by(UserRating.user_id)
        .subquery()
    )
    alias_subquery_rating = sqlalchemy.alias(subquery_rating)

    subquery_pet = (
        db.session.query(
            Pet.user_id,
            sqlalchemy.func.json_agg(
                sqlalchemy.func.json_build_object(
                    "pet_id",
                    Pet.pet_id,
                    "pet_name",
                    Pet.pet_name,
                    "type",
                    Pet.type,
                    "race",
                    Pet.race,
                    "size",
                    Pet.size,
                    "birth_date",
                    Pet.birth_date,
                    "description",
                    Pet.description,
                    "photo",
                    PetPhoto.photo_name,
                )
            ).label("pet_lst"),
        )
        .filter(Pet.user_id == user_id)
        .outerjoin(PetPhoto, PetPhoto.pet_id == Pet.pet_id)
        .group_by(Pet.user_id)
        .subquery()
    )
    alias_subquery_pet = sqlalchemy.alias(subquery_pet)

    user, user_photo, rating_overall, rating_lst, pet_lst = (
        db.session.query(
            User,
            UserPhoto,
            alias_subquery_rating.c.rating_overall,
            alias_subquery_rating.c.rating_lst,
            alias_subquery_pet.c.pet_lst,
        )
        .outerjoin(UserPhoto, User.user_id == UserPhoto.user_id)
        .outerjoin(
            alias_subquery_rating, User.user_id == alias_subquery_rating.c.user_id
        )
        .outerjoin(alias_subquery_pet, User.user_id == alias_subquery_pet.c.user_id)
        .filter(User.user_id == user_id)
        .first()
    )

    if not user:
        return jsonify({"msg": "Podany użytkownik nie istnieje!"}), 404

    user_dict = get_user_dto.dump(user)
    user_dict["photo"] = (
        generate_presigned_url("user_photo", user_photo.photo_name) if user_photo else ""
    )
    user_dict["rating"] = float(rating_overall) if rating_overall else rating_overall
    user_dict["can_report"] = user_dict["user_id"] != int(get_jwt_identity())

    if pet_lst:
        for pet in pet_lst:
            pet["photo"] = (
                generate_presigned_url("pet_photo", pet["photo"])
                if pet["photo"]
                else ""
            )

    return (
        jsonify(
            {
                "user": user_dict,
                "pets": pet_lst,
                "ratings": user_ratings_dto.dump(rating_lst),
            }
        ),
        200,
    )


@user_bprt.route("/post/<int:post_id>/reviewUser/<int:user_id>", methods=["POST"])
@jwt_required()
def review_owner(post_id, user_id):
    if user_id == int(get_jwt_identity()):
        return jsonify({"msg": "Nie możesz sobie sam wystawić oceny!"}), 40

    volunteer = (
        db.session.query(User.user_id)
        .join(PetCareApplication, PetCareApplication.user_id == User.user_id)
        .filter(
            sqlalchemy.and_(
                User.user_id == int(get_jwt_identity()),
                PetCareApplication.accepted == True,
                PetCareApplication.post_id == post_id,
            )
        )
        .first()
    )

    owner = (
        db.session.query(Post)
        .filter(
            sqlalchemy.and_(
                Post.post_id == post_id, Post.user_id == int(get_jwt_identity())
            ),
        )
        .first()
    )

    if volunteer or owner:
        return (
            jsonify(
                {
                    "msg": "Nie brałeś udziały w danym ogłoszeniu! Nie możesz napisać recenzji"
                }
            ),
            404,
        )

    rating_dto = user_rating_dto.load(request.json)
    rating_dto.petcareapplication_id = (
        db.session.query(PetCareApplication.petcareapplication_id)
        .join(Post, Post.post_id == PetCareApplication.post_id)
        .filter(
            sqlalchemy.or_(
                Post.user_id == user_id, PetCareApplication.user_id == user_id
            )
        )
        .scalar()
    )
    rating_dto.user_id = user_id

    try:
        db.session.add(rating_dto)
        db.session.commit()

        return jsonify({"msg": "Dziękujemy za Twoją opinię i czas! :)"}), 200
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return (
            jsonify({"msg": "Nie można dodać oceny aktualnie! Spróbuj później!"}),
            400,
        )


@user_bprt.route("/user/<int:user_id>/report", methods=["POST"])
@jwt_required()
def report_user(user_id):
    last_report = (
        db.session.query(Report)
        .filter(
            sqlalchemy.and_(
                Report.who_user_id == int(get_jwt_identity()),
                Report.whom_user_id == user_id,
            )
        )
        .first()
    )

    if last_report and abs(
        datetime.combine(last_report.report_date, last_report.report_time)
        - datetime.now()
    ) < timedelta(days=3):
        return (
            jsonify(
                {
                    "msg": "Użytkownik został zgłoszony przez Ciebie w ostatnich trzech dniach!"
                }
            ),
            404,
        )

    report = report_dto.load(request.json)
    report.who_user_id = int(get_jwt_identity())
    report.whom_user_id = user_id

    try:
        db.session.add(report)
        db.session.commit()
        return jsonify(
            {
                "msg": (
                    "Dziękujemy za zgłoszenie i Twój udział w polepszaniu naszej społeczności! "
                    + "Rozpatrzymy wniosek jak najszybciej!"
                )
            }
        )
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return (
            jsonify({"msg": "Nie można dodać oceny aktualnie! Spróbuj później!"}),
            400,
        )
