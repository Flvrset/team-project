from marshmallow import fields

from app import ma
from db_models.database_tables import User


class CreateUserDTO(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = (
            "city",
            "postal_code",
            "street",
            "house_number",
            "apartment_number",
            "phone_number",
            "join_date",
            "is_banned",
            "description",
        )

    user_id = ma.auto_field(dump_only=True, load_only=True)
    name = ma.auto_field()
    surname = ma.auto_field()
    login = ma.auto_field(required=True)
    password_hash = ma.auto_field(load_only=True)
    email = ma.auto_field(required=True)


class EditUserDTO(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = (
            "name",
            "surname",
            "login",
            "password_hash",
            "email",
            "join_date",
            "is_banned",
        )

    user_id = ma.auto_field(dump_only=True)
    city = ma.auto_field()
    postal_code = ma.auto_field()
    street = ma.auto_field()
    house_number = ma.auto_field()
    apartment_number = ma.auto_field()
    phone_number = ma.auto_field()
    description = ma.auto_field(allow_none=True)

    # custom field for photo of user
    photo_deleted = fields.Boolean(allow_none=True, load_only=True)


class LoginUserDTO(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True

    user_id = ma.auto_field(dump_only=True)
    name = ma.auto_field()
    surname = ma.auto_field()
    login = ma.auto_field(required=True)
    password_hash = ma.auto_field(load_only=True)
    join_date = ma.auto_field(dump_only=True)
    city = ma.auto_field()
    postal_code = ma.auto_field()
    street = ma.auto_field()
    house_number = ma.auto_field()
    apartment_number = ma.auto_field()
    phone_number = ma.auto_field()
    email = ma.auto_field(required=True)
    is_banned = ma.auto_field(dump_only=True)


create_user_dto = CreateUserDTO()
edit_user_dto = EditUserDTO()
