from flask import request, jsonify, Blueprint
from app import db
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from db_models.database_tables import (
    User,
    Post,
    PetCare,
    Pet,
    UserPhoto,
    PetPhoto,
    PetCareApplication,
    UserRating,
)
from db_dto.post_dto import (
    create_post_dto,
    create_petcare_dto,
    get_user_dto,
    get_pet_dto,
    get_pets_dto,
    get_users_dto,
)
import sqlalchemy
from utils.file_storage import generate_presigned_url
from datetime import datetime

post_bprt = Blueprint("post", __name__)


@post_bprt.route("/createPost", methods=["POST"])
@jwt_required()
def create_post():
    user_id = int(get_jwt_identity())

    post_dto = create_post_dto.load(request.json)
    post_dto.user_id = user_id

    city, postal_code = (
        db.session.query(User.city, User.postal_code)
        .filter(User.user_id == user_id)
        .first()
    )

    if not (city and postal_code):
        return (
            jsonify(
                {
                    "msg": "Dodaj miasto i kod pocztowy do swojego profilu! Bez tego nie utworzysz postu!"
                }
            ),
            400,
        )

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
        return jsonify({"msg": "Post został utworzony! Trzymamy kciuki :)"}), 200
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
            Post,
            User,
            sqlalchemy.func.count(PetCare.pet_id).label("pet_count"),
            sqlalchemy.func.array_agg(PetPhoto.photo_name).label("photo_lst"),
        )
        .join(User, Post.user_id == User.user_id, isouter=True)
        .join(PetCare, Post.post_id == PetCare.post_id, isouter=True)
        .outerjoin(PetPhoto, PetCare.pet_id == PetPhoto.pet_id)
        .filter(Post.user_id != int(get_jwt_identity()))
        .filter(Post.is_active == True)
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
                generate_presigned_url("pet_photo", photo)
                for photo in photos_lst
                if photo
            ],
        }
        for post_dashboard, user, pet_cnt, photos_lst in post_lst
    ]

    return jsonify(resp_lst), 200


@post_bprt.route("/getPost/<int:post_id>", methods=["GET"])
@jwt_required()
def get_post(post_id):
    subquery_rating = (
        db.session.query(
            UserRating.user_id,
            sqlalchemy.func.avg(UserRating.star_number).label("rating_overall"),
        )
        .join(Post, Post.user_id == UserRating.user_id)
        .filter(Post.post_id == post_id)
        .group_by(UserRating.user_id)
        .subquery()
    )
    alias_subquery_rating = sqlalchemy.alias(subquery_rating)

    subquery_pet = (
        db.session.query(
            PetCare.post_id,
            sqlalchemy.func.json_agg(
                sqlalchemy.func.json_build_object(
                    "pet_id",
                    Pet.pet_id,
                    "pet_name",
                    Pet.pet_name,
                    "type",
                    Pet.type,
                    "race",
                    Pet.race,
                    "size",
                    Pet.size,
                    "birth_date",
                    Pet.birth_date,
                    "description",
                    Pet.description,
                    "photo",
                    PetPhoto.photo_name,
                )
            ).label("pet_lst"),
        )
        .join(PetCare, PetCare.pet_id == Pet.pet_id)
        .outerjoin(PetPhoto, PetPhoto.pet_id == Pet.pet_id)
        .filter(PetCare.post_id == post_id)
        .group_by(PetCare.post_id)
        .subquery()
    )
    alias_subquery_pet = sqlalchemy.alias(subquery_pet)

    post, user, pet_lst, user_photo, user_rating = (
        db.session.query(
            Post,
            User,
            alias_subquery_pet.c.pet_lst,
            UserPhoto.photo_name.label("user_photo"),
            alias_subquery_rating.c.rating_overall,
        )
        .join(User, Post.user_id == User.user_id)
        .join(alias_subquery_pet, alias_subquery_pet.c.post_id == Post.post_id)
        .outerjoin(UserPhoto, UserPhoto.user_id == User.user_id)
        .outerjoin(
            alias_subquery_rating, alias_subquery_rating.c.user_id == Post.user_id
        )
        .filter(Post.post_id == post_id)
        .first()
    )

    for pet in pet_lst:
        pet["photo"] = (
            generate_presigned_url("pet_photo", pet["photo"]) if pet["photo"] else ""
        )

    # in future set user rating!!

    user_dto = get_user_dto.dump(user)
    user_dto["photo"] = (
        generate_presigned_url("user_photo", user_photo) if user_photo else ""
    )
    user_dto["rating"] = user_rating or 0

    post_application = (
        db.session.query(PetCareApplication)
        .filter(PetCareApplication.post_id == post_id)
        .filter(PetCareApplication.user_id == int(get_jwt_identity()))
        .first()
    )

    db_rating = None
    if post.user_id == int(get_jwt_identity()):
        db_rating = (
            db.session.query(UserRating)
            .join(
                PetCareApplication,
                PetCareApplication.petcareapplication_id
                == UserRating.petcareapplication_id,
            )
            .filter(
                sqlalchemy.and_(
                    PetCareApplication.post_id == post_id,
                    PetCareApplication.accepted == True,
                    UserRating.user_id != int(get_jwt_identity()),
                )
            )
            .first()
        )
    elif getattr(post_application, "accepted", False):
        db_rating = (
            db.session.query(UserRating)
            .filter(
                sqlalchemy.and_(
                    UserRating.user_id != int(get_jwt_identity()),
                    UserRating.petcareapplication_id
                    == post_application.petcareapplication_id,
                )
            )
            .first()
        )

    return (
        jsonify(
            {
                "user": user_dto,
                "post": create_post_dto.dump(post),
                "pets": pet_lst,
                "can_rate": (
                    True
                    if db_rating is None
                    and post.end_date <= datetime.today().date()
                    and post.end_time < datetime.now().time()
                    and getattr(post_application, "accepted", False)
                    else False
                ),
                "status": (
                    "own"
                    if post.user_id == int(get_jwt_identity())
                    else (
                        ""
                        if not post_application
                        else (
                            "accepted"
                            if post_application.accepted
                            else (
                                "applied"
                                if not post_application.cancelled
                                and not post_application.declined
                                else ("declined" if post_application.declined else "")
                            )
                        )
                    )
                ),
            }
        ),
        200,
    )


@post_bprt.route("/getPost/<int:post_id>/delete", methods=["PUT"])
@jwt_required()
def delete_post(post_id):
    post = (
        db.session.query(Post)
        .filter(Post.post_id == post_id)
        .filter(Post.user_id == int(get_jwt_identity()))
        .first()
    )

    if not post:
        return (
            jsonify(
                {"msg": "Nie jesteś właścicielem postu, nie możesz wprowadzić zmian!"}
            ),
            404,
        )

    if not post.is_active:
        return jsonify({"msg": "Post jest nieaktywny!"}), 404

    try:
        post.is_active = False
        db.session.commit()
        return jsonify({"msg": "Post usunięty prawidłowo!"}), 200
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return jsonify({"msg": "Nie można w tej chwili usunąć postu."}), 406


@post_bprt.route("/getMyPosts", methods=["GET"])
@jwt_required()
def get_my_posts():
    subquery = (
        sqlalchemy.select(
            PetCareApplication.post_id,
            sqlalchemy.func.sum(
                sqlalchemy.case(
                    (PetCareApplication.petcareapplication_id.is_(None), 0),
                    (PetCareApplication.declined == True, 0),
                    (PetCareApplication.cancelled == True, 0),
                    (PetCareApplication.accepted == True, 0),
                    else_=1,
                )
            ).label("app_cnt"),
        )
        .group_by(PetCareApplication.post_id)
        .subquery()
    )
    subq_alias = sqlalchemy.alias(subquery)

    post_details = (
        db.session.query(
            Post,
            sqlalchemy.func.array_agg(Pet.pet_name).label("pet_list"),
            sqlalchemy.func.bool_or(PetCareApplication.accepted),
            subq_alias.c.app_cnt,
        )
        .join(PetCare, Post.post_id == PetCare.post_id)
        .join(Pet, PetCare.pet_id == Pet.pet_id)
        .outerjoin(PetCareApplication, PetCareApplication.post_id == Post.post_id)
        .outerjoin(subq_alias, Post.post_id == subq_alias.c.post_id)
        .filter(Post.user_id == int(get_jwt_identity()))
        .group_by(Post.post_id, PetCare.post_id, subq_alias.c.app_cnt)
        .all()
    )

    post_lst = []

    for post, pet_lst, accepted_pet_care, pending_applications in post_details:
        post_dict = create_post_dto.dump(post)
        post_dict["pet_lst"] = pet_lst
        post_dict["status"] = (
            "accepted"
            if accepted_pet_care
            else ("active" if post.is_active else "cancelled")
        )
        post_dict["pending_applications"] = (
            pending_applications if post_dict["status"] == "active" else 0
        )
        post_lst.append(post_dict)

    return (
        jsonify({"post_lst": post_lst}),
        200,
    )


@post_bprt.route("/editPost/<int:post_id>", methods=["PUT", "GET"])
@jwt_required()
def edit_post(post_id):
    post_details = (
        db.session.query(Post, Pet)
        .join(PetCare, Post.post_id == PetCare.post_id)
        .join(Pet, PetCare.pet_id == Pet.pet_id)
        .filter(Post.post_id == post_id, Post.user_id == int(get_jwt_identity()))
        .all()
    )

    if not post_details:
        return (
            jsonify({"error": "Post nie istnieje lub nie jesteś jego właścielem!"}),
            404,
        )

    post_set = set()
    pet_set = set()
    for post, pet in post_details:
        post_set.add(post)
        pet_set.add(pet)

    if len(post_set) > 1:
        return jsonify({"error": "Więcej niż jeden post o podanym ID"}), 403

    post = post_set.pop()

    if request.method == "GET":
        return (
            jsonify(
                {
                    "post": create_post_dto.dump(post),
                    "pets": get_pets_dto.dump(list(pet_set)),
                }
            ),
            200,
        )


@post_bprt.route("/applyToPost/<int:post_id>", methods=["POST"])
@jwt_required()
def apply_to_post(post_id):
    post = db.session.query(Post).filter(Post.post_id == post_id).first()

    if not post:
        (
            jsonify({"msg": "Post nie istnieje!"}),
            404,
        )

    if not post.is_active:
        return jsonify({"msg": "Post jest nieaktywny!"}), 404

    pet_care_application = (
        db.session.query(PetCareApplication)
        .filter(
            sqlalchemy.and_(
                PetCareApplication.post_id == post_id,
                PetCareApplication.user_id == int(get_jwt_identity()),
            )
        )
        .first()
    )

    try:
        if pet_care_application:
            if pet_care_application.cancelled:
                pet_care_application.cancelled = False
        else:
            pet_care_application = PetCareApplication(
                user_id=int(get_jwt_identity()), post_id=post_id
            )
            db.session.add(pet_care_application)

        db.session.commit()

        return jsonify({"msg": "Aplikacja złożona pomyślnie!"})
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return jsonify({"msg": "Nie można w tej chwili przyjąc aplikacji."}), 406


@post_bprt.route("/getApplicationsCount", methods=["GET"])
@jwt_required()
def get_applications_count():
    active_application_cnt = (
        db.session.query(sqlalchemy.func.count("*"))
        .select_from(PetCareApplication)
        .join(Post, Post.post_id == PetCareApplication.post_id)
        .filter(
            sqlalchemy.and_(
                Post.user_id == int(get_jwt_identity()), Post.is_active == True
            )
        )
        .filter(
            sqlalchemy.and_(
                PetCareApplication.declined == False,
                PetCareApplication.cancelled == False,
            )
        )
        .scalar()
    )

    return jsonify({"active_applications_cnt": active_application_cnt})


@post_bprt.route("/getPost/<int:post_id>/applications", methods=["GET"])
@jwt_required()
def get_post_applications(post_id):
    post = (
        db.session.query(Post)
        .filter(
            sqlalchemy.and_(
                Post.post_id == post_id, Post.user_id == int(get_jwt_identity())
            )
        )
        .first()
    )

    if not post:
        return (
            jsonify(
                {"msg": "Nie jesteś właścicielem postu! Nie możesz zobaczyć aplikacji!"}
            ),
            404,
        )

    users_application = (
        db.session.query(User, PetCareApplication)
        .join(PetCareApplication, PetCareApplication.user_id == User.user_id)
        .filter(
            sqlalchemy.and_(
                PetCareApplication.post_id == post_id,
                PetCareApplication.cancelled == False,
            )
        )
        .all()
    )

    user_lst = []
    for user, pet_care_application in users_application:
        user_dto = get_user_dto.dump(user)
        user_dto["status"] = (
            "Accepted"
            if pet_care_application.accepted
            else ("Declined" if pet_care_application.declined else "Pending")
        )
        user_lst.append(user_dto)

    return jsonify({"users": user_lst}), 200


@post_bprt.route(
    "/getPost/<int:post_id>/declineApplication/<int:user_id>", methods=["PUT"]
)
@jwt_required()
def decline_application(post_id, user_id):
    post = (
        db.session.query(Post)
        .filter(
            sqlalchemy.and_(
                Post.post_id == post_id, Post.user_id == int(get_jwt_identity())
            )
        )
        .first()
    )

    if not post:
        return (
            jsonify(
                {
                    "msg": "Nie jesteś właścicielem postu! Nie możesz odrzucić aplikacji na post!"
                }
            ),
            404,
        )

    if not post.is_active:
        return jsonify({"msg": "Post jest nieaktywny!"}), 404

    pet_care_application = (
        db.session.query(PetCareApplication)
        .filter(
            sqlalchemy.and_(
                PetCareApplication.user_id == user_id,
                PetCareApplication.post_id == post_id,
            )
        )
        .filter(PetCareApplication.cancelled == False)
        .first()
    )

    if not pet_care_application:
        return jsonify({"msg": "Chętny odwołał swoją kandydaturę!"}), 404

    try:
        pet_care_application.declined = True
        db.session.commit()
        return jsonify({"msg": "Kandydatura odrzucona prawidłowo :("}), 200
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return jsonify({"msg": "Nie można w tej chwili odrzucić aplikacji."}), 406


@post_bprt.route(
    "/getPost/<int:post_id>/acceptApplication/<int:user_id>", methods=["PUT"]
)
@jwt_required()
def accept_application(post_id, user_id):
    post = (
        db.session.query(Post)
        .filter(
            sqlalchemy.and_(
                Post.post_id == post_id, Post.user_id == int(get_jwt_identity())
            )
        )
        .first()
    )

    if not post:
        return (
            jsonify(
                {
                    "msg": "Nie jesteś właścicielem postu! Nie możesz akceptować aplikacji na post!"
                }
            ),
            404,
        )

    if not post.is_active:
        return jsonify({"msg": "Post jest nieaktywny!"}), 404

    pet_care_application, post, user_email = (
        db.session.query(PetCareApplication, Post, User.email)
        .join(User, User.user_id == PetCareApplication.user_id)
        .filter(
            sqlalchemy.and_(
                PetCareApplication.user_id == user_id,
                PetCareApplication.post_id == post_id,
            )
        )
        .filter(PetCareApplication.cancelled == False)
        .first()
    )

    if not pet_care_application:
        return jsonify({"msg": "Chętny odwołał swoją kandydaturę!"}), 404

    try:
        pet_care_application.accepted = True
        post.is_active = False
        db.session.commit()

        # tutaj dodac wyslanie maila do uzytkownika z powiadomieniem o akceptacji jego kandydatury
        # lepiej nie na dummy data, bo ludzie zaczną dostawać powiadomienia xddd

        return jsonify({"msg": "Kandydatura zaakceptowana! :)"}), 200
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return jsonify({"msg": "Nie można w tej chwili odrzucić aplikacji."}), 406


@post_bprt.route("/getMyApplications", methods=["GET"])
@jwt_required()
def get_my_application():
    post_details = (
        db.session.query(
            Post,
            PetCareApplication,
            sqlalchemy.func.array_agg(Pet.pet_name).label("pet_list"),
        )
        .join(PetCare, Post.post_id == PetCare.post_id)
        .join(Pet, PetCare.pet_id == Pet.pet_id)
        .join(PetCareApplication, Post.post_id == PetCareApplication.post_id)
        .filter(PetCareApplication.user_id == int(get_jwt_identity()))
        .group_by(Post.post_id, PetCareApplication.petcareapplication_id)
        .all()
    )

    post_lst = []

    for post, pet_care_application, pet_lst in post_details:
        post_dict = create_post_dto.dump(post)
        post_dict["pet_lst"] = pet_lst
        post_dict["status"] = (
            "declined"
            if pet_care_application.declined
            else (
                "accepted"
                if pet_care_application.accepted
                else (
                    "waiting"
                    if post.is_active and not pet_care_application.cancelled
                    else "cancelled"
                )
            )
        )
        post_lst.append(post_dict)

    return (
        jsonify({"post_lst": post_lst}),
        200,
    )


@post_bprt.route("/getMyApplications/<post_id>/cancel", methods=["PUT"])
@jwt_required()
def cancel_my_application(post_id):
    post = db.session.query(Post).filter(Post.post_id == post_id).first()

    if not post:
        (
            jsonify({"msg": "Post nie istnieje!"}),
            404,
        )

    if not post.is_active:
        return jsonify({"msg": "Post jest nieaktywny!"}), 404

    pet_care_application = (
        db.session.query(PetCareApplication)
        .filter(
            sqlalchemy.and_(
                PetCareApplication.user_id == int(get_jwt_identity()),
                PetCareApplication.post_id == post_id,
            )
        )
        .first()
    )

    if not pet_care_application:
        return jsonify({"msg": "Nie aplikowałeś na ten post!"}), 406

    try:
        pet_care_application.cancelled = True
        db.session.commit()
        return jsonify({"msg": "Aplikacja wycofana z sukcesem!"}), 200
    except sqlalchemy.exc.IntegrityError:
        db.session.rollback()
        return jsonify({"msg": "Nie można w tej chwili wycofać aplikacji."}), 406
