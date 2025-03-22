from flask import jsonify, Blueprint
from db_models.database_tables import DPostalCode

dicts = Blueprint("dicts", __name__)


@dicts.route("/city/<string:place>", methods=["GET"])
def city(place):
    places = DPostalCode.query.filter(
        DPostalCode.postal_code.like(f"%{place}%")
        if place[0].isnumeric()
        else DPostalCode.place.like(f"%{place.title()}%")
    ).all()
    response = [
        {"place": place.place, "postal_code": place.postal_code} for place in places
    ]
    return jsonify(response)
