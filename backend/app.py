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
from routes.staffs import staffs_bp

app.register_blueprint(books_bp, url_prefix="/books")
app.register_blueprint(members_bp, url_prefix="/members")
app.register_blueprint(borrows_bp, url_prefix="/borrow")
app.register_blueprint(branches_bp, url_prefix="/branches")
app.register_blueprint(authors_bp, url_prefix="/authors")
app.register_blueprint(staffs_bp, url_prefix="/staffs")

if __name__ == "__main__":
    app.run(port=8000, debug=True)