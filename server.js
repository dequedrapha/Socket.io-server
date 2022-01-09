var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http,{
    cors: {
      origin: '*',
    }
});
var axios = require('axios')
const fs = require("fs")
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
app.use(express.json());
var match_details = {"red": {}, "blue": {}, "events": []}
var row_match_details = {}
var current_state;
var current_gamemode;
app.get('/', function(req, res){
    res.send('Hello');
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

    res.status(200).send("successfully updated!")
})

app.get('/api/v1/get-name/:puuid', async function(req, res){
    var puuid = req.params.puuid
    var name = await axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr/eu/${puuid}`)
    var namejson = name.data
    console.log(name.data)
    res.send({GameName: `${namejson.data.name}#${namejson.data.tag}`, name: namejson.data.name, tag: namejson.data.tag});
})

app.get('/edit_team_details', async function(req, res){
    res.sendFile(__dirname+'/static/html/editteams.html')
})

io.on('connection', function(socket){
    console.log("1 machine connected")
    socket.emit('after connect',  {'data': 'Woke up'})
    socket.on('update_details', function(data){
        console.log("Sending new match_details")
        match_details = data['match_details']
        state = data['game_state']
        row_match_details = data['row_match_details']
        socket.emit('receive_details',  {'match_details': data['match_details'], 'live_details': data['live_details'], 'team_details': teamDetails})
    })
});


http.listen(process.env.PORT || 3000,'0.0.0.0', function(){
    console.log('listening on *:3000');
});
