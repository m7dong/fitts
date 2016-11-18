# all the imports
import os
import sqlite3
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash,jsonify
from models import *

# create our little application :)
app = Flask(__name__)
app.config.from_object(__name__)

# Load default config and override config from an environment variable
app.config.update(dict(
    DATABASE=os.path.join(app.root_path, 'fitts.db'),
    SECRET_KEY='development key',
    USERNAME='admin',
    PASSWORD='default'
))
app.config.from_envvar('FITTS_SETTINGS', silent=True)

def connect_db():
    """Connects to the specific database."""
    rv = sqlite3.connect(app.config['DATABASE'])
    rv.row_factory = sqlite3.Row
    return rv

def init_db():
    db = get_db()
    with app.open_resource('schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()

@app.cli.command('initdb')
def initdb_command():
    """Initializes the database."""
    init_db()
    print('Initialized the database.')

def get_db():
    """Opens a new database connection if there is none yet for the
    current application context.
    """
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db

@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()

@app.route("/",methods=["GET","POST"])
@app.route("/index",methods=["GET","POST"])
def index():
    return render_template("index.html")

@app.route("/add",methods=["GET","POST"])
def add():
    session_id = request.args.get('session_id')
    end_click = request.args.get('end_click')
    move_path = request.args.get('move_path')
    tre = request.args.get('tre')
    tac = request.args.get('tac')
    mdc = request.args.get('mdc')
    odc = request.args.get('odc')
    mv = request.args.get('mv')
    me = request.args.get('me')
    mo = request.args.get('mo')

    insert_entry(session_id, end_click, move_path, tre, tac, mdc, odc, mv, me, mo)
    return render_template("index.html")


if __name__== '__main__':
    app.run()
