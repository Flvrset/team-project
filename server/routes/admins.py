from flask import request, jsonify, Blueprint
from app import db
from flask_jwt_extended import (
    jwt_required,
    get_jwt
)
from db_models.database_tables import User, Report, ReportType
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

    report_lst = (
        db.session.query(Report, Reported, Reporter, ReportType.report_type_name)
        .join(Reported, Report.whom_user_id == Reported.user_id)
        .join(Reporter, Report.who_user_id == Reporter.user_id)
        .join(ReportType, Report.report_type_id == ReportType.report_type_id)
        .all()
    )

    if not report_lst:
        return jsonify({"msg": "Brak nowych zgłoszeń"}), 200

    return jsonify(
        [
            {"report": admin_report_dto.dump(report).assign_report_type_name(report_type_name), "reporter_user": get_user_dto.dump(reporter), "reported_user": get_user_dto.dump(reported)}
            for report, reported, reporter, report_type_name in report_lst
        ]
    )
