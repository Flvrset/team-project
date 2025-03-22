from flask import request, jsonify, Blueprint
from db_models.database_tables import Pet, User
from db_dto.pet_dto import create_pet_dto, get_pet_dto, get_pets_dto
from app import db
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
import sqlalchemy
import marshmallow
from sqlalchemy import func

pet = Blueprint("pet", __name__)


@pet.route("/addPet", methods=["POST"])
@jwt_required()
def add_pet():
    try:
        new_pet = create_pet_dto.load(request.json)
        new_pet.user_id = get_jwt_identity()

        db.session.add(new_pet)
        db.session.commit()

        return jsonify({"msg": "Profil zwierzaka dodany!"}), 201
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return jsonify({"msg": "Nie można w tej chwili dodać rekordu."}), 406
    except marshmallow.exceptions.ValidationError as ve:
        return jsonify({"error": str(ve), "msg": ve.messages}), 400


@pet.route("/getPetData/<int:pet_id>", methods=["GET"])
def get_pet_data(pet_id):
    pet_info = Pet.query.filter(Pet.pet_id == pet_id).first()

    if not pet_info:
        return jsonify({"msg": "Zwierzak nie został znaleziony!"}), 404

    if pet_info.is_deleted:
        return jsonify({"msg": "Podany zwierzak został usunięty!"}), 404

    if len(pet_info) > 1:
        return (
            jsonify(
                {
                    "msg": "Więcej niż jeden zwierzak o podanym id! Proszę wysłać zgłoszenie do administracji"
                }
            ),
            403,
        )

    return jsonify(
        {
            get_pet_dto.dump(pet_info)
        }
    )


@pet.route("/getMyPets", methods=["GET"])
@jwt_required()
def get_pets():
    user_id = get_jwt_identity()
    
    pet_list = (
        Pet.query
        .filter(Pet.user_id == user_id)
        .filter(Pet.is_deleted == False)
        .all()
    )

    if not pet_list:
        return jsonify({"msg": "Użytkownik nie posiada zwierząt!"}), 404

    return jsonify(
        get_pets_dto.dump(pet_list)
    ), 200


@pet.route("/deletePet/<int:pet_id>", methods=["POST"])
def delete_pet(pet_id):
    pet_to_update = Pet.query.filter(Pet.pet_id == pet_id).first()

    if not pet_to_update:
        return jsonify({"msg": "Zwierzak nie został znaleziony!"}), 404

    try:
        pet_to_update.is_deleted = True
        db.session.commit()
        return jsonify({"msg": "Zwierzak usunięty, przykro nam :("}), 200
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return jsonify({"msg": "Nie można w tej chwili usunać zwierzaka."}), 406