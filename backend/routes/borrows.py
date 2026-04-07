from flask import Blueprint, jsonify, request
from db.connection import get_cursor

borrows_bp = Blueprint("borrows", __name__)


# POST /borrow - Check out a book
@borrows_bp.route("", methods=["POST"])
def borrow_book():
    data = request.json
    try:
        with get_cursor(dict_cursor=False) as (cur, conn):
            cur.execute("""
                INSERT INTO borrow (member_id, book_id, copied_book_id, due_date)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, (data['member_id'], data['book_id'], data['copied_book_id'], data['due_date']))
            borrow_id = cur.fetchone()[0]
        return jsonify({"message": "Book checked out", "borrow_id": str(borrow_id)}), 201
    except Exception as e:
        error_msg = str(e)
        if "5 active borrows" in error_msg:
            return jsonify({"error": "Member has reached the maximum of 5 active loans"}), 400
        if "not available" in error_msg:
            return jsonify({"error": "This book copy is not available for checkout"}), 400
        if "already has an active borrow" in error_msg:
            return jsonify({"error": "This book copy is already borrowed"}), 400
        return jsonify({"error": error_msg}), 400


# POST /return - Return a book
@borrows_bp.route("/return", methods=["POST"])
def return_book():
    data = request.json
    with get_cursor(dict_cursor=False) as (cur, conn):
        cur.execute("""
            UPDATE borrow 
            SET return_date = CURRENT_DATE 
            WHERE book_id = %s AND copied_book_id = %s AND return_date IS NULL
            RETURNING id
        """, (data['book_id'], data['copied_book_id']))
        updated = cur.fetchone()
        if not updated:
            return jsonify({"error": "No active loan found for this copy"}), 404
    
    return jsonify({"message": "Book returned successfully"})


# GET /borrow/member/:member_id/active - Get active loans for a member
@borrows_bp.route("/member/<member_id>/active", methods=["GET"])
def get_member_active_loans(member_id):
    query_used = """
SELECT 
    b.id as borrow_id,
    b.book_id,
    b.copied_book_id,
    bk.title as book_title,
    b.loan_date,
    b.due_date,
    br.name as branch_name
FROM borrow b
JOIN book bk ON bk.id = b.book_id
JOIN book_copies bc ON bc.book_id = b.book_id AND bc.copied_book_id = b.copied_book_id
JOIN branch br ON br.id = bc.branch_id
WHERE b.member_id = %s AND b.return_date IS NULL
ORDER BY b.due_date ASC
"""
    with get_cursor() as (cur, conn):
        cur.execute(query_used, (member_id,))
        rows = cur.fetchall()
    
    return jsonify({"loans": rows, "query": query_used.strip()})


# GET /borrows/stats - Aggregation: books borrowed per member
@borrows_bp.route("/stats", methods=["GET"])
def get_borrow_stats():
    query_used = """
SELECT 
    m.id as member_id,
    m.first_name,
    m.last_name,
    COUNT(b.id) as total_borrowed,
    COUNT(b.id) FILTER (WHERE b.return_date IS NULL) as active_loans,
    COUNT(b.id) FILTER (WHERE b.return_date IS NULL AND b.due_date < CURRENT_DATE) as overdue_count
FROM member m
LEFT JOIN borrow b ON b.member_id = m.id
GROUP BY m.id, m.first_name, m.last_name
ORDER BY total_borrowed DESC
"""
    with get_cursor() as (cur, conn):
        cur.execute(query_used)
        rows = cur.fetchall()
    
    return jsonify({"stats": rows, "query": query_used.strip()})
