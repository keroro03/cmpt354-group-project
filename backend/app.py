import os
import psycopg2
import psycopg2.extras

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from psycopg2 import sql

# Load all .env vars 
load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    print("Connected to DB")
    return conn

# Endpoints
@app.route("/authors", methods=["GET"])
def get_authors():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM author")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"authors": rows}

@app.route("/books/<uuid:book_id>", methods=["GET"])
def get_book(book_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT b.*, array_agg(a.first_name || ' ' || a.last_name) as authors
        FROM book b
        JOIN book_author ba ON b.id = ba.book_id
        JOIN author a ON ba.author_id = a.id
        WHERE b.id = %s
        GROUP BY b.id
    """, (str(book_id),))
    book = cur.fetchone()
    cur.close()
    conn.close()
    return jsonify(book) if book else ({"error": "Book not found"}, 404)

@app.route("/books/popular", methods=["GET"])
def get_popular_books():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT b.title, COUNT(br.id) as borrow_count
        FROM book b
        JOIN borrow br ON b.id = br.book_id
        GROUP BY b.id, b.title
        ORDER BY borrow_count DESC
        LIMIT 10
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"popular_books": rows})

@app.route("/copies", methods=["POST"])
def add_copy():
    data = request.json
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO book_copies (book_id, copied_book_id, branch_id, status)
            VALUES (%s, %s, %s, %s)
            RETURNING book_id, copied_book_id
        """, (data['book_id'], data['copied_book_id'], data['branch_id'], data.get('status', 'AVAILABLE')))
        new_copy = cur.fetchone()
        conn.commit()
        return jsonify({"message": "Copy added", "ids": new_copy}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

@app.route("/copies/<uuid:book_id>/<int:copied_book_id>", methods=["DELETE"])
def delete_copy(book_id, copied_book_id):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            DELETE FROM book_copies 
            WHERE book_id = %s AND copied_book_id = %s 
            RETURNING copied_book_id
        """, (str(book_id), copied_book_id))
        deleted_copy = cur.fetchone()
        if deleted_copy:
            conn.commit()
            return jsonify({"message": "Copy deleted", "copied_book_id": deleted_copy[0]}), 200
        else:
            return jsonify({"error": "Copy not found"}), 404
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

@app.route("/borrow", methods=["POST"])
def borrow_book():
    data = request.json
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO borrow (member_id, book_id, copied_book_id, due_date)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """, (data['member_id'], data['book_id'], data['copied_book_id'], data['due_date']))
        borrow_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({"message": "Book checked out", "borrow_id": borrow_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

@app.route("/return", methods=["POST"])
def return_book():
    data = request.json
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE borrow 
            SET return_date = CURRENT_DATE 
            WHERE book_id = %s AND copied_book_id = %s AND return_date IS NULL
            RETURNING id
        """, (data['book_id'], data['copied_book_id']))
        updated = cur.fetchone()
        if not updated:
            return jsonify({"error": "No active loan found for this copy"}), 404
        conn.commit()
        return jsonify({"message": "Book returned successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

@app.route("/loans/<uuid:member_id>/overdue", methods=["GET"])
def get_overdue_loans(member_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT br.*, b.title 
        FROM borrow br
        JOIN book b ON br.book_id = b.id
        WHERE br.member_id = %s 
          AND br.return_date IS NULL 
          AND br.due_date < CURRENT_DATE
    """, (str(member_id),))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"overdue_loans": rows})

@app.route("/members", methods=["POST"])
def add_member():
    data = request.json
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
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
        conn.commit()
        return jsonify(new_member), 201
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return jsonify({"error": "A member with this email already exists"}), 400
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

@app.route("/members/<uuid:member_id>", methods=["DELETE"])
def delete_member(member_id):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM member WHERE id = %s", (str(member_id),))
        conn.commit()
        return jsonify({"message": "Member deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    app.run(port=8000, debug=True)