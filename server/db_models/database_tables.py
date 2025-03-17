from datetime import date, time
from app import db


class User(db.Model):
    __tablename__ = "User"
    __table_args__ = {"schema": "petbuddies_schema"}

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    name = db.Column(db.String(255))
    surname = db.Column(db.String(255))
    login = db.Column(db.String(255), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)  # SHA-256 hashed password
    join_date = db.Column(db.Date, nullable=False, default=date.today)
    country = db.Column(db.String(255))
    city = db.Column(db.String(255))
    postal_code = db.Column(db.String(255))
    street = db.Column(db.String(255))
    house_number = db.Column(db.String(255))
    apartment_number = db.Column(db.Integer)
    phone_number = db.Column(db.String(20))
    email = db.Column(db.String(255), nullable=False, unique=True)
    is_banned = db.Column(db.Boolean, nullable=False, default=False)


class Pet(db.Model):
    __tablename__ = "Pet"
    __table_args__ = {"schema": "petbuddies_schema"}

    pet_id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    pet_name = db.Column(db.String(255), nullable=False)
    creation_date = db.Column(db.Date, nullable=False, default=date.today)
    type = db.Column(db.String(255), nullable=False)
    race = db.Column(db.String(255), nullable=False)
    size = db.Column(db.String(255), nullable=True)
    age = db.Column(db.Integer, nullable=True)


class Ownership(db.Model):
    __tablename__ = "Ownership"
    __table_args__ = {"schema": "petbuddies_schema"}

    ownership_id = db.Column(
        db.Integer, primary_key=True, autoincrement=True, unique=True
    )
    user_id = db.Column(
        db.Integer, db.ForeignKey("petbuddies_schema.User.user_id", ondelete="CASCADE")
    )
    pet_id = db.Column(
        db.Integer, db.ForeignKey("petbuddies_schema.Pet.pet_id", ondelete="CASCADE")
    )


class Post(db.Model):
    __tablename__ = "Post"
    __table_args__ = {"schema": "petbuddies_schema"}

    post_id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("petbuddies_schema.User.user_id", ondelete="CASCADE")
    )
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    description = db.Column(db.Text, nullable=True)
    cost = db.Column(db.Numeric, nullable=True)


class PetCare(db.Model):
    __tablename__ = "PetCare"
    __table_args__ = {"schema": "petbuddies_schema"}

    petcare_id = db.Column(
        db.Integer, primary_key=True, autoincrement=True, unique=True
    )
    post_id = db.Column(
        db.Integer, db.ForeignKey("petbuddies_schema.Post.post_id", ondelete="CASCADE")
    )
    pet_id = db.Column(
        db.Integer, db.ForeignKey("petbuddies_schema.Pet.pet_id", ondelete="CASCADE")
    )


class MedDocs(db.Model):
    __tablename__ = "MedDocs"
    __table_args__ = {"schema": "petbuddies_schema"}

    meddoc_id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    pet_id = db.Column(
        db.Integer, db.ForeignKey("petbuddies_schema.Pet.pet_id", ondelete="CASCADE")
    )
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    validated_date = db.Column(db.Date, nullable=True)
    doc_type_id = db.Column(
        db.Integer,
        db.ForeignKey("petbuddies_schema.MedDocDict.doc_type_id", ondelete="CASCADE"),
    )
    doc = db.Column(db.LargeBinary, nullable=False)


class CareAgreement(db.Model):
    __tablename__ = "CareAgreement"
    __table_args__ = {"schema": "petbuddies_schema"}

    care_agreement_id = db.Column(
        db.Integer, primary_key=True, autoincrement=True, unique=True
    )
    post_id = db.Column(
        db.Integer, db.ForeignKey("petbuddies_schema.Post.post_id", ondelete="CASCADE")
    )
    volunteer_id = db.Column(
        db.Integer, db.ForeignKey("petbuddies_schema.User.user_id", ondelete="CASCADE")
    )
    agreement_date = db.Column(db.Date, nullable=False)


class OwnerRating(db.Model):
    __tablename__ = "OwnerRating"
    __table_args__ = {"schema": "petbuddies_schema"}

    owner_rating_id = db.Column(
        db.Integer, primary_key=True, autoincrement=True, unique=True
    )
    care_agreement_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "petbuddies_schema.CareAgreement.care_agreement_id", ondelete="CASCADE"
        ),
    )
    description = db.Column(db.Text, nullable=True)
    star_number = db.Column(db.Integer, nullable=False)


class VolunteerRating(db.Model):
    __tablename__ = "VolunteerRating"
    __table_args__ = {"schema": "petbuddies_schema"}

    volunteer_rating_id = db.Column(
        db.Integer, primary_key=True, autoincrement=True, unique=True
    )
    care_agreement_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "petbuddies_schema.CareAgreement.care_agreement_id", ondelete="CASCADE"
        ),
    )
    description = db.Column(db.Text, nullable=True)
    star_number = db.Column(db.Integer, nullable=False)


class Report(db.Model):
    __tablename__ = "Report"
    __table_args__ = {"schema": "petbuddies_schema"}

    report_id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    who_user_id = db.Column(
        db.Integer, db.ForeignKey("petbuddies_schema.User.user_id", ondelete="CASCADE")
    )
    whom_user_id = db.Column(
        db.Integer, db.ForeignKey("petbuddies_schema.User.user_id", ondelete="CASCADE")
    )
    post_id = db.Column(
        db.Integer, db.ForeignKey("petbuddies_schema.Post.post_id", ondelete="CASCADE")
    )
    report_type_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "petbuddies_schema.ReportType.report_type_id", ondelete="CASCADE"
        ),
    )
    description = db.Column(db.Text, nullable=False)


class ReportType(db.Model):
    __tablename__ = "ReportType"
    __table_args__ = {"schema": "petbuddies_schema"}

    report_type_id = db.Column(
        db.Integer, primary_key=True, autoincrement=True, unique=True
    )
    report_type_name = db.Column(db.String(255), nullable=False)


class DPostalCode(db.Model):
    __tablename__ = "DPostalCode"
    __table_args__ = {"schema": "petbuddies_schema"}

    postal_code_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    postal_code = db.Column(db.String(6), nullable=False)
    place = db.Column(db.String(255), nullable=False)
