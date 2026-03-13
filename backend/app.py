import os
import psycopg2

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
    cur.execute("SELECT * FROM authors")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"authors": rows}

@app.route("/books/<int:book_id>", methods=["GET"])
def get_book(book_id):
    pass

@app.route("/books/popular", methods=["GET"])
def get_popular_books():
    pass

@app.route("/copies", methods=["POST"])
def add_copy():
    pass

@app.route("/copies/<int:copy_id>", methods=["DELETE"])
def delete_copy(copy_id):
    pass

@app.route("/borrow", methods=["POST"])
def borrow_book():
    pass

@app.route("/return", methods=["POST"])
def return_book():
    pass

@app.route("/loans/<int:member_id>/overdue", methods=["GET"])
def get_overdue_loans(member_id):
    pass

@app.route("/members", methods=["POST"])
def add_member():
    pass

@app.route("/members/<int:member_id>", methods=["DELETE"])
def delete_member(member_id):
    pass

if __name__ == "__main__":
    app.run(debug=True)
