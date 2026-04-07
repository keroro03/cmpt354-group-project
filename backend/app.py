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

@app.route("/authors", methods=["GET"])
def get_authors():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM author")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"authors": rows}


# Selection: get all authors (for dropdowns, etc.)
# GET /authors
# returns list of all authors with their id, first_name, last_name
@app.route("/authors", methods=["GET"])
def get_authors():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT * FROM author")
        rows = cur.fetchall()
    finally:
        cur.close()
        conn.close()
    return {"authors": rows}

# Add a new author
# POST /authors  body: { first_name, last_name }
# returns the new author's id, first_name, last_name
@app.route("/authors", methods=["POST"])
def add_author():
    data = request.json
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            INSERT INTO author (first_name, last_name)
            VALUES (%s, %s)
            RETURNING id, first_name, last_name;
        """, (
            data['first_name'],
            data['last_name']
        ))
        new_author = cur.fetchone()
        conn.commit()
        return jsonify(new_author), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

# Deletion: Delete an author
# DELETE /authors/<author_id>
@app.route("/authors/<uuid:author_id>", methods=["DELETE"])
def delete_author(author_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("DELETE FROM author WHERE id = %s", (author_id,))
        conn.commit()
        return jsonify({"message": "Author deleted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

# Add a new book
# POST /books  body: { title, isbn, publication_year, genre_id, author_id }
# returns the new book's id, title, isbn, publication_year, genre_id, author_id
@app.route("/books", methods=["POST"])
def add_book():
    data = request.json
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            INSERT INTO book (title, isbn, publication_year, genre)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, title, isbn, publication_year, genre;
        """, (
            data['title'],
            data.get('isbn'),
            data.get('publish_year'),
            data.get('publisher'),
            data.get('genre')
        ))
        new_book = cur.fetchone()
        if 'author_id' in data:
            cur.execute("""
                INSERT INTO book_author (book_id, author_id)
                VALUES (%s, %s)
            """, (new_book['id'], data['author_id']))
        conn.commit()
        return jsonify(new_book), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()


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

# Add a new copy of a book
# POST /copies  body: { book_id, copied_book_id, branch_id, status }
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

# Deletion: Delete a copy of a book
# DELETE /copies/<book_id>/<copied_book_id>
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

# Deletion: Delete a book
# DELETE /books/<book_id>
# Cannot delete if any copy is currently borrowed (return_date IS NULL)
# Valid deletes cascade to all book_copies (and their borrow history)
@app.route("/books/<uuid:book_id>", methods=["DELETE"])
def delete_book(book_id):
    conn = get_db()
    cur = conn.cursor()
    try:
        # 1. Check active borrows
        cur.execute("SELECT 1 FROM borrow WHERE book_id = %s AND return_date IS NULL", (str(book_id),))
        if cur.fetchone():
            return jsonify({"error": "Book has active loans"}), 409
        
        # 2. Clean up dependencies manually since schema is RESTRICT
        cur.execute("DELETE FROM book_author WHERE book_id = %s", (str(book_id),))
        cur.execute("DELETE FROM book_copies WHERE book_id = %s", (str(book_id),))
        cur.execute("DELETE FROM book WHERE id = %s", (str(book_id),))
        
        conn.commit()
        return jsonify({"message": "Book and all copies deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()



# Update: Check out a book (borrow)
# POST /borrow  body: { member_id, book_id, copied_book_id, due_date }
# DB triggers enforce: copy must be AVAILABLE and member must have < 5 active loans
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


# Update: Return a book
# POST /return  body: { book_id, copied_book_id }
# Sets return_date = today; trigger updates book_copies.status to AVAILABLE
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

# Selection: Get overdue loans for a member
# GET /loans/<member_id>/overdue
# returns list of all active loans for the member where due_date < today, including book title and loan details
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


# Add a new member
# POST /members  body: { first_name, last_name, email, phone_number, address }
# returns the new member's id, first_name, last_name, email
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

# Deletion: Delete a member
# DELETE /members/<member_id>
# returns error if member has any active loans (return_date IS NULL)
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

# Selection: Get all members
# GET /members
# returns list of all members with their id, first_name, last_name, email, phone_number, address
@app.route("/members", methods=["GET"])
def get_members():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM member")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"members": rows})

# Selection: Get all staff members
# GET /staffs
# returns list of all staff members with their id, first_name, last_name, email, branch_id
@app.route("/staffs", methods=["GET"])
def get_staffs():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM staff")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"staffs": rows})

# Add a new staff member
# POST /staffs  body: { first_name, last_name, email, branch_id }
# returns the new staff member's id, first_name, last_name, email
@app.route("/staffs", methods=["POST"])
def add_staff():
    data = request.json
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            INSERT INTO staff (first_name, last_name, email, branch_id)
            VALUES (%s, %s, %s, %s)
            RETURNING id, first_name, last_name, email;
        """, (
            data['first_name'], 
            data['last_name'], 
            data['email'], 
            data.get('phone_number'), 
            data['branch_id']
        ))
        new_staff = cur.fetchone()
        conn.commit()
        return jsonify(new_staff), 201
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return jsonify({"error": "A staff member with this email already exists"}), 400
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

# Deletion: Delete a staff member
# DELETE /staffs/<staff_id>
@app.route("/staffs/<uuid:staff_id>", methods=["DELETE"])
def delete_staff(staff_id):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM staff WHERE id = %s", (str(staff_id),))
        conn.commit()
        return jsonify({"message": "Staff member deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()
# Selection: Get all branches
# GET /branches
# returns list of all branches with their id, branch_name, location
@app.route("/branches", methods=["GET"])
def get_branches():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM branch")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"branches": rows})

# Add a new branch
# POST /branches  body: { branch_name, location }
# returns the new branch's id, branch_name, location
@app.route("/branches", methods=["POST"])
def add_branch(): 
    data = request.json
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            INSERT INTO branch (branch_name, location)
            VALUES (%s, %s)
            RETURNING id, branch_name, location;
        """, (
            data['branch_name'], 
            data['location']
        ))
        new_branch = cur.fetchone()
        conn.commit()
        return jsonify(new_branch), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()
# Deletion: Delete a branch
# DELETE /branches/<branch_id>
@app.route("/branches/<uuid:branch_id>", methods=["DELETE"])
def delete_branch(branch_id):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM branch WHERE id = %s", (str(branch_id),))
        conn.commit()
        return jsonify({"message": "Branch deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

# Nested: Add an author to a book
# POST /books/<book_id>/authors  body: { author_id }
# returns the new book-author association (book_id, author_id)
@app.route("/books/<uuid:book_id>/authors", methods=["POST"])
def add_author_to_book(book_id):
    data = request.json
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            INSERT INTO book_author (book_id, author_id)
            VALUES (%s, %s)
            RETURNING book_id, author_id;
        """, (
            str(book_id),
            data['author_id']
        ))
        new_book_author = cur.fetchone()
        conn.commit()
        return jsonify(new_book_author), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

# Nested: Add a branch to a member
# POST /members/<member_id>/branches  body: { branch_id }
# returns the new member-branch association (member_id, branch_id)
@app.route("/members/<uuid:member_id>/branches", methods=["POST"])
def add_branch_to_member(member_id):
    data = request.json
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("""
            INSERT INTO member_branch (member_id, branch_id)
            VALUES (%s, %s)
            RETURNING member_id, branch_id;
        """, (
            str(member_id),
            data['branch_id']
        ))
        new_member_branch = cur.fetchone()
        conn.commit()
        return jsonify(new_member_branch), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

# Nested: Remove a branch from a member
# DELETE /members/<member_id>/branches/<branch_id> 
@app.route("/members/<uuid:member_id>/branches/<uuid:branch_id>", methods=["DELETE"])
def delete_branch_from_member(member_id, branch_id):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute("""
            DELETE FROM member_branch 
            WHERE member_id = %s AND branch_id = %s 
            RETURNING branch_id
        """, (str(member_id), str(branch_id)))
        deleted_member_branch = cur.fetchone()
        if deleted_member_branch:
            conn.commit()
            return jsonify({"message": "Branch removed from member", "branch_id": deleted_member_branch[0]}), 200
        else:
            return jsonify({"error": "Branch not found for this member"}), 404
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    app.run(port=8000, debug=True)