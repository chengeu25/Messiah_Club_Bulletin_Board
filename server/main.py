from flask import Flask, jsonify
from flask_mysqldb import MySQL

app = Flask(__name__)

# MySQL configurations
app.config["MYSQL_HOST"] = "localhost"
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = ""
app.config["MYSQL_DB"] = "sharc"

mysql = MySQL(app)


@app.route("/")
def hello():
    return "Hello, World!"


@app.route("/data")
def get_data():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users")
    results = cur.fetchall()
    cur.close()
    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True, port=3000)
