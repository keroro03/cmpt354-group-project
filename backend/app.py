import os

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_db():
    return


# Endpoints
@app.route("/books", methods=["GET"])
def get_books():
    pass

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
