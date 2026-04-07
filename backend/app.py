from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Register blueprints
from routes.books import books_bp
from routes.members import members_bp
from routes.borrows import borrows_bp
from routes.branches import branches_bp
from routes.authors import authors_bp
        
app.register_blueprint(books_bp, url_prefix="/books")
app.register_blueprint(members_bp, url_prefix="/members")
app.register_blueprint(borrows_bp, url_prefix="/borrow")
app.register_blueprint(branches_bp, url_prefix="/branches")
app.register_blueprint(authors_bp, url_prefix="/authors")

# ========== ALl endpoints under need to be organized into their respective file in routes/ later =============== # 

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