from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(
    __name__,
    static_folder='./Frontend/static',
    template_folder='./Frontend/templates'
)

# Database Configuration (SQLite for simplicity)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///drawings.db'  # Change to PostgreSQL/MySQL if needed
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize Database
db = SQLAlchemy(app)

# Define Drawing Model
class Drawing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False)
    image_data = db.Column(db.Text, nullable=False)  
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables before first request
@app.before_request
def create_tables():
    db.create_all()

@app.route('/')
def index():
    return render_template('Index.html')

@app.route('/clear')
def clear():
    return ""

# Route to load dynamic templates
@app.route('/<template>.html')
def load_template(template):
    return render_template(f'{template}.html')

# Save Drawing to DB
@app.route('/save', methods=['POST'])
def save_drawing():
    if not request.is_json:  # ✅ Ensure request is JSON
        return jsonify({'error': 'Invalid content type'}), 415
    
    data = request.get_json()  # ✅ Use get_json()
    user_id = data.get('user_id')
    image_data = data.get('image_data')

    if not user_id or not image_data:
        return jsonify({'error': 'Missing data'}), 400

    # Save the drawing (Assuming a database model exists)
    drawing = Drawing(user_id=user_id, image_data=image_data)
    db.session.add(drawing)
    db.session.commit()

    return jsonify({'message': 'Drawing saved successfully!'})

# Get Drawings for a User
@app.route('/drawings/<user_id>', methods=['GET'])
def get_drawings(user_id):
    drawings = Drawing.query.filter_by(user_id=user_id).all()
    return jsonify([{'id': d.id, 'image_data': d.image_data, 'timestamp': d.timestamp} for d in drawings])

# Run Flask App
if __name__ == '__main__':
    app.run(debug=True)
