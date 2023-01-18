var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http,{
    cors: {
      origin: '*',
    }
});
var cors = require("cors")
var axios = require('axios')
const fs = require("fs");
const { SocketAddress } = require('net');
app.use(express.static(__dirname));
var teamDetails = [
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
const allowedOrigins = ['*'];
app.use(cors(allowedOrigins));
app.use(express.json());
var match_details = {"red": {}, "blue": {}, "events": []}
var row_match_details = {}
var current_state;
var current_gamemode;
app.get('/', function(req, res){
    res.send('Hello');
    io.emit('after connect',  {'data': 'Woke up'})
});

app.get('/api/v1/get_team_details', function(req, res){
    res.send({response: teamDetails});
})

app.get('/api/v1/get_match_details', function(req, res){
    res.send({response: match_details});
})

app.get('/api/v1/get_row_match_details', function(req, res){
    res.send({data: row_match_details, state: current_state, gamemode: current_gamemode});
})

app.post('/api/v1/post_team_details', function(req, res){
    console.log(req.body);
    teamDetails = req.body;
    io.emit('team_info_update', {"teams": teamDetails})
    res.status(200).send("successfully updated!")
})

app.post('/api/v1/switch_sides', function(req, res){
    io.emit('team_side_update', {"teams": null})
    res.status(200).send("successfully updated!")
})

app.post('/api/v1/map_point', function(req, res){
    console.log(req.body)
    io.emit('map_point', req.body)
    res.status(200).send("successfully updated!")
})

app.get('/api/v1/get-name/:puuid', async function(req, res){
    var puuid = req.params.puuid
    var name = await axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr/eu/${puuid}`)
    var namejson = name.data
    console.log(name.data)
    res.send({GameName: `${namejson.data.name}#${namejson.data.tag}`, name: namejson.data.name, tag: namejson.data.tag});
})

app.get('/api/v1/overwolf/event/:state', async function(req, res){
    var state = req.params.state;
    console.log(state)
    io.emit('event', {"event": state})
    res.status(200).send("successfully updated!")
})

app.post('/api/v1/overwolf/infoupdate/', async function(req, res){
    let json = req.body
    if(json == {} || json == "{}") return;
    
    if(json.match_info){
        
        let matchinfo = json.match_info
        io.emit('infoupdate', {"info": matchinfo})
        if(matchinfo.round_number){io.emit('round_number_update', {"round": matchinfo.round_number}); console.log("Round number")}
        if(matchinfo.score){io.emit('score_update', {"score": matchinfo.score}); console.log("Score", )}
        if(matchinfo.round_phase){io.emit('round_phase_update', {"roundphase": matchinfo.round_phase}); console.log("Round Phase")}
        if(matchinfo.team){io.emit('team_side_update', {"team": matchinfo.team}); console.log("Team")}
        if(matchinfo.match_outcome){io.emit('match_outcome', {"match_outcome": matchinfo.match_outcome}); console.log("Match Outcome")}
        if(matchinfo.scoreboard_0 || matchinfo.scoreboard_1 || matchinfo.scoreboard_2 || matchinfo.scoreboard_3 || matchinfo.scoreboard_4 || matchinfo.scoreboard_5 || matchinfo.scoreboard_6 || matchinfo.scoreboard_7 || matchinfo.scoreboard_8 || matchinfo.scoreboard_9){io.emit('scoreboard_update', matchinfo); console.log("Scoreboard")}
    }
    
    res.status(200).send("successfully updated!")
})

io.on('connection', function(socket){
    console.log("1 machine connected")
    socket.emit('after connect',  {'data': 'Woke up'})
    socket.on('update_details', function(data){
        console.log("Sending new match_details")
        match_details = data['match_details']
        state = data['game_state']
        row_match_details = data['row_match_details']
        io.emit('receive_details',  {'match_details': data['match_details'], 'live_details': data['live_details'], 'team_details': teamDetails})
        console.log('done')
    })
    setInterval(()=>{
       socket.emit('hello', 'Nothing')
    }, 1000)
    
});


http.listen(process.env.PORT || 3000,'0.0.0.0', function(){
    console.log('listening on *:3000');
});
