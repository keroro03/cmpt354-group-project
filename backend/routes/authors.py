from flask import Blueprint, jsonify, request
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

# POST /authors - Add a new author
@authors_bp.route("", methods=["POST"])
def add_author():
    data = request.json
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    
    if not first_name or not last_name:
        return jsonify({"error": "first_name and last_name are required"}), 400
    
    query_used = """
INSERT INTO author (first_name, last_name)
VALUES (%s, %s)
RETURNING id, first_name, last_name
"""
    with get_cursor() as (cur, conn):
        cur.execute(query_used, (first_name, last_name))
        new_author = cur.fetchone()
    return jsonify({"author": new_author, "query": query_used.strip()}), 201

# DELETE /authors/<author_id> - Delete an author
@authors_bp.route("/<uuid:author_id>", methods=["DELETE"])
def delete_author(author_id):
    query_used = "DELETE FROM author WHERE id = %s RETURNING id"
    try:
        with get_cursor(dict_cursor=False) as (cur, conn):
            cur.execute(query_used, (str(author_id),))
            deleted = cur.fetchone()
            if not deleted:
                return jsonify({"error": "Author not found"}), 404
        return jsonify({"message": "Author deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400