from marshmallow import fields
import marshmallow

from app import ma
from db_models.database_tables import Post, PetCare, User, Pet


class CreatePetCareDTO(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = PetCare
        load_instance = True

    petcare_id = ma.auto_field(dump_only=True, load_only=True)
    post_id = ma.auto_field(required=True)
    pet_id = ma.auto_field(required=True)


class CreatePostDTO(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Post
        load_instance = True

    post_id = ma.auto_field(dump_only=True)
    user_id = ma.auto_field()
    start_date = ma.auto_field(required=True)
    end_date = ma.auto_field(required=True)
    start_time = ma.auto_field(required=True)
    end_time = ma.auto_field(required=True)
    description = ma.auto_field()
    cost = ma.auto_field(required=True)

    # custom field for reading json
    pet_list = fields.List(fields.Dict, allow_none=True, load_only=True)


class PostPageUserDTO(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = (
            "street",
            "house_number",
            "apartment_number",
            "phone_number",
            "join_date",
            "is_banned",
            "login",
            "password_hash",
            "email",
        )

    user_id = ma.auto_field(dump_only=True, load_only=True)
    name = ma.auto_field(required=True)
    surname = ma.auto_field(required=True)
    city = ma.auto_field(required=True)
    postal_code = ma.auto_field(required=True)

    # custom rating field
    rating = fields.Float(default=4.5)


class PostPetDTO(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Pet
        load_instance = True
        exclude = (
            "is_deleted",
            "creation_date",
        )

    pet_id = ma.auto_field()
    pet_name = ma.auto_field(required=True)
    type = ma.auto_field(required=True)
    race = ma.auto_field(required=True)
    size = ma.auto_field(required=True)
    birth_date = ma.auto_field(required=True)
    user_id = ma.auto_field(load_only=True)

    # custom fields
    photo = fields.String(allow_none=True)


create_post_dto = CreatePostDTO()
create_petcare_dto = CreatePetCareDTO()
get_user_dto = PostPageUserDTO()
get_pet_dto = PostPetDTO()
