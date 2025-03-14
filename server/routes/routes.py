from flask import request, session, jsonify
from server import db, bcrypt, limiter
from server.db_models.database_tables import User
from server.routes import routes


@routes.route("/register", methods=["GET"])
def register_user_page():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        email = request.form["email"]

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        new_user = User(email=email, password=hashed_password, username=username)

        db.session.add(new_user)
        db.session.commit()

        session["kumply_user_id"] = new_user.user_id

        return jsonify({'success': True})


@routes.route("/login", methods=["POST"])
@limiter.limit("5 per 5 minutes")
def login_mail_page():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        if not email:
            return jsonify({"success": False})

        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({"success": False})

        if bcrypt.check_password_hash(user.password.encode("utf-8"), password.encode("utf-8")):
            session.permanent = True
            session["kumply_username"] = user.username
            session["kumply_user_id"] = user.user_id
            return jsonify({"success": True})

        return jsonify({"success": False})
