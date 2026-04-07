from flask import Blueprint, jsonify, request
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

# POST /branches - Add a new branch
@branches_bp.route("", methods=["POST"])
def add_branch():
    data = request.json
    branch_name = data.get("branch_name")
    location = data.get("location")
    
    if not branch_name or not location:
        return jsonify({"error": "branch_name and location are required"}), 400
    
    query_used = """
INSERT INTO branch (branch_name, location)
VALUES (%s, %s)
RETURNING id, branch_name, location
"""
    with get_cursor() as (cur, conn):
        cur.execute(query_used, (branch_name, location))
        new_branch = cur.fetchone()
    return jsonify({"branch": new_branch, "query": query_used.strip()}), 201

# DELETE /branches/<branch_id> - Delete a branch
@branches_bp.route("/<uuid:branch_id>", methods=["DELETE"])
def delete_branch(branch_id):
    query_used = "DELETE FROM branch WHERE id = %s"
    with get_cursor() as (cur, conn):
        cur.execute(query_used, (str(branch_id),))
    return jsonify({"message": "Branch deleted", "query": query_used.strip()})  



