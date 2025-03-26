from flask import request, jsonify, Blueprint
from app import db
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from db_models.database_tables import User, Post, PetCare, Pet, UserPhoto, PetPhoto
from db_dto.post_dto import create_post_dto, create_petcare_dto, get_user_dto, get_pet_dto
import sqlalchemy
from utils.file_storage import generate_presigned_url

post_bprt = Blueprint("post", __name__)


@post_bprt.route("/createPost", methods=["POST"])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()

    post_dto = create_post_dto.load(request.json)
    post_dto.user_id = user_id

    try:
        db.session.add(post_dto)
        db.session.flush()

        for pet_care in request.json.get("pet_list", None):
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


@post_bprt.route("/getDashboardPost", methods=["GET"])
@jwt_required()
def get_dashboard_post():
    city = request.args.get("city", None)
    postal_code = request.args.get("postal_code", None)
    kms = request.args.get("kms", 0)
    print(f"city: {city}, postal code: {postal_code}, km: {kms}")
    # dodac logike do wybierania 10 (albo wiecej) dla uzytkownika
    post_lst = (
        db.session.query(
            Post, User, sqlalchemy.func.count(PetCare.pet_id).label("pet_count"), sqlalchemy.func.array_agg(PetPhoto.photo_name).label("photo_lst")
        )
        .join(User, Post.user_id == User.user_id, isouter=True)
        .join(PetCare, Post.post_id == PetCare.post_id, isouter=True)
        .join(PetPhoto, PetCare.pet_id == PetPhoto.pet_id)
        .group_by(Post.post_id, User.user_id)
        .limit(10)
        .all()
    )

    resp_lst = [
        {
            "post_id": post_dashboard.post_id,
            "user_id": user.user_id,
            "city": user.city,
            "postal_code": user.postal_code,
            "name": user.name,
            "surname": user.surname,
            "start_date": post_dashboard.start_date.strftime("%d-%m-%Y"),
            "end_date": post_dashboard.end_date.strftime("%d-%m-%Y"),
            "start_time": str(post_dashboard.start_time),
            "end_time": str(post_dashboard.end_time),
            "cost": post_dashboard.cost,
            "pet_count": pet_cnt,
            "pet_photos": [
                generate_presigned_url(
                    "pet_photo", photo
                ) for photo in photos_lst
            ]
        }
        for post_dashboard, user, pet_cnt, photos_lst in post_lst
    ]

    return jsonify(resp_lst), 200


@post_bprt.route("/getPost/<int:post_id>", methods=["GET"])
def get_post(post_id):
    post_details = (
        db.session.query(Post, User, Pet, UserPhoto.photo_name.label("user_photo"), PetPhoto.photo_name.label("pet_photo"))
        .join(Post, Post.user_id == User.user_id)
        .join(PetCare, Post.post_id == PetCare.post_id)
        .join(Pet, PetCare.pet_id == Pet.pet_id)
        .outerjoin(UserPhoto, UserPhoto.user_id == User.user_id)
        .outerjoin(PetPhoto, PetPhoto.pet_id == Pet.pet_id)
        .filter(Post.post_id == post_id)
        .all()
    )

    post_set = set()
    user_set = set()
    user_photo_set = set()
    pet_lst = []
    for post, user, pet, user_photo, pet_photo in post_details:
        pet_dto = get_pet_dto.dump(pet)
        if pet_photo:
            pet_dto["photo"] = generate_presigned_url(
                "pet_photo", pet_photo
            )

        post_set.add(post)
        user_set.add(user)
        user_photo_set.add(user_photo)
        pet_lst.append(pet_dto)

    if len(post_set) > 1 or len(user_set) > 1 or len(user_photo_set) > 1:
        return jsonify({"error": "More than one user or post with provided id!"}), 400

    # in future set user rating!!

    user = get_user_dto.dump(user_set.pop())
    user["photo"] = generate_presigned_url(
        "user_photo", user_photo_set.pop()
    )

    return jsonify({
        "user": user,
        "post": create_post_dto.dump(post_set.pop()),
        "pets": pet_lst
    }), 200
