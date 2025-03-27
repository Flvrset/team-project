from app import ma
from db_models.database_tables import Pet


class CreatePetDTO(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Pet
        load_instance = True
        exclude = (
            "is_deleted",
            "creation_date",
        )

    pet_id = ma.auto_field(dump_only=True)
    pet_name = ma.auto_field(required=True)
    type = ma.auto_field(required=True)
    race = ma.auto_field(required=True)
    size = ma.auto_field(required=True)
    birth_date = ma.auto_field(required=True)
    user_id = ma.auto_field(load_only=True)
    description = ma.auto_field(allow_none=True)


create_pet_dto = CreatePetDTO()
get_pets_dto = CreatePetDTO(many=True)
get_pet_dto = CreatePetDTO()
