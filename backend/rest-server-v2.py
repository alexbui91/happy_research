#!flask/bin/python

"""Alternative version of the ToDo RESTful server implemented using the
Flask-RESTful extension."""

from flask import Flask, jsonify, abort, make_response, g
from flask_restful import Api, Resource, reqparse, fields, marshal
from flask_httpauth import HTTPBasicAuth
from flask_cors import CORS, cross_origin

import pymysql
#from pymysqlpool.pool import Pool

from datetime import datetime

from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)

app = Flask(__name__, static_url_path="")
app.config['SECRET_KEY'] = 'Snu2019!'
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
api = Api(app)
auth = HTTPBasicAuth()

host = "147.47.206.14"
port = 3306
user = "user1"
password = "Snu2019!"
db = "research_db"
config={'host':host, 'port':port, 'user':user, 'password':password, 'database':db, 'autocommit':True}
#pool = Pool(host=host, port=port, user=user, password=password, db=db, autocommit=True)
#pool.init()

class Database:
    def __init__(self):
        self.con = pymysql.connect(host=host, port=port, user=user, password=password, db=db)
        #self.con = pool.get_conn()
        self.cur = self.con.cursor(pymysql.cursors.DictCursor)

    def close(self):
        self.cur.close()
        self.con.close()
        #pool.release(self.con)        

    def list_researchers(self):
        self.cur.execute("SELECT id, username, fullname, affiliation FROM researcher")
        result = self.cur.fetchall()
        self.close()
        return result

    def get_researcher(self, id):
        self.cur.execute("SELECT id, username, fullname, affiliation FROM researcher WHERE id = %s", id)
        results = self.cur.fetchall()
        self.close()
        if results and len(results) > 0:
            return results[0]
        return None

    def list_confs(self):
        self.cur.execute("SELECT id, abbr, name, year, location, type, field, impact_factor, link, start_date, end_date, submit_date, notification_date FROM conference WHERE start_date IS NOT NULL ORDER BY start_date ASC")
        results = self.cur.fetchall()
        self.close()
        return results

    def search_confs(self, search_key):
        search_key = search_key.lower()
        self.cur.execute("SELECT id, abbr, name, year, location, type, field, impact_factor, link FROM conference WHERE lower(abbr) LIKE %s OR lower(name) LIKE %s ORDER BY abbr", (search_key, search_key))
        results = self.cur.fetchall()
        self.close()
        return results

    def list_papers(self, offsetStart, pageSize):
        self.cur.execute("SELECT a.id, title, authors, conference, year, a.affiliation, abstract, comments, read_by, read_date, research_id, c.name AS research_name, a.paper_keys, a.paper_link, b.fullname FROM paper a JOIN researcher b ON a.read_by = b.id LEFT JOIN research c ON a.research_id = c.id ORDER BY read_date DESC LIMIT %s, %s", (offsetStart, pageSize))
        result = self.cur.fetchall()
        self.close()
        return result

    def list_papers_by_researcher(self, rid, offsetStart, pageSize):
        self.cur.execute("SELECT a.id, title, authors, conference, year, a.affiliation, abstract, comments, read_by, read_date, research_id, c.name AS research_name, a.paper_keys, a.paper_link, b.fullname FROM paper a JOIN researcher b ON a.read_by = b.id LEFT JOIN research c ON a.research_id = c.id WHERE read_by='" + rid + "' ORDER BY read_date DESC LIMIT %s, %s", (offsetStart, pageSize))
        result = self.cur.fetchall()
        self.close()
        return result

    def list_papers_by_project(self, project_id, offsetStart, pageSize):
        self.cur.execute("SELECT a.id, title, authors, conference, year, a.affiliation, abstract, comments, read_by, read_date, research_id, c.name AS research_name, a.paper_keys, a.paper_link, b.fullname FROM paper a JOIN researcher b ON a.read_by = b.id JOIN research c ON a.research_id = c.id WHERE a.research_id=%s ORDER BY read_date DESC LIMIT %s, %s", (str(project_id), offsetStart, pageSize))
        result = self.cur.fetchall()
        self.close()
        return result

    def get_paper(self, id):
        self.cur.execute("SELECT a.id, title, authors, conference, year, a.affiliation, abstract, comments, read_by, read_date, research_id, c.name AS research_name, a.paper_keys, a.paper_link, b.fullname FROM paper a JOIN researcher b ON a.read_by = b.id LEFT JOIN research c ON a.research_id = c.id WHERE a.id='" + id + "'")
        result = self.cur.fetchall()
        self.close()
        return result

    def search_papers(self, search_key):
        search_key = search_key.lower()
        self.cur.execute("SELECT a.id, title, authors, conference, year, a.affiliation, abstract, comments, read_by, read_date, research_id, c.name AS research_name, a.paper_keys, a.paper_link, b.fullname FROM paper a JOIN researcher b ON a.read_by = b.id LEFT JOIN research c ON a.research_id = c.id WHERE lower(title) LIKE %s OR lower(authors) LIKE %s OR lower(conference) LIKE %s OR lower(b.fullname) LIKE %s  ORDER BY read_date DESC", (search_key, search_key, search_key, search_key))
        result = self.cur.fetchall()
        self.close()
        return result

    def get_comments(self, paper_id):
        self.cur.execute("SELECT a.id, a.paper_id, a.researcher_id, a.comment, a.contribution_date, b.fullname FROM paper_contribution a JOIN researcher b ON a.researcher_id = b.id WHERE a.paper_id = %s ORDER BY a.contribution_date DESC", (paper_id))
        result = self.cur.fetchall()
        self.close()
        return result

    def insert_comment(self, paper_id, researcher_id, comment, contribution_date):
        self.cur.execute("INSERT INTO paper_contribution(paper_id, researcher_id, comment, contribution_date) VALUES(%s, %s, %s, %s)", (paper_id, researcher_id, comment, contribution_date))
        self.con.commit()
        # get new created id
        self.cur.execute("SELECT MAX(id) AS id FROM paper_contribution")
        result = self.cur.fetchall()
        self.close()
        return result[0]['id']

    def update_comment(self, comment_id, paper_id, researcher_id, comment, updated_date):
        self.cur.execute("UPDATE paper_contribution SET comment = %s, updated_date = %s WHERE id = %s AND paper_id = %s AND researcher_id = %s", (comment, updated_date, comment_id, paper_id, researcher_id))
        self.con.commit()
        self.close()
        return comment_id

    def delete_comment(self, id,  paper_id, researcher_id):
        num_row = self.cur.execute("DELETE FROM paper_contribution WHERE id = %s AND paper_id = %s AND researcher_id = %s", (id, paper_id, researcher_id))
        self.con.commit()
        self.close()
        return num_row

    def check_login(self, username, password):
        print(username)
        if not username or not password:
             return None
        # select password from DB
        self.cur.execute("SELECT id, username, fullname, password FROM researcher WHERE username = '" + username + "'")
        result = self.cur.fetchall()
        self.close()
        if result and len(result) > 0 and password == result[0]["password"]:
             return result[0]
        return None

    def getUser(self, id):
        self.cur.execute("SELECT id, username, fullname FROM researcher WHERE id = %s", (id))
        results = self.cur.fetchall()
        self.close()
        if (results and len(results) > 0):
            return results[0]
        return None

    def insert_paper(self, title, authors, conference, year, affiliation, abstract, comments, read_by, read_date, research_id, keys, paper_link):
        self.cur.execute("INSERT INTO paper(title, authors, conference, year, affiliation, abstract, comments, read_by, read_date, research_id, paper_keys, paper_link) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", (title, authors, conference, year, affiliation, abstract, comments, read_by, read_date, research_id, keys, paper_link))
        self.con.commit()
        # get new id
        self.cur.execute("SELECT MAX(id) AS id FROM paper")
        result = self.cur.fetchall()
        self.close()
        if result and len(result) > 0:
            return result[0]['id']
        return 0

    def update_paper(self, id, user_id, title, authors, conference, year, affiliation, abstract, comments, read_by, read_date, research_id, keys, paper_link):
        num_row = self.cur.execute("UPDATE paper SET title=%s, authors=%s, conference=%s, year=%s, affiliation=%s, abstract=%s, comments=%s, read_by=%s, read_date=%s, research_id=%s, paper_keys=%s, paper_link=%s WHERE id=%s AND read_by=%s", (title, authors, conference, year, affiliation, abstract, comments, read_by, read_date, research_id, keys, paper_link, id, user_id))
        self.con.commit()
        self.close()
        return num_row

    def delete_paper(self, id, user_id):
        num_row = self.cur.execute("DELETE FROM paper WHERE id = %s AND read_by = %s", (id, user_id))
        self.con.commit()
        self.close()
        return num_row

    def get_research(self, id):
        self.cur.execute("SELECT id, name, goals, start_date, end_date_plan, end_date_actual, type FROM research WHERE id = %s", (id))
        results = self.cur.fetchall()
        self.close()
        return results

    def list_research(self):
        self.cur.execute("SELECT id, name, goals, start_date, end_date_plan, end_date_actual, type, created_by FROM research ORDER BY type, start_date DESC")
        results = self.cur.fetchall()
        self.close()
        return results

    def insert_research(self, name, goals, start_date, end_date_plan, created_by, type):
        self.cur.execute("INSERT INTO research(name, goals, start_date, end_date_plan, created_by, type) VALUES (%s, %s, %s, %s, %s, %s)", (name, goals, start_date, end_date_plan, created_by, type))
        self.con.commit()
        # get new id
        self.cur.execute("SELECT MAX(id) AS id FROM research")
        result = self.cur.fetchall()
        self.close()
        return result[0]['id']

    def update_research(self, id, name, goals, start_date, end_date_plan, created_by, type):
        self.cur.execute("UPDATE research SET name = %s, goals = %s, start_date = %s, end_date_plan = %s, created_by = %s, type = %s WHERE id = %s", (name, goals, start_date, end_date_plan, created_by, type, id))
        self.con.commit()
        self.close()
        return id

    def delete_research(self, id, created_by):
        # check if research not use in other paper
        self.cur.execute("SELECT COUNT(1) AS count FROM paper WHERE research_id = %s", (str(id)))
        result = self.cur.fetchall()
        if (result and result[0]['count'] > 0):
            return 0
        # delete
        num_row = self.cur.execute("DELETE FROM research WHERE id = %s AND created_by = %s", (str(id), str(created_by)))
        self.con.commit()
        self.close()
        return num_row

    def get_experiments(self, research_id, researcher_id):
        self.cur.execute("SELECT a.id, a.research_id, a.researcher_id, a.start_date, a.end_date, a.goal, a.input, a.method, a.result FROM experiment a WHERE a.research_id = %s AND a.researcher_id = %s ORDER BY a.start_date DESC", (research_id, researcher_id))
        result = self.cur.fetchall()
        self.close()
        return result

    def insert_experiment(self, research_id, researcher_id, start_date, end_date, goal, input, method, result):
        self.cur.execute("INSERT INTO experiment(research_id, researcher_id, start_date, end_date, goal, input, method, result) VALUES(%s, %s, %s, %s, %s, %s, %s, %s)", (research_id, researcher_id, start_date, end_date, goal, input, method, result))
        self.con.commit()
        # get new created id
        self.cur.execute("SELECT MAX(id) AS id FROM experiment")
        result = self.cur.fetchall()
        self.close()
        return result[0]['id']

    def update_experiment(self, id, research_id, researcher_id, start_date, end_date, goal, input, method, result):
        self.cur.execute("UPDATE experiment SET research_id = %s, researcher_id = %s, start_date = %s, end_date = %s, goal = %s, input = %s, method = %s, result = %s WHERE id = %s", (research_id, researcher_id, start_date, end_date, goal, input, method, result, id))
        self.con.commit()
        self.close()
        return id

    def delete_experiment(self, id,  research_id, researcher_id):
        num_row = self.cur.execute("DELETE FROM experiment WHERE id = %s AND research_id = %s AND researcher_id = %s", (id, research_id, researcher_id))
        self.con.commit()
        self.close()
        return num_row


class User():
    def __init__(self, id, username, fullname):
         self.id = id
         self.username = username
         self.fullname = fullname

    def generate_auth_token(self, expiration = 600):
        print('generate_auth_token enter')
        s = Serializer(app.config['SECRET_KEY'], expires_in = expiration)
        return s.dumps({ 'id': self.id })

    @staticmethod
    def verify_auth_token(token):
        print('verify auth token enter')
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
    print('verify password enter')
    print('username: ' + username)
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
    print('get_auth_token enter')
    token = g.user.generate_auth_token(600)
    return jsonify({'token': token.decode('ascii'), 'duration': 600, 'id': g.user.id, 'username': g.user.username, 'fullname': g.user.fullname})


class PaperListAPI(Resource):
    #decorators = [auth.login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('offsetStart', type=int, location='json')
        self.reqparse.add_argument('pageSize', type=int, location='json')
        super(PaperListAPI, self).__init__()

    def get(self, rid=0):
        args = self.reqparse.parse_args()
        if not args:
            offsetStart = 0
            pageSize = 99999
        else:
            inputs = {}
            for k, v in args.items():
                inputs[k] = v
            if not inputs['offsetStart']:
                offsetStart = 0
            if not inputs['pageSize']:
                pageSize = 99999

        db = Database()
        if not rid or rid == 0:
             papers = db.list_papers(offsetStart, pageSize)
        else:
             papers = db.list_papers_by_researcher(str(rid), offsetStart, pageSize)
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
        self.reqparse.add_argument('paper_link', type=str, location='json')
        super(PaperAPI, self).__init__()

    def get(self, id):
        db = Database()
        paper = db.get_paper(str(id))
        if paper and len(paper) > 0:
             paper = paper[0]
        read_date = paper['read_date']
        paper['read_date'] = read_date.strftime('%Y/%m/%d %H:%M:%S')
        return {'paper': paper}

    def post(self, id=0):
      try: 
        args = self.reqparse.parse_args()
        inputs = {}
        for k, v in args.items():
             inputs[k] = v
        if not inputs['read_date']:
            now = datetime.now()
            inputs['read_date'] = now.strftime('%Y/%m/%d %H:%M:%S')
        db = Database()
        if id == 0:
            new_id = db.insert_paper(inputs['title'], inputs['authors'], inputs['conference'], inputs['year'], inputs['affiliation'], inputs['abstract'], inputs['comments'], inputs['read_by'], inputs['read_date'], inputs['research_id'], inputs['keys'], inputs['paper_link'])
        else:
            db.update_paper(str(id), inputs['read_by'], inputs['title'], inputs['authors'], inputs['conference'], inputs['year'], inputs['affiliation'], inputs['abstract'], inputs['comments'], inputs['read_by'], inputs['read_date'], inputs['research_id'], inputs['keys'], inputs['paper_link'])
            new_id = id
        return {'id': new_id}
      except Exception as e:
        return {'error': str(e)}

    def delete(self, id):
      try:
        args = self.reqparse.parse_args()
        inputs = {}
        for k, v in args.items():
             inputs[k] = v
        db = Database()
        num_row = db.delete_paper(str(id), inputs['read_by'])
        return {'num_row': num_row}
      except Exception as e:
        return {'error': str(e)}

class PaperContributeAPI(Resource):
    #decorators = [auth.login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('comment_id', type=int, location='json')
        self.reqparse.add_argument('user_id', type=int, location='json')
        self.reqparse.add_argument('paper_id', type=int, location='json')
        self.reqparse.add_argument('comment', type=str, location='json')
        super(PaperContributeAPI, self).__init__()

    def get(self, paper_id):
        db = Database()
        comments = db.get_comments(str(paper_id))
        for comment in comments:
            comment_date = comment['contribution_date']
            comment['contribution_date'] = comment_date.strftime('%Y/%m/%d %H:%M:%S')
        return {'comments': comments}

    def post(self, paper_id=0):
      try:
        args = self.reqparse.parse_args()
        inputs = {}
        for k, v in args.items():
             inputs[k] = v
        now = datetime.now()
        inputs['contribution_date'] = now.strftime('%Y/%m/%d %H:%M:%S')
        db = Database()
        if not inputs['comment_id']:
            new_id = db.insert_comment(inputs['paper_id'], inputs['user_id'], inputs['comment'], inputs['contribution_date'])
        else:
            new_id = db.update_comment(inputs['comment_id'], inputs['paper_id'], inputs['user_id'], inputs['comment'], inputs['contribution_date'])
        return {'id': new_id}

      except Exception as e:
        return {'error': str(e)}

    def delete(self, paper_id=0):
      try:
        args = self.reqparse.parse_args()
        inputs = {}
        for k, v in args.items():
             inputs[k] = v
        db = Database()
        num_row = db.delete_comment(str(inputs['comment_id']), str(inputs['paper_id']), str(inputs['user_id']))
        return {'num_row': num_row}
      except Exception as e:
        return {'error': str(e)}


class ResearcherListAPI(Resource):
     #decorators = [auth.login_required]

     def __init__(self):
         super(ResearcherListAPI, self).__init__()

     def get(self):
        db = Database()
        researchers = db.list_researchers()
        return {'researchers': researchers}

class ResearcherAPI(Resource):
     #decorators = [auth.login_required]

     def __init__(self):
         super(ResearcherAPI, self).__init__()

     def get(self, id):
        db = Database()
        researcher = db.get_researcher(str(id))
        return {'researcher': researcher}

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
        self.reqparse.add_argument('offsetStart', type=int, location='json')
        self.reqparse.add_argument('pageSize', type=int, location='json')
        super(ResearchAPI, self).__init__()

    def get(self, id=0):
        args = self.reqparse.parse_args()
        inputs = {}
        for k, v in args.items():
            inputs[k] = v
        if not inputs['offsetStart']:
            offsetStart = 0
        if not inputs['pageSize']:
            pageSize = 99999

        db = Database()
        if id > 0:
            research_list = db.get_research(str(id))
            db = Database()
            papers = db.list_papers_by_project(str(id), offsetStart, pageSize)
        else:
            research_list = db.list_research()
            papers = []
        for r in research_list:
            r['start_date'] = r['start_date'].strftime('%Y/%m/%d %H:%M:%S')
            if (r['end_date_plan']):
                r['end_date_plan'] = r['end_date_plan'].strftime('%Y/%m/%d %H:%M:%S')
            if (r['end_date_actual']):
                r['end_date_actual'] = r['end_date_actual'].strftime('%Y/%m/%d %H:%M:%S')
        for p in papers:
            p['read_date'] = p['read_date'].strftime('%Y/%m/%d %H:%M:%S')
        return [{'researches': research_list}, {'papers': papers}]

    def post(self, id=0):
        args = self.reqparse.parse_args()
        inputs = {}
        for k, v in args.items():
             inputs[k] = v
        if not inputs['start_date']:
            now = datetime.now()
            inputs['start_date'] = now.strftime('%Y/%m/%d %H:%M:%S')
        if not inputs['end_date_plan']:
           inputs['end_date_plan'] = None
        db = Database()
        if id == 0:
            new_id = db.insert_research(inputs['name'], inputs['goals'], inputs['start_date'], inputs['end_date_plan'], inputs['created_by'], inputs['type'])
        else:
            new_id = db.update_research(str(id), inputs['name'], inputs['goals'], inputs['start_date'], inputs['end_date_plan'], inputs['created_by'], inputs['type'])
        return {'id': new_id}

    def delete(self, id):
      try:
        args = self.reqparse.parse_args()
        inputs = {}
        for k, v in args.items():
             inputs[k] = v
        db = Database()
        num_row = db.delete_research(str(id), inputs['created_by'])
        return {'num_row': num_row}
      except Exception as e:
        return {'error': str(e)}

class ExperimentAPI(Resource):
    #decorators = [auth.login_required]

    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('experiment_id', type=int, location='json')
        self.reqparse.add_argument('researcher_id', type=int, location='json')
        self.reqparse.add_argument('research_id', type=int, location='json')
        self.reqparse.add_argument('start_date', type=str, location='json')
        self.reqparse.add_argument('end_date', type=str, location='json')
        self.reqparse.add_argument('goal', type=str, location='json')
        self.reqparse.add_argument('input', type=str, location='json')
        self.reqparse.add_argument('method', type=str, location='json')
        self.reqparse.add_argument('result', type=str, location='json')
        super(ExperimentAPI, self).__init__()

    def get(self, research_id):
        db = Database()
        results = db.get_experiments(str(research_id))
        for result in results:
            start_date = result['start_date']
            if start_date:
                result['start_date'] = start_date.strftime('%Y/%m/%d %H:%M:%S')
            end_date = result['end_date']
            if end_date:
                result['end_date'] = end__date.strftime('%Y/%m/%d %H:%M:%S')
        return {'experiments': results}

    def post(self, research_id=0):
      try:
        args = self.reqparse.parse_args()
        inputs = {}
        for k, v in args.items():
             inputs[k] = v
        if not inputs['start_date']:
            now = datetime.now()
            inputs['start_date'] = now.strftime('%Y/%m/%d %H:%M:%S')
        db = Database()
        if not inputs['experiment_id']:
            new_id = db.insert_experiment(inputs['research_id'], inputs['researcher_id'], inputs['start_date'], inputs['end_date'], inputs['goal'], inputs['input'], inputs['method'], inputs['result'])
        else:
            new_id = db.update_experiment(inputs['experiment_id'], inputs['research_id'], inputs['researcher_id'], inputs['start_date'], inputs['end_date'], inputs['goal'], inputs['input'], inputs['method'], inputs['result'])
        return {'id': new_id}

      except Exception as e:
        return {'error': str(e)}

    def delete(self, research_id=0):
      try:
        args = self.reqparse.parse_args()
        inputs = {}
        for k, v in args.items():
             inputs[k] = v
        db = Database()
        num_row = db.delete_experiment(str(inputs['experiment_id']), str(inputs['research_id']), str(inputs['researcher_id']))
        return {'num_row': num_row}
      except Exception as e:
        return {'error': str(e)}

class ConferenceAPI(Resource):
    #decorators = [auth.login_required]

    def __init__(self):
        super(ConferenceAPI, self).__init__()

    def get(self):
        db = Database()
        confs = db.list_confs()
        for conf in confs:
            if conf['start_date']:
                conf['start_date'] = conf['start_date'].strftime('%Y/%m/%d %H:%M:%S')
            if conf['end_date']:
                conf['end_date'] = conf['end_date'].strftime('%Y/%m/%d %H:%M:%S')
            if conf['submit_date']:
                conf['submit_date'] = conf['submit_date'].strftime('%Y/%m/%d %H:%M:%S')
            if conf['notification_date']:
                conf['notification_date'] = conf['notification_date'].strftime('%Y/%m/%d %H:%M:%S')
            if conf['type'] == 1:
                conf['type'] = 'conference'
            else:
                conf['type'] = 'journal'
        return {'confs': confs}

class ConferenceSearchAPI(Resource):
    #decorators = [auth.login_required]

    def __init__(self):
        super(ConferenceSearchAPI, self).__init__()

    def get(self, search_key):
        db = Database()
        confs = db.search_confs("%" + search_key + "%")
        for conf in confs:
            if conf['type'] == 1:
                conf['type'] = 'conference'
            else:
                conf['type'] = 'journal'
        return {'confs': confs}

class PaperSearchAPI(Resource):
    #decorators = [auth.login_required]

    def __init__(self):
        super(PaperSearchAPI, self).__init__()

    def get(self, search_key):
        db = Database()
        papers = db.search_papers("%" + search_key + "%")
        for paper in papers:
            if paper['read_date']:
                paper['read_date'] = paper['read_date'].strftime('%Y/%m/%d %H:%M:%S')
        return {'papers': papers}

api.add_resource(ResearcherAPI, '/api/v1/researcher/<int:id>', endpoint='researcher')
api.add_resource(ResearcherListAPI, '/api/v1/researchers', endpoint='researchers')
api.add_resource(PaperListAPI, '/api/v1/papers')
api.add_resource(PaperListAPI, '/api/v1/papers/<int:rid>', endpoint='papers')
api.add_resource(PaperAPI, '/api/v1/paper/<int:id>', endpoint='paper')
api.add_resource(PaperContributeAPI, '/api/v1/comment/<int:paper_id>', endpoint='comment')
api.add_resource(ResearchAPI, '/api/v1/research/<int:id>', endpoint='research')
api.add_resource(ExperimentAPI, '/api/v1/experiment/<int:research_id>', endpoint='experiment')
api.add_resource(ConferenceAPI, '/api/v1/conf', endpoint='conf')
api.add_resource(ConferenceSearchAPI, '/api/v1/conf/search/<string:search_key>')
api.add_resource(PaperSearchAPI, '/api/v1/paper/search/<string:search_key>')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=38500)
