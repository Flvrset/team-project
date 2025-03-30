from app import ma
from db_models.database_tables import UserRating


class UserRatingDTO(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = UserRating
        load_instance = True

    user_rating_id = ma.auto_field(dump_only=True)
    petcareapplication_id = ma.auto_field()
    user_id = ma.auto_field()
    description = ma.auto_field(required=True)
    star_number = ma.auto_field(required=True)


user_rating_dto = UserRatingDTO()
user_ratings_dto = UserRatingDTO(many=True)
