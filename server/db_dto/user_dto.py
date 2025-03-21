from app import ma
from db_models.database_tables import User


class UserDTO(ma.SQLAlchemyAutoSchema):
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


user_dto = UserDTO()
