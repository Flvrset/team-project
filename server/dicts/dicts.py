from flask import request, jsonify, session, make_response
from ..app import db
from server.db_models.database_tables import DPostalCode
from server.dicts import dicts


@dicts.route("/city/<string:postal_code>", methods=["GET"])
def city(postal_code):
    places = DPostalCode.query.filter(DPostalCode.postal_code.like(f'%{postal_code}%')).all()
    response = [{"place": place.place, "postal_code": place.postal_code} for place in places]
    return jsonify(response)