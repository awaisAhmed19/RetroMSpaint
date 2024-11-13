from flask import Flask, render_template
app = Flask(
    __name__,
    static_folder='./Frontend/static',
    template_folder='./Frontend/templates')

@app.route('/')
def index():
    return render_template('Index.html')

@app.route('/clear')
def clear():
    return ""

# Route to load dynamic templates
@app.route('/<template>.html')
def load_template(template):
    print(f'{template}.html')
    return render_template(f'{template}.html')

# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True)
