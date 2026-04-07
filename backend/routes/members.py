from flask import Blueprint, jsonify, request
import psycopg2.errors
from db.connection import get_cursor

members_bp = Blueprint("members", __name__)


# GET /members - List all members with borrow count (aggregation query)
@members_bp.route("", methods=["GET"])
def get_members():
    query_used = """
SELECT 
    m.*,
    COUNT(b.id) FILTER (WHERE b.return_date IS NULL) AS active_loans,
    COUNT(b.id) AS total_borrowed
FROM member m
LEFT JOIN borrow b ON b.member_id = m.id
GROUP BY m.id
ORDER BY m.last_name, m.first_name
"""
    with get_cursor() as (cur, conn):
        cur.execute(query_used)
        rows = cur.fetchall()
    
    return jsonify({"members": rows, "query": query_used.strip()})


# POST /members - Add a new member
@members_bp.route("", methods=["POST"])
def add_member():
    data = request.json
    try:
        with get_cursor() as (cur, conn):
            cur.execute("""
                INSERT INTO member (first_name, last_name, email, phone_number, address)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, first_name, last_name, email;
            """, (
                data['first_name'], 
                data['last_name'], 
                data['email'], 
                data.get('phone_number'), 
                data.get('address')
            ))
            new_member = cur.fetchone()
        return jsonify(new_member), 201
    except psycopg2.errors.UniqueViolation:
        return jsonify({"error": "A member with this email already exists"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# DELETE /members/<member_id>
@members_bp.route("/<member_id>", methods=["DELETE"])
def delete_member(member_id):
    try:
        with get_cursor(dict_cursor=False) as (cur, conn):
            cur.execute("DELETE FROM member WHERE id = %s RETURNING id", (str(member_id),))
            deleted = cur.fetchone()
            if deleted:
                return jsonify({"message": "Member deleted"})
            else:
                return jsonify({"error": "Member not found"}), 404
    except Exception as e:
        error_msg = str(e)
        if "active borrowed books" in error_msg:
            return jsonify({"error": "Cannot delete member with active borrowed books. All books must be returned first."}), 409
        return jsonify({"error": error_msg}), 400


# GET /members/<member_id>/loans - Get loans for a specific member
@members_bp.route("/<member_id>/loans", methods=["GET"])
def get_member_loans(member_id):
    active_only = request.args.get("active", "false").lower() == "true"
    
    if active_only:
        query_used = """
SELECT br.*, b.title as book_title
FROM borrow br
JOIN book b ON br.book_id = b.id
WHERE br.member_id = %s AND br.return_date IS NULL
ORDER BY br.due_date
"""
    else:
        query_used = """
SELECT br.*, b.title as book_title
FROM borrow br
JOIN book b ON br.book_id = b.id
WHERE br.member_id = %s
ORDER BY br.loan_date DESC
"""
    
    with get_cursor() as (cur, conn):
        cur.execute(query_used, (str(member_id),))
        rows = cur.fetchall()
    
    return jsonify({"loans": rows, "query": query_used.strip()})


# GET /members/<member_id>/overdue - Get overdue loans for a member
@members_bp.route("/<member_id>/overdue", methods=["GET"])
def get_overdue_loans(member_id):
    query_used = """
SELECT br.*, b.title as book_title
FROM borrow br
JOIN book b ON br.book_id = b.id
WHERE br.member_id = %s 
  AND br.return_date IS NULL 
  AND br.due_date < CURRENT_DATE
ORDER BY br.due_date
"""
    with get_cursor() as (cur, conn):
        cur.execute(query_used, (str(member_id),))
        rows = cur.fetchall()
    
    return jsonify({"overdue_loans": rows, "query": query_used.strip()})


# Division query: Members who borrowed all books in a specific genre
@members_bp.route("/genre-completionists", methods=["GET"])
def get_genre_completionists():
    genre = request.args.get("genre", "").strip()
    if not genre:
        return jsonify({"error": "Genre parameter required"}), 400
    
    query_used = """
SELECT m.id, m.first_name, m.last_name, m.email
FROM member m
WHERE NOT EXISTS (
    SELECT b.id
    FROM book b
    WHERE b.genre = %s
    AND b.id NOT IN (
        SELECT br.book_id
        FROM borrow br
        WHERE br.member_id = m.id
    )
)
AND EXISTS (
    SELECT 1 FROM book WHERE genre = %s
)
"""
    with get_cursor() as (cur, conn):
        cur.execute(query_used, (genre, genre))
        rows = cur.fetchall()
    
    return jsonify({
        "members": rows, 
        "genre": genre,
        "query": query_used.strip()
    })
