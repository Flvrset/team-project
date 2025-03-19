from flask import request, jsonify, Blueprint
from db_models.database_tables import Post, User, Pet, PetCare
from app import db
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
import sqlalchemy

post = Blueprint("post", __name__)


@post.route("/createPost", methods=["POST"])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()

    start_date = request.json.get("start_date", None)
    end_date = request.json.get("end_date", None)
    start_time = request.json.get("start_time", None)
    end_time = request.json.get("end_time", None)
    description = request.json.get("description", "")
    cost = request.json.get("cost", 0)
    pet_list = request.json.get("pet_list", None)

    if not (start_time and start_date and end_time and end_date and pet_list):
        return jsonify({"msg": "Nie podano wszystkich niezbędnych danych!"})

    post = Post(
        start_date=start_date,
        end_date=end_date,
        start_time=start_time,
        end_time=end_time,
        description=description,
        cost=cost
    )

    pet_care_lst = [PetCare(post_id=post.post_id, pet_id=p.pet_id) for p in pet_list]

    try:
        db.session.add(post)
        for pet_care in pet_care_lst:
            db.session.add(pet_care)

        return jsonify({"msg": "Post został utworzony! Trzyamy kciuki :)"})
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return jsonify({"msg": "Nie można w tej chwili dodać ogłoszenia."}), 406
