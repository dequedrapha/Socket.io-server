const input = document.getElementsByTagName('input')
const button = document.getElementById('log-in')
const form = document.querySelector('form')
var thefetch;
form.onsubmit = () => {return false}
button.onclick = async() =>{
    console.log(`
    You Submit:
    Team NR1 ShortName: ${input[0].value}
    Team NR1 Name: ${input[1].value}
    Team NR2 ShortName: ${input[3].value}
    Team NR2 Name: ${input[4].value}
    Team NR1 Logo: ${input[2].value}
    Team NR2 Logo: ${input[5].value}
`)
let jsonload = {
    "id": 1,
    "map": "ascent",
    "spike_status": false,
    "teams": [
      {
        "id": 0,
        "full_name": "Team 0",
        "short_name": "BTTV",
        "logo": "bttv.png",
        "players": [
          {
            "id": 0,
            "real_name": "Player 0",
            "display_name": "LPB",
            "country": "Germany",
            "portrait": "filename",
            "agent": "jett",
            "hp": 97,
            "ultimate_up": false
          },
          {
            "id": 1,
            "real_name": "Player 1",
            "display_name": "MeisterTisch",
            "country": "Germany",
            "portrait": "filename",
            "agent": "sage",
            "hp": 97,
            "ultimate_up": false
          },
          {
            "id": 2,
            "real_name": "Player 2",
            "display_name": "GrosserKurosch",
            "country": "Germany",
            "portrait": "filename",
            "agent": "omen",
            "hp": 97,
            "ultimate_up": false
          },
          {
            "id": 3,
            "real_name": "Player 3",
            "display_name": "Cloudykun",
            "country": "Germany",
            "portrait": "filename",
            "agent": "raze",
            "hp": 58,
            "ultimate_up": false
          },
          {
            "id": 4,
            "real_name": "Player 4",
            "display_name": "Wzrd Founder",
            "country": "Germany",
            "portrait": "filename",
            "agent": "viper",
            "hp": 39,
            "ultimate_up": false
          }
        ],
        "game_score": 12,
        "map_score": 0
      },
      {
        "id": 1,
        "full_name": "Team 1",
        "short_name": "SEN",
        "logo": "sen.png",
        "players": [
          {
            "id": 0,
            "real_name": "Player 0",
            "display_name": "TenZ",
            "country": "Germany",
            "portrait": "filename",
            "agent": "reyna",
            "hp": 100,
            "ultimate_up": false
          },
          {
            "id": 1,
            "real_name": "Player 1",
            "display_name": "ShahZam",
            "country": "Germany",
            "portrait": "filename",
            "agent": "jett",
            "hp": 99,
            "ultimate_up": false
          },
          {
            "id": 2,
            "real_name": "Player 2",
            "display_name": "Sick",
            "country": "Germany",
            "portrait": "filename",
            "agent": "viper",
            "hp": 99,
            "ultimate_up": false
          },
          {
            "id": 3,
            "real_name": "Player 3",
            "display_name": "Blue",
            "country": "Germany",
            "portrait": "filename",
            "agent": "yoru",
            "hp": 97,
            "ultimate_up": false
          },
          {
            "id": 4,
            "real_name": "Player 4",
            "display_name": "Player 4",
            "country": "Germany",
            "portrait": "filename",
            "agent": "phoenix",
            "hp": 100,
            "ultimate_up": false
          }
        ],
        "game_score": 1,
        "map_score": 0
      }
    ]
  }
jsonload = [
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
/* Team NR1 ShortName: ${input[0].value}
    Team NR1 Name: ${input[1].value}
    Team NR2 ShortName: ${input[3].value}
    Team NR2 Name: ${input[4].value}
    Team NR1 Logo: ${input[2].value}
    Team NR2 Logo: ${input[5].value} */
jsonload[0].short_name = input[0].value; 
jsonload[0].full_name = input[1].value; 
jsonload[0].logo = input[2].value; 
jsonload[1].short_name = input[3].value; 
jsonload[1].full_name = input[4].value; 
jsonload[1].logo = input[5].value;
if(input[0].value == ''|| input[1].value == '' || input[3].value == '' || input[4].value == ''){
  var y = document.getElementById("teamName");
    // Add the "show" class to DIV
    y.innerText = "Please fill out every input field!"
    y.style.color = 'rgb(255, 56, 56)'
    y.style.opacity = '100%'
    y.style.textAlign = "center"
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ y.style.opacity = '0%'; }, 3200);
    return;
} 
if(jsonload[0].logo == ''){
  jsonload[0].logo = 'default.png'
}
if(jsonload[1].logo == ''){
  jsonload[1].logo = 'default.png'
}
  await fetch(`http://127.0.0.1:4445/api/v1/post_team_details`, {
  method: "POST",
  headers: {
  'Content-Type': 'application/json'
    // 'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: JSON.stringify(jsonload)}).then(fetch => { thefetch = fetch.status})
  if(thefetch == 200){
    var y = document.getElementById("teamName");
    // Add the "show" class to DIV
    y.innerText = "Data was sended successfully to the API server and will been updated there!"
    y.style.textAlign = "center"
    y.style.color = 'rgb(87, 228, 74)'
    y.style.opacity = '100%'
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ y.style.opacity = '0%'; }, 3500);
    return;
  }else{
    var y = document.getElementById("teamName");
    // Add the "show" class to DIV
    y.innerText = "An error endcountern"
    y.style.color = 'rgb(255, 56, 56)'
    y.style.opacity = '100%'
    y.style.textAlign = "center"
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ y.style.opacity = '0%'; }, 3200);
    return;
  }
}