#!flask/bin/python

"""Alternative version of the ToDo RESTful server implemented using the
Flask-RESTful extension."""

from flask import Flask, jsonify, abort, make_response
from flask_restful import Api, Resource, reqparse, fields, marshal
from flask_httpauth import HTTPBasicAuth
import pymysql
from datetime import datetime

app = Flask(__name__, static_url_path="")
api = Api(app)
auth = HTTPBasicAuth()

class Database:
    def __init__(self):
        host = "127.0.0.1"
        user = "user1"
        password = "Snu2019!"
        db = "research_db"
        self.con = pymysql.connect(host=host, user=user, password=password, db=db, cursorclass=pymysql.cursors.
                                   DictCursor)
        self.cur = self.con.cursor()

    def list_researchers(self):
        self.cur.execute("SELECT id, username, fullname, affiliation FROM researcher")
        result = self.cur.fetchall()
        return result

    def list_papers(self):
        self.cur.execute("SELECT id, title, authors, conference, year, affiliation, abstract, comments, read_by, read_date, research_id FROM paper ORDER BY research_id, read_by, read_date DESC")
        result = self.cur.fetchall()
        return result

    def list_papers_by_researcher(self, rid):
        self.cur.execute("SELECT id, title, authors, conference, year, affiliation, abstract, comments, read_by, read_date, research_id FROM paper WHERE read_by='" + rid + "' ORDER BY read_date DESC")
        result = self.cur.fetchall()
        return result

    def get_paper(self, id):
        self.cur.execute("SELECT id, title, authors, conference, year, affiliation, abstract, comments, read_by, read_date, research_id FROM paper WHERE id='" + id + "'")
        result = self.cur.fetchall()
        return result

    def check_login(self, username, password):
        print(username)
        if not username or not password:
             return False
        # select password from DB
        self.cur.execute("SELECT password FROM researcher WHERE username = '" + username + "'")
        result = self.cur.fetchall()
        if result and len(result) > 0 and password == result[0]["password"]:
             return True
        return False

    def insert_paper(self, title, authors, conference, year, affiliation, abstract, comments, read_by, read_date, research_id):
        self.cur.execute("INSERT INTO paper(title, authors, conference, year, affiliation, abstract, comments, read_by, read_date, research_id) " +
                          "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", (title, authors, conference, year, affiliation, abstract, comments, read_by, read_date, research_id))
        self.con.commit()

@auth.verify_password
def verify_password(username, password):
    db = Database()
    return db.check_login(username, password)


@auth.error_handler
def unauthorized():
    # return 403 instead of 401 to prevent browsers from displaying the default
    # auth dialog
    return make_response(jsonify({'message': 'Unauthorized access'}), 403)

class PaperListAPI(Resource):
    decorators = [auth.login_required]

    def __init__(self):
        super(PaperListAPI, self).__init__()

    def get(self, rid=0):
        db = Database()
        if not rid or rid == 0:
             papers = db.list_papers()
        else:
             papers = db.list_papers_by_researcher(str(rid))
        for paper in papers:
            read_date = paper['read_date']
            paper['read_date'] = read_date.strftime('%Y/%m/%d %H:%M:%S')
        return {'papers': papers}


class PaperAPI(Resource):
    decorators = [auth.login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('title', type=str, location='json')
        self.reqparse.add_argument('authors', type=str, location='json')
        self.reqparse.add_argument('conference', type=str, location='json')
        self.reqparse.add_argument('year', type=str, location='json')
        self.reqparse.add_argument('affiliation', type=str, location='json')
        self.reqparse.add_argument('comments', type=str, location='json')
        self.reqparse.add_argument('abstract', type=str, location='json')
        self.reqparse.add_argument('read_by', type=int, location='json')
        self.reqparse.add_argument('read_date', type=str, location='json')
        self.reqparse.add_argument('research_id', type=int, location='json')
        super(PaperAPI, self).__init__()

    def get(self, id):
        db = Database()
        paper = db.get_paper(str(id))
        if paper and len(paper) > 0:
             paper = paper[0]
        print(paper)
        read_date = paper['read_date']
        paper['read_date'] = read_date.strftime('%Y/%m/%d %H:%M:%S')
        return {'paper': paper}

    def post(self, id=0):
        db = Database()
        args = self.reqparse.parse_args()
        inputs = {}
        for k, v in args.items():
             inputs[k] = v
        print(inputs)
        if not inputs['read_date']:
            now = datetime.now()
            inputs['read_date'] = now.strftime('%Y/%m/%d %H:%M:%S')
        db.insert_paper(inputs['title'], inputs['authors'], inputs['conference'], inputs['year'], inputs['affiliation'], inputs['comments'], inputs['abstract'], inputs['read_by'], inputs['read_date'], inputs['research_id'])
        return {'success': 'true'}

    def delete(self, id):
        task = [task for task in tasks if task['id'] == id]
        if len(task) == 0:
            abort(404)
        tasks.remove(task[0])
        return {'result': True}

class ResearcherAPI(Resource):
     decorators = [auth.login_required]

     def __init__(self):
         super(ResearcherAPI, self).__init__()

     def get(self):
        db = Database()
        researchers = db.list_researchers()
        return {'researchers': researchers}

api.add_resource(ResearcherAPI, '/api/v1/researchers', endpoint='researchers')
api.add_resource(PaperListAPI, '/api/v1/papers')
api.add_resource(PaperListAPI, '/api/v1/papers/<int:rid>', endpoint='papers')
api.add_resource(PaperAPI, '/api/v1/paper/<id>', endpoint='paper')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
