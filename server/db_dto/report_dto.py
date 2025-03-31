from app import ma
from db_models.database_tables import Report, ReportType


class CreateReportDTO(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Report
        load_instance = True
        exclude = ("report_date", "report_time")

    who_user_id = ma.auto_field(dump_only=True)
    whom_user_id = ma.auto_field(dump_only=True)
    report_type_id = ma.auto_field()
    description = ma.auto_field(allow_none=True)


report_dto = CreateReportDTO()
