from flask import Blueprint, jsonify, request
import psycopg2.errors
from db.connection import get_cursor

staffs_bp = Blueprint("staffs", __name__)


# GET /staffs - List all staff with their role
@staffs_bp.route("", methods=["GET"])
def get_staffs():
    query_used = "SELECT * FROM staff ORDER BY last_name, first_name"
    with get_cursor() as (cur, conn):
        cur.execute(query_used)
        rows = cur.fetchall()
    return jsonify({"staffs": rows, "query": query_used})


# POST /staffs - Add a new staff member
@staffs_bp.route("", methods=["POST"])
def add_staff():
    data = request.json
    try:
        with get_cursor() as (cur, conn):
            cur.execute("""
                INSERT INTO staff (first_name, last_name, email, branch_id, role)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, first_name, last_name, email, role
            """, (
                data['first_name'],
                data['last_name'],
                data['email'],
                data['branch_id'],
                data.get('role', 'staff')
            ))
            new_staff = cur.fetchone()
        return jsonify(new_staff), 201
    except psycopg2.errors.UniqueViolation:
        return jsonify({"error": "A staff member with this email already exists"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# DELETE /staffs/<staff_id>
@staffs_bp.route("/<staff_id>", methods=["DELETE"])
def delete_staff(staff_id):
    try:
        with get_cursor(dict_cursor=False) as (cur, conn):
            cur.execute("DELETE FROM staff WHERE id = %s RETURNING id", (str(staff_id),))
            deleted = cur.fetchone()
            if deleted:
                return jsonify({"message": "Staff member deleted"})
            else:
                return jsonify({"error": "Staff member not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400
