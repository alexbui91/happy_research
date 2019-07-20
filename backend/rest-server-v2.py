#!flask/bin/python

"""Alternative version of the ToDo RESTful server implemented using the
Flask-RESTful extension."""

from flask import Flask, jsonify, abort, make_response, g
from flask_restful import Api, Resource, reqparse, fields, marshal
from flask_httpauth import HTTPBasicAuth
from flask_cors import CORS, cross_origin
import pymysql
from datetime import datetime

from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)

app = Flask(__name__, static_url_path="")
app.config['SECRET_KEY'] = 'Snu2019!'
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
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
        self.cur.close()
        return result

    def list_confs(self):
        self.cur.execute("SELECT id, name, year, location, type, field, link, start_date, end_date, submit_date, notification_date FROM conference ORDER BY start_date ASC")
        results = self.cur.fetchall()
        self.cur.close()
        return results

    def list_papers(self):
        self.cur.execute("SELECT a.id, title, authors, conference, year, a.affiliation, abstract, comments, read_by, read_date, research_id, a.keys, b.fullname FROM paper a JOIN researcher b ON a.read_by = b.id ORDER BY research_id, read_by, read_date DESC")
        result = self.cur.fetchall()
        self.cur.close()
        return result

    def list_papers_by_researcher(self, rid):
        self.cur.execute("SELECT a.id, title, authors, conference, year, a.affiliation, abstract, comments, read_by, read_date, research_id, a.keys, b.fullname FROM paper a JOIN researcher b ON a.read_by = b.id WHERE read_by='" + rid + "' ORDER BY read_date DESC")
        result = self.cur.fetchall()
        self.cur.close()
        return result

    def get_paper(self, id):
        self.cur.execute("SELECT a.id, title, authors, conference, year, a.affiliation, abstract, comments, read_by, read_date, research_id, a.keys, b.fullname FROM paper a JOIN researcher b ON a.read_by = b.id WHERE a.id='" + id + "'")
        result = self.cur.fetchall()
        self.cur.close()
        return result

    def check_login(self, username, password):
        print(username)
        if not username or not password:
             return None
        # select password from DB
        self.cur.execute("SELECT id, username, fullname, password FROM researcher WHERE username = '" + username + "'")
        result = self.cur.fetchall()
        self.cur.close()
        if result and len(result) > 0 and password == result[0]["password"]:
             return result[0]
        return None

    def getUser(self, id):
        self.cur.execute("SELECT id, username, fullname FROM researcher WHERE id = %s", (id))
        results = self.cur.fetchall()
        self.cur.close()
        if (results and len(results) > 0):
            return results[0]
        return None

    def insert_paper(self, title, authors, conference, year, affiliation, abstract, comments, read_by, read_date, research_id, keys):
        self.cur.execute("INSERT INTO paper(title, authors, conference, year, affiliation, abstract, comments, read_by, read_date, research_id, keys) " +
                          "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", (title, authors, conference, year, affiliation, abstract, comments, read_by, read_date, research_id, keys))
        self.con.commit()
        self.cur.close()

    def get_research(self, id):
        self.cur.execute("SELECT name, goals, start_date, end_date_plan, end_date_actual, type FROM research WHERE id = %s", (id))
        results = self.cur.fetchall()
        self.cur.close()
        if (results and len(results) > 0):
            return results[0]
        return None

    def list_research(self):
        self.cur.execute("SELECT name, goals, start_date, end_date_plan, end_date_actual, type FROM research ORDER BY type, start_date DESC")
        results = self.cur.fetchall()
        self.cur.close()
        return results

    def insert_research(self, name, goals, start_date, end_date_plan, created_by, type):
        self.cur.execute("INSERT INTO research(name, goals, start_date, end_date_plan, created_by, type) " +
                          "VALUES (%s, %s, %s, %s, %s, %s)", (name, goals, start_date, end_date_plan, created_by, type))
        self.con.commit()
        self.cur.close()


class User():
    def __init__(self, id, username, fullname):
         self.id = id
         self.username = username
         self.fullname = fullname

    def generate_auth_token(self, expiration = 600):
        s = Serializer(app.config['SECRET_KEY'], expires_in = expiration)
        return s.dumps({ 'id': self.id })

    @staticmethod
    def verify_auth_token(token):
        s = Serializer(app.config['SECRET_KEY'])
        try:
            data = s.loads(token)
        except SignatureExpired:
            # valid token, but expired => generate new
            print(data['id'])
        except BadSignature:
            return None # invalid token
        db = Datebase()
        user = db.getUser(data['id'])
        if user:
            return User(user['id'], user['username'], user['fullname'])
        return None

@auth.verify_password
def verify_password(username, password):
    print( username)
    # first try to authenticate by token
    user = User.verify_auth_token(username)
    if not user:
        # try to authenticate with username/password
        db = Database()
        result = db.check_login(username, password)
        if not result:
            return False
        user = User(result['id'], result['username'], result['fullname'])
       
    g.user = user
    return True

@auth.error_handler
def unauthorized():
    # return 403 instead of 401 to prevent browsers from displaying the default
    # auth dialog
    return make_response(jsonify({'message': 'Unauthorized access'}), 403)

@app.route('/api/v1/token', methods=['POST','OPTIONS'])
@cross_origin()
@auth.login_required
def get_auth_token():
    token = g.user.generate_auth_token(600)
    return jsonify({'token': token.decode('ascii'), 'duration': 600, 'id': g.user.id, 'username': g.user.username, 'fullname': g.user.fullname})


class PaperListAPI(Resource):
    #decorators = [auth.login_required]

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
    #decorators = [auth.login_required]

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
        self.reqparse.add_argument('keys', type=str, location='json')
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
        args = self.reqparse.parse_args()
        inputs = {}
        for k, v in args.items():
             inputs[k] = v
        print(inputs)
        if not inputs['read_date']:
            now = datetime.now()
            inputs['read_date'] = now.strftime('%Y/%m/%d %H:%M:%S')
        db = Database()
        db.insert_paper(inputs['title'], inputs['authors'], inputs['conference'], inputs['year'], inputs['affiliation'], inputs['abstract'], inputs['comments'], inputs['read_by'], inputs['read_date'], inputs['research_id'], inputs['keys'])
        return {'success': 'true'}

    def delete(self, id):
        task = [task for task in tasks if task['id'] == id]
        if len(task) == 0:
            abort(404)
        tasks.remove(task[0])
        return {'result': True}

class ResearcherAPI(Resource):
     #decorators = [auth.login_required]

     def __init__(self):
         super(ResearcherAPI, self).__init__()

     def get(self):
        db = Database()
        researchers = db.list_researchers()
        return {'researchers': researchers}

class ResearchAPI(Resource):
    #decorators = [auth.login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('name', type=str, location='json')
        self.reqparse.add_argument('goals', type=str, location='json')
        self.reqparse.add_argument('start_date', type=str, location='json')
        self.reqparse.add_argument('end_date_plan', type=str, location='json')
        self.reqparse.add_argument('created_by', type=int, location='json')
        self.reqparse.add_argument('type', type=int, location='json')
        super(ResearchAPI, self).__init__()

    def get(self, id=0):
        db = Database()
        if id > 0:
            research_list = db.get_research(str(id))
        else:
            research_list = db.list_research()
        for r in research_list:
            r['start_date'] = r['start_date'].strftime('%Y/%m/%d %H:%M:%S')
            if (r['end_date_plan']):
                r['end_date_plan'] = r['end_date_plan'].strftime('%Y/%m/%d %H:%M:%S')
            if (r['end_date_actual']):
                r['end_date_actual'] = r['end_date_actual'].strftime('%Y/%m/%d %H:%M:%S')
        return {'researches': research_list}

    def post(self, id=0):
        args = self.reqparse.parse_args()
        inputs = {}
        for k, v in args.items():
             inputs[k] = v
        if not inputs['start_date']:
            now = datetime.now()
            inputs['start_date'] = now.strftime('%Y/%m/%d %H:%M:%S')
        db = Database()
        db.insert_research(inputs['name'], inputs['goals'], inputs['start_date'], inputs['end_date_plan'], inputs['created_by'], inputs['type'])
        return {'success': 'true'}

    def delete(self, id):
        task = [task for task in tasks if task['id'] == id]
        if len(task) == 0:
            abort(404)
        tasks.remove(task[0])
        return {'result': True}

class ConferenceAPI(Resource):
    #decorators = [auth.login_required]

    def __init__(self):
        super(ConferenceAPI, self).__init__()

    def get(self):
        db = Database()
        confs = db.list_confs()
        for conf in confs:
            conf['start_date'] = conf['start_date'].strftime('%Y/%m/%d %H:%M:%S')
            conf['end_date'] = conf['end_date'].strftime('%Y/%m/%d %H:%M:%S')
            conf['submit_date'] = conf['submit_date'].strftime('%Y/%m/%d %H:%M:%S')
            conf['notification_date'] = conf['notification_date'].strftime('%Y/%m/%d %H:%M:%S')
            if conf['type'] == 1:
                conf['type'] = 'conference'
            else:
                conf['type'] = 'journal'
        return {'confs': confs}

api.add_resource(ResearcherAPI, '/api/v1/researchers', endpoint='researchers')
api.add_resource(PaperListAPI, '/api/v1/papers')
api.add_resource(PaperListAPI, '/api/v1/papers/<int:rid>', endpoint='papers')
api.add_resource(PaperAPI, '/api/v1/paper/<int:id>', endpoint='paper')
api.add_resource(ResearchAPI, '/api/v1/research/<int:id>', endpoint='research')
api.add_resource(ConferenceAPI, '/api/v1/conf', endpoint='conf')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
