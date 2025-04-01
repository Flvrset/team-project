from flask import request, jsonify, Blueprint
from app import db
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from db_models.database_tables import User, Report, ReportType
from db_dto.post_dto import get_user_dto
from db_dto.rating_dto import user_rating_dto, user_ratings_dto
from db_dto.report_dto import report_dto

import sqlalchemy
from utils.file_storage import generate_presigned_url

admin_bprt = Blueprint("admin", __name__)


@admin_bprt.route("/adminPanel/reports", methods=["GET"])
@jwt_required()
def get_reports_admin():
    report_desc_agg_query = (
        db.session.query(
            Report.whom_user_id,
            Report.report_type_id,
            sqlalchemy.func.array_agg(Report.description).label("agg_desc"),
        )
        .group_by(Report.whom_user_id)
        .subquery()
    )
    report_desc_agg_alias = sqlalchemy.alias(report_desc_agg_query)

    report_agg_subquery = (
        db.session.query(
            report_desc_agg_alias.c.whom_user_id,
            sqlalchemy.func.json_agg(
                sqlalchemy.func.json_build_object(
                    "report_type_name",
                    ReportType.report_type_name,
                    "descriptions",
                    report_desc_agg_alias.c.agg_desc,
                )
            ).label("agg_report"),
        )
        .join(
            ReportType,
            report_desc_agg_alias.c.report_type_id == ReportType.report_type_id,
        )
        .group_by(report_desc_agg_alias.c.whom_user_id)
        .subquery()
    )

    report_agg_alias = sqlalchemy.alias(report_agg_subquery)

    report_lst = (
        db.session.query(User, report_agg_alias.c.agg_report)
        .join(report_agg_alias, User.user_id == report_agg_alias.c.whom_user_id)
        .all()
    )

    if not report_lst:
        return jsonify({"msg": "Brak nowych zgłoszeń"}), 200

    return jsonify(
        [
            {"user": get_user_dto.dump(user), "reports": agg_report_info}
            for user, agg_report_info in report_lst
        ]
    )
