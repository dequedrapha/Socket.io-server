process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
var express = require('express')
var app = express();
var http = require('http').Server(app);
const https = require("https");
var io = require('socket.io')(http,{
    cors: {
      origin: '*',
    }
});
var cors = require("cors")
var axios = require('axios')
const fs = require("fs");
const WebSocket = require('ws');
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

//VALORANT INGAME API
if(!fs.existsSync(`${process.env.LOCALAPPDATA}\\Riot Games\\Riot Client\\Config\\lockfile`)){ 
    console.log("Bitte öffne VALORANT")
    process.exit(0)
}
var wsdata = fetchLogin()
const ws = new WebSocket(`wss://riot:${wsdata.pw}@127.0.0.1:${wsdata.port}/`, "wamp");
const settings = JSON.parse(fs.readFileSync("./settings.json", {encoding: "utf-8"}))

setInterval(async () => {
    tokens = await data()
}, 3000000) //50min (token expires after 60min)

var data = async function () {
    if(fs.existsSync(`${process.env.LOCALAPPDATA}\\Riot Games\\Riot Client\\Config\\lockfile`)) {
        var lockfileContents = fs.readFileSync(`${process.env.LOCALAPPDATA}\\Riot Games\\Riot Client\\Config\\lockfile`, 'utf8');
        var matches = lockfileContents.match(/(.*):(.*):(.*):(.*):(.*)/);
        var port = matches[3]
        var pw = matches[4]
        return await axios.get(`https://127.0.0.1:${port}/entitlements/v1/token`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`riot:${pw}`, 'utf8').toString('base64')}`,
                "user-agent": "ShooterGame/21 Windows/10.0.19042.1.768.64bit",
                "X-Riot-ClientVersion": "release-02.03-shipping-8-521855",
                "Content-Type": "application/json",
                "rchat-blocking": "true"
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            })
        })
    } else {
        throw "VALORANT nicht offen"
    }
}

function fetchLogin() {
    var lockfileContents = fs.readFileSync(`${process.env.LOCALAPPDATA}\\Riot Games\\Riot Client\\Config\\lockfile`, 'utf8');
    var matches = lockfileContents.match(/(.*):(.*):(.*):(.*):(.*)/);
    var port = matches[3]
    var pw = matches[4]
    return {port: port, pw: pw}
}

const errors = {
    404: {status: "404", message: "Not in expected state"},
    503: {status: "503", message: "Source Server is not reachable"},
    429: {status: "429", message: "Source Server Rate Limit, try again later"},
}

function errorhandler(status, res) {
    if(errors[status] != undefined) return res.code(status).type("application/json").send(errors[status])
    return res.code(500).type("application/json").send({status: "500", message: "Unknown error occured"})
}

// EXPRESS APP
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
        if(matchinfo.round_number){io.emit('round_number_update', {"round": matchinfo.round_number}); /*console.log("Round number")*/}
        if(matchinfo.score){io.emit('score_update', {"score": matchinfo.score}); console.log(`[OVERWOLF] ${matchinfo.score[0]} - ${matchinfo.score[1]}`)}
        if(matchinfo.round_phase){io.emit('round_phase_update', {"roundphase": matchinfo.round_phase}); /*console.log("Round Phase")*/}
        if(matchinfo.team){io.emit('team_side_update', {"team": matchinfo.team}); /*console.log("Team")*/}
        if(matchinfo.match_outcome){io.emit('match_outcome', {"match_outcome": matchinfo.match_outcome}); /*console.log("Match Outcome")*/}
        if(matchinfo.scoreboard_0 || matchinfo.scoreboard_1 || matchinfo.scoreboard_2 || matchinfo.scoreboard_3 || matchinfo.scoreboard_4 || matchinfo.scoreboard_5 || matchinfo.scoreboard_6 || matchinfo.scoreboard_7 || matchinfo.scoreboard_8 || matchinfo.scoreboard_9){io.emit('scoreboard_update', matchinfo); /*console.log("Scoreboard")*/}
    }
    
    res.status(200).send("successfully updated!")
})

var tokens
var cstate

app.get("/v1/core-game", async (req, res) => {
    tokens = tokens == undefined ? await data() : tokens
    var matchid = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/core-game/v1/players/${tokens.data.subject}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    if(matchid.response && matchid.response.status == 400) {
        tokens = await data()
        matchid = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/core-game/v1/players/${tokens.data.subject}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    }
    if(matchid.response) return errorhandler(matchid.response.status, res)
    var core_game_data = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/core-game/v1/matches/${matchid.data.MatchID}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    if(core_game_data.response) return errorhandler(core_game_data.response.status, res)
    res.send({data: core_game_data.data, subject: tokens.data.subject})
})

app.get("/v1/match-details", async (req, res) => {
    tokens = tokens == undefined ? await data() : tokens
    var matchid = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/core-game/v1/players/${tokens.data.subject}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    if(matchid.response && matchid.response.status == 400) {
        tokens = await data()
        matchid = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/core-game/v1/players/${tokens.data.subject}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    }
    if(matchid.response) return errorhandler(matchid.response.status, res)
    var match_details_data = await axios.get(`https://pd.${settings.region}.a.pvp.net/match-details/v1/matches/${matchid.data.MatchID}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    if(match_details_data.response) return errorhandler(match_details_data.response.status, res)
    res.send(match_details_data.data)
})

app.get("/v1/match-loadouts", async (req, res) => {
    tokens = tokens == undefined ? await data() : tokens
    var matchid = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/core-game/v1/players/${tokens.data.subject}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    if(matchid.response && matchid.response.status == 400) {
        tokens = await data()
        matchid = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/core-game/v1/players/${tokens.data.subject}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    }
    if(matchid.response) return errorhandler(matchid.response.status, res)
    var match_loadouts_data = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/core-game/v1/matches/${matchid.data.MatchID}/loadouts`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    if(match_loadouts_data.response) return errorhandler(match_loadouts_data.response.status, res)
    res.send(match_loadouts_data.data)
})

app.get("/v1/pre-game", async (req, res) => {
    tokens = tokens == undefined ? await data() : tokens
    var matchid = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/pregame/v1/players/${tokens.data.subject}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    if(matchid.response && matchid.response.status == 400) {
        tokens = await data()
        matchid = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/pregame/v1/players/${tokens.data.subject}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    }
    if(matchid.response) return errorhandler(matchid.response.status, res)
    var pre_game_data = await axios.get(`https://glz-${settings.region}-1.eu.a.pvp.net/pregame/v1/matches/${matchid.data.MatchID}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    if(pre_game_data.response) return errorhandler(pre_game_data.response.status, res)
    res.send({data: pre_game_data.data, subject: tokens.data.subject})
})

app.get("/v1/party", async (req, res) => {
    tokens = tokens == undefined ? await data() : tokens
    var matchid = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/parties/v1/players/${tokens.data.subject}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    if(matchid.response && matchid.response.status == 400) {
        tokens = await data()
        matchid = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/parties/v1/players/${tokens.data.subject}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    }
    if(matchid.response) return errorhandler(matchid.response.status, res)
    var pre_game_data = await axios.get(`https://glz-${settings.region}-1.eu.a.pvp.net/parties/v1/parties/${matchid.data.CurrentPartyID}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    if(pre_game_data.response) return errorhandler(pre_game_data.response.status, res)
    res.send({data: pre_game_data.data, subject: tokens.data.subject})
})

app.get("/v1/get-name/:id", async (req, res) => {
    var tokens = await data()
    var playerid = await axios.put(`https://pd.${settings.region}.a.pvp.net/name-service/v2/players`, [req.params.id], {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    if(playerid.response && playerid.response.status == 400) {
        tokens = await data()
        playerid = await axios.put(`https://pd.${settings.region}.a.pvp.net/name-service/v2/players`, [req.params.id], {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    }
    if(playerid.response) return errorhandler(playerid.response.status, res)
    res.send(playerid.data)
})

app.get("/v1/quit-game", async (req, res) => {
    tokens = tokens == undefined ? await data() : tokens
    var matchid = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/pregame/v1/players/${tokens.data.subject}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    if(matchid.response && matchid.response.status == 400) {
        tokens = await data()
        matchid = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/pregame/v1/players/${tokens.data.subject}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    }
    if(matchid.response) return errorhandler(matchid.response.status, res)
    var pre_game_data = await axios.post(`https://glz-${settings.region}-1.eu.a.pvp.net/pregame/v1/matches/${matchid.data.MatchID}/quit`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    if(pre_game_data.response) return errorhandler(pre_game_data.response.status, res)
    res.send({data: pre_game_data.data, subject: tokens.data.subject})
})

app.get("/v1/party/invite/:name/:tag", async (req, res) => {
    tokens = tokens == undefined ? await data() : tokens
    var matchid = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/parties/v1/players/${tokens.data.subject}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    if(matchid.response && matchid.response.status == 400) {
        tokens = await data()
        matchid = await axios.get(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/parties/v1/players/${tokens.data.subject}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    }
    if(matchid.response) return errorhandler(matchid.response.status, res)
    var pre_game_data = await axios.post(`https://glz-${settings.region}-1.${settings.region}.a.pvp.net/parties/v1/parties/${matchid.data.CurrentPartyID}/invites/name/${req.params.name}/tag/${req.params.tag}`, {headers: {Authorization: "Bearer " + tokens.data.accessToken,"X-Riot-Entitlements-JWT": tokens.data.token,"X-Riot-ClientVersion": "release-03.00-shipping-22-574489","X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"}}).catch(error => {return error})
    if(pre_game_data.response) return errorhandler(pre_game_data.response.status, res)
    res.send({data: pre_game_data.data, subject: tokens.data.subject})
})

ws.on("open", async open => {
    tokens = tokens == undefined ? await data() : tokens
    var presence = await axios.get(`https://127.0.0.1:${wsdata.port}/chat/v4/presences`, {
        headers: {
            'Authorization': `Basic ${Buffer.from(`riot:${wsdata.pw}`, 'utf8').toString('base64')}`,
            "user-agent": "ShooterGame/21 Windows/10.0.19042.1.768.64bit",
            "X-Riot-ClientVersion": "release-02.03-shipping-8-521855",
            "Content-Type": "application/json",
            "rchat-blocking": "true"
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
        })
    }).catch(error => {return error})
    //console.log(presence)
    var f = presence.data.presences.filter(item => item.puuid == tokens.data.subject)
    var d = JSON.parse(Buffer.from(f[0].private, "base64").toString("utf-8"))
    cstate = d.sessionLoopState
    ws.send('[5, \"OnJsonApiEvent\"]');
})

ws.on('message', async data => {
    var pdata = JSON.parse(data)
    if(typeof pdata[2] == "object" && pdata[2].eventType == "Update" && pdata[2].uri == "/chat/v4/presences" && pdata[2].data.presences[0].puuid == tokens.data.subject) {
        var decode = JSON.parse(Buffer.from(pdata[2].data.presences[0].private, "base64").toString("utf-8"));
        console.log(`[VAL IG API] ${decode.partyOwnerMatchScoreAllyTeam} - ${decode.partyOwnerMatchScoreEnemyTeam}`)
        io.emit('score_update', {"score": {won: decode.partyOwnerMatchScoreAllyTeam, lost: decode.partyOwnerMatchScoreEnemyTeam}});
        io.emit('after connect',  {'data': 'no'})
        if(cstate != decode.sessionLoopSate) {
            if(decode.sessionLoopState == "MENUS") {cstate = decode.sessionLoopState;console.log("State: MENUS");return io.emit("update", {state: "Menu", data: decode})}
            if(decode.sessionLoopState == "PREGAME") {cstate = decode.sessionLoopState;console.log("State: PREGAME");return io.emit("update", {state: "PreGame", data: decode})}
            if(decode.sessionLoopState == "INGAME") {cstate = decode.sessionLoopState;console.log("State: INGAME");return io.emit("update", {state: "Ingame", data: decode})}
        }
    }
});

io.on('connection', async function(socket){
    console.log("1 machine connected")
    socket.emit('after connect',  {'data': 'Woke up'})
    var presence = await axios.get(`https://127.0.0.1:${wsdata.port}/chat/v4/presences`, {
        headers: {
            'Authorization': `Basic ${Buffer.from(`riot:${wsdata.pw}`, 'utf8').toString('base64')}`,
            "user-agent": "ShooterGame/21 Windows/10.0.19042.1.768.64bit",
            "X-Riot-ClientVersion": "release-02.03-shipping-8-521855",
            "Content-Type": "application/json",
            "rchat-blocking": "true"
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
        })
    }).catch(error => {return error})
    var f = presence.data.presences.filter(item => item.puuid == tokens.data.subject)
    var d = JSON.parse(Buffer.from(Buffer.from(f[0].private, "base64").toString("utf-8")).toString("utf-8"))
    console.log(d)
    if(d.sessionLoopState == "MENUS") {io.emit("initialize", {state: "Menu", data: d});console.log("State: MENUS")}
    if(d.sessionLoopState == "PREGAME") {io.emit("initialize", {state: "PreGame", data: d});console.log("State: PREGAME")}
    if(d.sessionLoopState == "INGAME") {io.emit("initialize", {state: "Ingame", data: d});console.log("State: INGAME")}
    socket.on('recieved', function(message){
        console.log(`Recieved ${message}`);
     });
    socket.on('disconnect', () => {
        console.log('Disconnected')
    })
    
});

io.on('hello', async function(socket){
    console.log("HELLO")
})

http.listen(process.env.PORT || 3000,'0.0.0.0', function(){
    console.log('listening on *:3000');
});