import os
import psycopg2
import psycopg2.extras

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


def get_db():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    return conn


# Selection: Search books by title / author / book_id
# GET /books?q=<text>  or  GET /books?book_id=<uuid>
# Returns a distinct list of books (not copies)
@app.route("/books", methods=["GET"])
def search_books():
    q = request.args.get("q", "").strip()
    book_id = request.args.get("book_id", "").strip()

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    if book_id:
        cur.execute("SELECT DISTINCT b.* FROM book b WHERE b.id = %s", (book_id,))
    elif q:
        like = f"%{q.lower()}%"
        cur.execute(
            """
            SELECT DISTINCT b.*
            FROM book b
            LEFT JOIN book_author ba ON ba.book_id = b.id
            LEFT JOIN author a ON a.id = ba.author_id
            WHERE LOWER(b.title) LIKE %s
               OR LOWER(a.first_name || ' ' || a.last_name) LIKE %s
            """,
            (like, like),
        )
    else:
        cur.execute("SELECT * FROM book ORDER BY title")

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"books": rows})


# Selection: Show all available copies of a book
# GET /books/<book_id>/copies
@app.route("/books/<book_id>/copies", methods=["GET"])
def get_available_copies(book_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        """
        SELECT bc.*, b.branch_name, b.location
        FROM book_copies bc
        JOIN branch b ON b.id = bc.branch_id
        WHERE bc.book_id = %s AND bc.status = 'AVAILABLE'
        """,
        (book_id,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"copies": rows})


# Nested: Find the most borrowed book
# GET /books/popular
@app.route("/books/popular", methods=["GET"])
def get_popular_books():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        """
        SELECT b.*, COUNT(br.id) AS borrow_count
        FROM book b
        JOIN borrow br ON br.book_id = b.id
        GROUP BY b.id
        ORDER BY borrow_count DESC
        LIMIT 1
        """
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return jsonify({"book": row})


# Nested: Find books that have never been borrowed
# GET /books/never-borrowed
@app.route("/books/never-borrowed", methods=["GET"])
def get_never_borrowed_books():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        """
        SELECT * FROM book
        WHERE id NOT IN (SELECT DISTINCT book_id FROM borrow)
        ORDER BY title
        """
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"books": rows})



# Deletion: Delete a book
# DELETE /books/<book_id>
# Cannot delete if any copy is currently borrowed (return_date IS NULL)
# Valid deletes cascade to all book_copies (and their borrow history)
@app.route("/books/<book_id>", methods=["DELETE"])
def delete_book(book_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT 1 FROM borrow
        WHERE book_id = %s AND return_date IS NULL
        LIMIT 1
        """,
        (book_id,),
    )
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "Cannot delete a book that is currently borrowed"}), 409

    cur.execute("DELETE FROM book WHERE id = %s", (book_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Book deleted successfully"})



# Update: Check out a book (borrow)
# POST /borrow  body: { member_id, book_id, copied_book_id, due_date }
# DB triggers enforce: copy must be AVAILABLE and member must have < 5 active loans
@app.route("/borrow", methods=["POST"])
def borrow_book():
    data = request.get_json()
    member_id = data.get("member_id")
    book_id = data.get("book_id")
    copied_book_id = data.get("copied_book_id")
    due_date = data.get("due_date")

    if not all([member_id, book_id, copied_book_id, due_date]):
        return jsonify({"error": "member_id, book_id, copied_book_id, and due_date are required"}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(
            """
            INSERT INTO borrow (member_id, book_id, copied_book_id, due_date)
            VALUES (%s, %s, %s, %s)
            RETURNING *
            """,
            (member_id, book_id, copied_book_id, due_date),
        )
        row = cur.fetchone()
        conn.commit()
        return jsonify({"borrow": row}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 409
    finally:
        cur.close()
        conn.close()



# Update: Return a book
# POST /return  body: { book_id, copied_book_id }
# Sets return_date = today; trigger updates book_copies.status to AVAILABLE
@app.route("/return", methods=["POST"])
def return_book():
    data = request.get_json()
    book_id = data.get("book_id")
    copied_book_id = data.get("copied_book_id")

    if not all([book_id, copied_book_id]):
        return jsonify({"error": "book_id and copied_book_id are required"}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        """
        UPDATE borrow
        SET return_date = CURRENT_DATE
        WHERE book_id = %s AND copied_book_id = %s AND return_date IS NULL
        RETURNING *
        """,
        (book_id, copied_book_id),
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "No active borrow found for this copy"}), 404
    return jsonify({"borrow": row})



# Selection: Overdue loans for a member
# GET /loans/<member_id>/overdue
# due_date < today AND return_date IS NULL
@app.route("/loans/<member_id>/overdue", methods=["GET"])
def get_overdue_loans(member_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        """
        SELECT br.*, b.title
        FROM borrow br
        JOIN book b ON b.id = br.book_id
        WHERE br.member_id = %s
          AND br.due_date < CURRENT_DATE
          AND br.return_date IS NULL
        ORDER BY br.due_date
        """,
        (member_id,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"overdue_loans": rows})



# Aggregation: Count books borrowed per member
# GET /members/borrow-count
@app.route("/members/borrow-count", methods=["GET"])
def get_borrow_count_per_member():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        """
        SELECT m.id, m.first_name, m.last_name, COUNT(br.id) AS borrow_count
        FROM member m
        LEFT JOIN borrow br ON br.member_id = m.id
        GROUP BY m.id, m.first_name, m.last_name
        ORDER BY borrow_count DESC
        """
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"members": rows})



# Division: Members who have borrowed all books in a given genre
# GET /members/borrowed-all?genre=<genre>
@app.route("/members/borrowed-all", methods=["GET"])
def get_members_borrowed_all_in_genre():
    genre = request.args.get("genre", "").strip()
    if not genre:
        return jsonify({"error": "genre query parameter is required"}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        """
        SELECT m.id, m.first_name, m.last_name
        FROM member m
        WHERE NOT EXISTS (
            SELECT b.id FROM book b
            WHERE b.genre = %s
              AND NOT EXISTS (
                  SELECT 1 FROM borrow br
                  WHERE br.member_id = m.id
                    AND br.book_id = b.id
              )
        )
        ORDER BY m.last_name, m.first_name
        """,
        (genre,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"members": rows})



# Deletion: Delete a library member
# DELETE /members/<member_id>
# Cannot delete if member has active (unreturned) borrows
@app.route("/members/<member_id>", methods=["DELETE"])
def delete_member(member_id):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM member WHERE id = %s", (member_id,))
        conn.commit()
        return jsonify({"message": "Member deleted successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 409
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    app.run(port=8000, debug=True)
