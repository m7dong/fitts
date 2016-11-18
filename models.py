import sqlite3 as sql

def insert_entry(session_id,end_click,move_path,tre, tac, mdc, odc, mv, me, mo):
    con = sql.connect("fitts.db")
    cur = con.cursor()
    cur.execute("INSERT INTO entries (session_id, end_click, move_path, tre, tac, mdc, odc, mv, me, mo) \
                VALUES (?,?,?,?,?,?,?,?,?,?)",
                (session_id,end_click, move_path, tre, tac, mdc, odc, mv, me, mo))
    con.commit()
    con.close()

def select_entries(params=()):
    con = sql.connect("fitts.db")
    cur = con.cursor()
    if params==():
        cur.execute("select * from entries")
    else:
        string = "select"
        for i in xrange(len(params)-1):
            string += "%s,"
        string += "%s"
        string += " from entries"

        result = cur.execute(string)
        con.close()
        return result.fetchall()
