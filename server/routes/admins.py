from flask import request, jsonify, Blueprint
from app import db
from flask_jwt_extended import jwt_required, get_jwt
from db_models.database_tables import (
    User,
    Report,
    ReportType,
    Post,
    UserRating,
    Pet,
    UserPhoto,
    PetPhoto,
)
from db_dto.post_dto import get_user_dto, get_users_dto
from db_dto.rating_dto import user_rating_dto, user_ratings_dto
from db_dto.report_dto import admin_report_dto
from utils.file_storage import generate_presigned_url

import sqlalchemy
from sqlalchemy.orm import aliased

admin_bprt = Blueprint("admin", __name__)


@admin_bprt.route("/adminPanel/dashboard", methods=["GET"])
@jwt_required()
def get_admin_dashboard():
    claims = get_jwt()

    if not claims.get("is_admin"):
        return jsonify({"msg": "Nie masz dostępu do tej funkcji!"}), 404

    active_report_count = (
        db.session.query(sqlalchemy.func.count(Report.report_id))
        .filter(Report.was_considered == False)
        .scalar()
    )

    post_count, active_post_count = db.session.query(
        sqlalchemy.func.count(Post.post_id),
        sqlalchemy.func.sum(sqlalchemy.case((Post.is_active == True, 1), else_=0)),
    ).first()

    user_count, banned_user_count = db.session.query(
        sqlalchemy.func.count(User.user_id),
        sqlalchemy.func.sum(sqlalchemy.case((User.is_banned == True, 1), else_=0)),
    ).first()

    return jsonify({
        "active_report_count": active_report_count,
        "post_count": post_count,
        "active_post_count": active_post_count,
        "user_count": user_count,
        "banned_user_count": banned_user_count,
    })


@admin_bprt.route("/adminPanel/reports", methods=["GET"])
@jwt_required()
def get_reports_admin():
    claims = get_jwt()

    if not claims.get("is_admin"):
        return jsonify({"msg": "Nie masz dostępu do tej funkcji!"}), 404

    Reporter = aliased(User, name="reporter")
    Reported = aliased(User, name="reported")

    user_rating = (
        db.session.query(
            UserRating.user_id,
            sqlalchemy.func.avg(UserRating.star_number).label("rating"),
        )
        .group_by(UserRating.user_id)
        .subquery()
    )

    alias_reported_user_rating = sqlalchemy.alias(user_rating)
    alias_reporter_user_rating = sqlalchemy.alias(user_rating)

    report_lst = (
        db.session.query(
            Report,
            Reported,
            Reporter,
            ReportType.report_type_name,
            alias_reported_user_rating.c.rating,
            alias_reporter_user_rating.c.rating,
        )
        .join(Reported, Report.whom_user_id == Reported.user_id)
        .join(Reporter, Report.who_user_id == Reporter.user_id)
        .join(ReportType, Report.report_type_id == ReportType.report_type_id)
        .join(
            alias_reported_user_rating,
            alias_reported_user_rating.c.user_id == Report.who_user_id,
            isouter=True,
        )
        .join(
            alias_reporter_user_rating,
            alias_reporter_user_rating.c.user_id == Report.whom_user_id,
            isouter=True,
        )
        .filter(Report.was_considered == False)
        .all()
    )

    if not report_lst:
        return jsonify({"msg": "Brak nowych zgłoszeń"}), 200

    return jsonify(
        [
            {
                "report": {
                    **admin_report_dto.dump(report),
                    "report_type_name": report_type_name,
                },
                "reporter_user": {
                    **get_user_dto.dump(reporter),
                    "rating": rating_reporter,
                },
                "reported_user": {
                    **get_user_dto.dump(reported),
                    "rating": rating_reported,
                },
            }
            for report, reported, reporter, report_type_name, rating_reported, rating_reporter in report_lst
        ]
    )


@admin_bprt.route("/adminPanel/reports/<int:user_id>/ban", methods=["PUT"])
@jwt_required()
def ban_user(user_id):
    claims = get_jwt()

    if not claims.get("is_admin"):
        return jsonify({"msg": "Nie masz dostępu do tej funkcji!"}), 404

    user = db.session.query(User).filter(User.user_id == user_id).first()

    user_posts = db.session.query(Post).filter(Post.user_id == user_id).all()

    user_reports = db.session.query(Report).filter(Report.whom_user_id == user_id).all()

    try:
        user.is_banned = True

        if user_posts:
            for post in user_posts:
                post.is_active = False

        if user_reports:
            for report in user_reports:
                report.was_considered = True
        db.session.commit()
        return jsonify({"msg": "Użytkownik zbanowany!"}), 200
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return (
            jsonify({"msg": "Serwer nie działa! Idź pospamić o to do IT!"}),
            400,
        )


@admin_bprt.route("/adminPanel/reports/<int:user_id>/unban", methods=["PUT"])
@jwt_required()
def unban_user(user_id):
    claims = get_jwt()

    if not claims.get("is_admin"):
        return jsonify({"msg": "Nie masz dostępu do tej funkcji!"}), 404

    user = db.session.query(User).filter(User.user_id == user_id).first()

    try:
        user.is_banned = True

        db.session.commit()
        return jsonify({"msg": "Użytkownik odbanowany!"}), 200
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return (
            jsonify({"msg": "Serwer nie działa! Idź pospamić o to do IT!"}),
            400,
        )


@admin_bprt.route("/adminPanel/removePost/<int:post_id>", methods=["PUT"])
@jwt_required()
def remove_post(post_id):
    claims = get_jwt()

    if not claims.get("is_admin"):
        return jsonify({"msg": "Nie masz dostępu do tej funkcji!"}), 404

    post = db.session.query(Post).filter(Post.post_id == post_id).first()

    try:
        post.is_active = False

        db.session.commit()
        return jsonify({"msg": "Post usunięty!"}), 200
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return (
            jsonify({"msg": "Serwer nie działa! Idź pospamić o to do IT!"}),
            400,
        )


@admin_bprt.route("/adminPanel/users", methods=["GET"])
@jwt_required()
def get_users_admin():
    claims = get_jwt()

    if not claims.get("is_admin"):
        return jsonify({"msg": "Nie masz dostępu do tej funkcji!"}), 404

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
        .outerjoin(PetPhoto, PetPhoto.pet_id == Pet.pet_id)
        .group_by(Pet.user_id)
        .subquery()
    )
    alias_subquery_pet = sqlalchemy.alias(subquery_pet)

    users_info_lst = (
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
        .all()
    )

    users_resp_lst = []
    for user, user_photo, rating_overall, rating_lst, pet_lst in users_info_lst:
        user_dict = get_user_dto.dump(user)
        user_dict["photo"] = (
            generate_presigned_url("user_photo", user_photo.photo) if user_photo else ""
        )
        user_dict["rating"] = (
            float(rating_overall) if rating_overall else rating_overall
        )
        user_dict["can_report"] = True

        if pet_lst:
            for pet in pet_lst:
                pet["photo"] = (
                    generate_presigned_url("pet_photo", pet["photo"])
                    if pet["photo"]
                    else ""
                )

        users_resp_lst.append(
            {
                "user": user_dict,
                "pets": pet_lst,
                "ratings": user_ratings_dto.dump(rating_lst),
            }
        )

    return (
        jsonify(users_resp_lst),
        200,
    )
