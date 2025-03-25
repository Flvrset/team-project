import sqlalchemy
import marshmallow
import string
import random
import json

from flask import request, jsonify, Blueprint
from db_models.database_tables import Pet, User, PetPhoto
from db_dto.pet_dto import create_pet_dto, get_pet_dto, get_pets_dto
from app import db
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from utils.file_storage import upload_object, generate_presigned_url, delete_object

pet = Blueprint("pet", __name__)


@pet.route("/addPet", methods=["POST"])
@jwt_required()
def add_pet():
    if 'json' not in request.form:
        return jsonify({"msg": "Wymagane dane nie zostały podane!"}), 400

    try:
        new_pet = create_pet_dto.load(json.loads(request.form['json']))
        new_pet.user_id = get_jwt_identity()
        db.session.add(new_pet)

        file = request.files.get('photo', None)

        if file:
            characters = string.ascii_letters + string.digits
            while True:
                filename = ''.join(random.choices(characters, k=20))
                resp = PetPhoto.query.filter(PetPhoto.photo_name.like(f'%filename%')).first()
                if not resp:
                    break

            photo_db = PetPhoto(photo_name=filename, pet_id=new_pet.pet_id)
            db.session.add(photo_db)
            upload_object(file, "pet_photo", filename)

        db.session.commit()

        return jsonify({"msg": "Profil zwierzaka dodany!"}), 201
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return jsonify({"msg": "Nie można w tej chwili dodać rekordu."}), 406
    except marshmallow.exceptions.ValidationError as ve:
        db.session.rollback()
        return jsonify({"error": ve.messages}), 400


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

    return jsonify({get_pet_dto.dump(pet_info)})


@pet.route("/getMyPets", methods=["GET"])
@jwt_required()
def get_pets():
    user_id = get_jwt_identity()
    pet_list = (
        db.session.query(Pet, PetPhoto.photo_name.label("photo")).outerjoin(PetPhoto).filter(Pet.user_id == user_id).filter(Pet.is_deleted == False).all()
    )
    resp = [({**get_pet_dto.dump(pet_obj), "photo": generate_presigned_url('pet_photo', photo)} if photo else get_pet_dto.dump(pet_obj)) for pet_obj, photo in pet_list]
    return jsonify(resp), 200


@pet.route("/deletePet/<int:pet_id>", methods=["POST"])
def delete_pet(pet_id):
    pet_to_update = Pet.query.filter(Pet.pet_id == pet_id).first()

    if not pet_to_update:
        return jsonify({"msg": "Zwierzak nie został znaleziony!"}), 404

    try:
        pet_to_update.is_deleted = True

        pet_photo = PetPhoto.query.filter(PetPhoto.pet_id == pet_id)
        if pet_photo:
            delete_object('pet_photo', pet_photo.photo_name)
        db.session.delete(pet_photo)
        db.session.commit()
        return jsonify({"msg": "Zwierzak usunięty, przykro nam :("}), 200
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return jsonify({"msg": "Nie można w tej chwili usunać zwierzaka."}), 406
