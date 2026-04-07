from flask import Blueprint, jsonify
from db.connection import get_cursor

authors_bp = Blueprint("authors", __name__)


# GET /authors - List all authors
@authors_bp.route("", methods=["GET"])
def get_authors():
    query_used = """
SELECT * FROM author 
ORDER BY last_name, first_name
"""
    with get_cursor() as (cur, conn):
        cur.execute(query_used)
        rows = cur.fetchall()
    
    return jsonify({"authors": rows, "query": query_used.strip()})
