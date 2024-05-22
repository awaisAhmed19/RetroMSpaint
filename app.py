from flask import Flask, render_template

app=Flask(__name__,template_folder='./Frontend/src/html_template',static_folder='./Frontend/src/static')



@app.route('/')
def index():
    return render_template("Index.html")


if __name__ == '__main__':
    app.run(debug=True,use_reloader=True)