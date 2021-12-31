import glob
from os import stat
from re import match, template
from subprocess import Popen
from threading import Timer
from time import time
from typing import Match

from flask import Flask, jsonify, request, render_template
from flask_cors import CORS, core, cross_origin
from flask_socketio import SocketIO, emit
from numpy import mat, short
from markupsafe import escape
import websocket
import requests
import time
import constants
import socketio
app = Flask(__name__)
app.secret_key = '&(*(**((*@@@#$333(*(*221'
socket_io = SocketIO(app, cors_allowed_origins="*")
app.config.update(SESSION_COOKIE_SAMESITE="None", SESSION_COOKIE_SECURE=True)
socket_io.emit('kill_self',  {'data': 'Sleep'})
cors = CORS(app)
global match_details
match_details = constants.MATCH_DETAILS_TEMPLATE
global match_row_details
match_row_details = constants.ROW_MATCH_DETAILS_TEMPLATE
global team_details
team_details = [
    {
        'short_name':'TT1',
        'full_name':'TestTeam1',
        'logo':'default.png'
    },
    {
        'short_name':'TT2',
        'full_name':'TestTeam2',
        'logo':'default.png'
    }
]
@app.route('/api/v1/get_team_details', methods=['GET'])
@cross_origin(allow_headers=['*'])
def get_team_details():
    global team_details
    return jsonify({"response": team_details})
@app.route('/api/v1/post_team_details', methods=['POST'])
@cross_origin(allow_headers=['*'])
def post_team_details():
    global team_details
    try:
        team_details = request.get_json()
        return jsonify({"response": "Success"}), 200
    except Exception as exception:
        print(exception)
        return jsonify({"response": "Error"}), 500
@app.route('/api/v1/get_match_details', methods=['GET', 'POST'])
@cross_origin(allow_headers=['*'])
def get_match_details():
    global match_details
    # for testing:
    # testing_details = constants.corematch_example
    # return jsonify({"response": testing_details})
    # print("returning",match_details)
    return jsonify({"response": match_details})

@app.route('/get_row_match_details', methods=['GET', 'POST'])
@cross_origin(allow_headers=['*'])
def get_row_match_details():
    global match_row_details
    # for testing:
    # testing_details = constants.corematch_example
    # return jsonify({"response": testing_details})
    # print("returning",match_details)
    return jsonify({"data": match_row_details, 'state':'MENU'})

@app.route('/api/v1/get-name/<puuid>', methods=['GET', 'POST'])
@cross_origin(allow_headers=['*'])
def getname(puuid):
    try:
        name = requests.get(f'https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr/eu/{puuid}')
        name = f'{name["data"]["name"]}#{name["data"]["tag"]}'
    # for testing:
    # testing_details = constants.corematch_example
    # return jsonify({"response": testing_details})
    # print("returning",match_details)
        return jsonify({'GameName':name, 'name': name["data"]["name"], 'tag': name["data"]["tag"]})
    except Exception as exception:
        print(exception)
        return jsonify({"response": "Error"}), 500

@socket_io.on('connect')
def test_connect():
    global match_details
    print("1 machine connected")
    emit('after connect',  {'data': 'Woke up'})
    #updatestate = match_utils.statecheck(state)
    #print(updatestate)

@socket_io.on('hallo')
def hallo():
    print('hallo')

@socket_io.on('after connect')
@cross_origin(allow_headers=['*'])
def after_connect():
    print("After machine- connected")
    #global state 
    #state = updatestate

@app.route('/edit_team_details')
@cross_origin(allow_headers=['*'])
def edit_team_details():
    template = render_template('editteams.html')
    return template
    pass

if __name__ == "__main__":
    # socketio.run(app, port=4445, host = socket.gethostbyname(socket.gethostname()),debug='true')
    socket_io.run(app, port=5004, debug='true')
    # app.run(host='0.0.0.0', port=4445, debug='true')
