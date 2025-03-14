from flask import Blueprint

routes = Blueprint("routes", __name__)

from server.routes import routes
