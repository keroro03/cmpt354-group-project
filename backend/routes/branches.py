from flask import Blueprint, jsonify
from db.connection import get_cursor

branches_bp = Blueprint("branches", __name__)


# GET /branches - List all branches
@branches_bp.route("", methods=["GET"])
def get_branches():
    query_used = "SELECT * FROM branch ORDER BY branch_name"
    with get_cursor() as (cur, conn):
        cur.execute(query_used)
        rows = cur.fetchall()
    
    return jsonify({"branches": rows, "query": query_used})
