from flask import request, jsonify, Blueprint
from app import db
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from db_models.database_tables import User, Post, PetCare
from db_dto.post_dto import create_post_dto, create_petcare_dto
import sqlalchemy

post = Blueprint("post", __name__)


@post.route("/createPost", methods=["POST"])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()

    post_dto = create_post_dto.load(request.json)
    post_dto.user_id = user_id

    try:
        # post_db = Post(**create_post_dto.dump(post_dto))
        db.session.add(post_dto)
        db.session.flush()
        print(post_dto.post_id)


        for pet_care in request.json.get("pet_list", None):
            # pet_care = PetCare(**create_petcare_dto.load(
            #     {"pet_id": pet_care["pet_id"], "post_id": post_dto.post_id}
            # ))
            db.session.add(
                create_petcare_dto.load(
                    {"pet_id": pet_care["pet_id"], "post_id": post_dto.post_id}
                )
            )
        db.session.commit()
        return jsonify({"msg": "Post został utworzony! Trzyamy kciuki :)"}), 200
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return jsonify({"msg": "Nie można w tej chwili dodać ogłoszenia."}), 406


@post.route("/getDashboardPost", methods=["GET"])
@jwt_required()
def get_dashboard_post():
    # dodac logike do wybierania 10 (albo wiecej) dla uzytkownika
    post_lst = (
        db.session.query(
            Post, User, sqlalchemy.func.count(PetCare.pet_id).label("pet_count")
        )
        .join(User, Post.user_id == User.user_id, isouter=True)
        .join(PetCare, Post.post_id == PetCare.post_id, isouter=True)
        .group_by(Post.post_id, User.user_id)
        .limit(10)
        .all()
    )

    resp_lst = [
        {
            "city": user.city,
            "postal_code": user.postal_code,
            "name": user.name,
            "surname": user.surname,
            "start_date": post_dashboard.start_date.strftime("%d-%m-%Y"),
            "end_date": post_dashboard.end_date.strftime("%d-%m-%Y"),
            "start_time": str(post_dashboard.start_time),
            "end_time": str(post_dashboard.end_time),
            "cost": post_dashboard.cost,
            "pet_count": pet_cnt
        }
        for post_dashboard, user, pet_cnt in post_lst
    ]

    return jsonify(resp_lst), 200
