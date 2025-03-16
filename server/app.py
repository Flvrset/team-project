from flask import Flask, request

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

# from flask_mail import Mail
# from flask_babel import Babel

db = SQLAlchemy()
bcrypt = Bcrypt()
# mail = Mail()
limiter = Limiter(key_func=get_remote_address)
# babel = Babel()
jwt = JWTManager()

LANGUAGES = ["pl"]


def get_locale():
    return request.accept_languages.best_match(LANGUAGES)


def create_app(config_class="config.Config"):

    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    # mail.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)
    jwt.init_app(app)
    # babel.init_app(app, locale_selector=get_locale)

    from server.auth import auth
    from server.dicts import dicts

    app.register_blueprint(auth)
    app.register_blueprint(dicts, url_prefix="/dicts")

    return app
