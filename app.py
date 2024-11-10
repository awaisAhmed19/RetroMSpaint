from flask import Flask, render_template, send_from_directory, request,abort
from flask import make_response
import os
from jinja2 import FileSystemLoader,Environment
app = Flask(
    __name__,
    static_folder='./Frontend/static'
)

# Configure multiple template folders
template_loader = FileSystemLoader([
    './Frontend/html_template/Tool_options',
    './Frontend/html_template/Menu_dropdown',
    './Frontend/html_template/'
])
app.jinja_loader = template_loader

# Route for favicon.ico
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(app.static_folder, 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/<template>.html')
def template(template):
    try:
        return render_template(f'{template}.html')
    except Exception as e:
        return f"Error:{e}",404 

if __name__=='__main__':
    app.run(debug=True, use_reloader=True, threaded=False)