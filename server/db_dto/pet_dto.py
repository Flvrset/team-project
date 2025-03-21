from app import ma
from db_models.database_tables import Pet


class CreatePetDTO(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Pet
        load_instance = True

    pet_id = ma.auto_field(dump_only=True, load_only=True)
    pet_name = ma.auto_field(required=True)
    type = ma.auto_field(required=True)
    race = ma.auto_field(required=True)
    size = ma.auto_field(required=True)
    age = ma.auto_field(required=True)


create_pet_dto = CreatePetDTO()