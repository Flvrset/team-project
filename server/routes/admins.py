from flask import request, jsonify, Blueprint
from app import db
from flask_jwt_extended import jwt_required, get_jwt
from db_models.database_tables import User, Report, ReportType, Post, UserRating
from db_dto.post_dto import get_user_dto
from db_dto.rating_dto import user_rating_dto, user_ratings_dto
from db_dto.report_dto import admin_report_dto

import sqlalchemy
from sqlalchemy.orm import aliased

admin_bprt = Blueprint("admin", __name__)


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
            is_outer=True,
        )
        .join(
            alias_reporter_user_rating,
            alias_reporter_user_rating.c.user_id == Report.whom_user_id,
            is_outer=True,
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
