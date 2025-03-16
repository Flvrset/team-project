from flask import request, jsonify, session, make_response, Blueprint
from app import db
from server.db_models.database_tables import DPostalCode
# from server.dicts import dicts

dicts = Blueprint("dicts", __name__)


@dicts.route("/city/<string:postal_code>", methods=["GET"])
def city(postal_code):
    places = DPostalCode.query.filter(DPostalCode.postal_code.like(f'%{postal_code}%')).all()
    response = [{"place": place.place, "postal_code": place.postal_code} for place in places]
    return jsonify(response)

@dicts.route('/health', methods=['GET'])
def health_check():
    try:
        # Try to query the database to check connection
        db.session.execute('SELECT 1')  # This is a simple query to check if the database is reachable
        return jsonify({"status": "success", "message": "Database connection is working."}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Database connection failed: {str(e)}"}), 500