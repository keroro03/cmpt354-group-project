from flask import Blueprint, jsonify, request
from db.connection import get_cursor

books_bp = Blueprint("books", __name__)


# Selection: Search books by title / author / book_id
# GET /books?q=<text>  or  GET /books?book_id=<uuid>
@books_bp.route("", methods=["GET"])
def search_books():
    q = request.args.get("q", "").strip()
    book_id = request.args.get("book_id", "").strip()
    genre = request.args.get("genre", "").strip()

    query_used = ""

    with get_cursor() as (cur, conn):
        if book_id:
            query_used = "SELECT DISTINCT b.* FROM book b WHERE b.id = %s"
            cur.execute(query_used, (book_id,))
        elif genre:
            query_used = "SELECT * FROM book WHERE LOWER(genre) = LOWER(%s) ORDER BY title"
            cur.execute(query_used, (genre,))
        elif q:
            like = f"%{q.lower()}%"
            query_used = """
SELECT DISTINCT b.*
FROM book b
LEFT JOIN book_author ba ON ba.book_id = b.id
LEFT JOIN author a ON a.id = ba.author_id
WHERE LOWER(b.title) LIKE %s
   OR LOWER(a.first_name || ' ' || a.last_name) LIKE %s
"""
            cur.execute(query_used, (like, like))
        else:
            query_used = "SELECT * FROM book ORDER BY title"
            cur.execute(query_used)

        rows = cur.fetchall()

    return jsonify({"books": rows, "query": query_used.strip()})


# GET /books/<book_id>/copies - Available copies only
@books_bp.route("/<book_id>/copies", methods=["GET"])
def get_available_copies(book_id):
    query_used = """
SELECT bc.*, b.branch_name, b.location
FROM book_copies bc
JOIN branch b ON b.id = bc.branch_id
WHERE bc.book_id = %s AND bc.status = 'AVAILABLE'
"""
    with get_cursor() as (cur, conn):
        cur.execute(query_used, (book_id,))
        rows = cur.fetchall()
    
    return jsonify({"copies": rows, "query": query_used.strip()})


# GET /books/<book_id>/copies/all - All copies regardless of status
@books_bp.route("/<book_id>/copies/all", methods=["GET"])
def get_all_copies(book_id):
    query_used = """
SELECT bc.*, b.branch_name, b.location
FROM book_copies bc
JOIN branch b ON b.id = bc.branch_id
WHERE bc.book_id = %s
ORDER BY bc.copied_book_id
"""
    with get_cursor() as (cur, conn):
        cur.execute(query_used, (book_id,))
        rows = cur.fetchall()
    
    return jsonify({"copies": rows, "query": query_used.strip()})


# Nested query: Most borrowed books
@books_bp.route("/popular", methods=["GET"])
def get_popular_books():
    query_used = """
SELECT b.id, b.title, COUNT(br.id) as borrow_count
FROM book b
JOIN borrow br ON b.id = br.book_id
GROUP BY b.id, b.title
ORDER BY borrow_count DESC
LIMIT 10
"""
    with get_cursor() as (cur, conn):
        cur.execute(query_used)
        rows = cur.fetchall()
    
    return jsonify({"popular_books": rows, "query": query_used.strip()})


# Nested query: Books that have never been borrowed
@books_bp.route("/never-borrowed", methods=["GET"])
def get_never_borrowed():
    query_used = """
SELECT b.*
FROM book b
WHERE b.id NOT IN (
    SELECT DISTINCT book_id FROM borrow
)
ORDER BY b.title
"""
    with get_cursor() as (cur, conn):
        cur.execute(query_used)
        rows = cur.fetchall()
    
    return jsonify({"books": rows, "query": query_used.strip()})


# GET /books/genres - List all distinct genres
@books_bp.route("/genres", methods=["GET"])
def get_genres():
    query_used = "SELECT DISTINCT genre FROM book WHERE genre IS NOT NULL ORDER BY genre"
    with get_cursor() as (cur, conn):
        cur.execute(query_used)
        rows = cur.fetchall()
    
    genres = [row["genre"] for row in rows]
    return jsonify({"genres": genres, "query": query_used})


# DELETE /books/<book_id>
# Cannot delete if any copy is currently borrowed
@books_bp.route("/<book_id>", methods=["DELETE"])
def delete_book(book_id):
    with get_cursor(dict_cursor=False) as (cur, conn):
        cur.execute(
            """
            SELECT 1 FROM borrow
            WHERE book_id = %s AND return_date IS NULL
            LIMIT 1
            """,
            (book_id,),
        )
        if cur.fetchone():
            return jsonify({"error": "Cannot delete a book that is currently borrowed"}), 409
        
        cur.execute("DELETE FROM book WHERE id = %s", (book_id,))
    
    return jsonify({"message": "Book deleted successfully"})


# POST /copies - Add a new book copy
@books_bp.route("/copies", methods=["POST"])
def add_copy():
    data = request.json
    with get_cursor(dict_cursor=False) as (cur, conn):
        cur.execute("""
            INSERT INTO book_copies (book_id, copied_book_id, branch_id, status)
            VALUES (%s, %s, %s, %s)
            RETURNING book_id, copied_book_id
        """, (data['book_id'], data['copied_book_id'], data['branch_id'], data.get('status', 'AVAILABLE')))
        new_copy = cur.fetchone()
    
    return jsonify({"message": "Copy added", "ids": new_copy}), 201


# DELETE /copies/<book_id>/<copied_book_id>
@books_bp.route("/copies/<book_id>/<int:copied_book_id>", methods=["DELETE"])
def delete_copy(book_id, copied_book_id):
    with get_cursor(dict_cursor=False) as (cur, conn):
        cur.execute("""
            DELETE FROM book_copies 
            WHERE book_id = %s AND copied_book_id = %s 
            RETURNING copied_book_id
        """, (str(book_id), copied_book_id))
        deleted_copy = cur.fetchone()
        if deleted_copy:
            return jsonify({"message": "Copy deleted", "copied_book_id": deleted_copy[0]}), 200
        else:
            return jsonify({"error": "Copy not found"}), 404

# Nested: Add an author to a book
@books_bp.route("/<uuid:book_id>/authors", methods=["POST"])
def add_author_to_book(book_id):
    data = request.json
    author_id = data.get("author_id")
    
    if not author_id:
        return jsonify({"error": "author_id is required"}), 400
    
    query_used = """
INSERT INTO book_author (book_id, author_id)
VALUES (%s, %s)
"""
    with get_cursor() as (cur, conn):
        cur.execute(query_used, (str(book_id), author_id))
        new_book_author = cur.fetchone()
    return jsonify({"message": "Author added to book", "book_id": book_id, "author_id": author_id, "query": query_used.strip()}), 201