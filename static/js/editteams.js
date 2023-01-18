const url = "http://127.0.0.1:3000"; 
const input = document.getElementsByTagName('input')
const button = document.getElementById('log-in')
const switchsites = document.getElementById('switch-sides')

const add_map_point_1 = document.getElementById('add-map-point-1')
const add_map_point_2 = document.getElementById('add-map-point-2')
const remove_map_point_1 = document.getElementById('remove-map-point-1')
const remove_map_point_2 = document.getElementById('remove-map-point-2')

const form = document.querySelector('form')
var thefetch;

form.onsubmit = () => {return false}
switchsites.onclick = async() => {
  await fetch(url + `/api/v1/switch_sides`, {
  method: "POST",
  headers: {
  'Content-Type': 'application/json'
    // 'Content-Type': 'application/x-www-form-urlencoded',
  },
}).then(fetch => { thefetch = fetch.status})
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
button.onclick = async() =>{
  console.log(input)
    console.log(`
    You Submit:
    Team NR1 ShortName: ${input[0].value}
    Team NR2 ShortName: ${input[1].value}
    Team NR1 Name: ${input[2].value}
    Team NR2 Name: ${input[3].value}
    Team NR1 Logo: ${input[4].value}
    Team NR2 Logo: ${input[5].value}
`)
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
  },
  {
    'bestof':'one'
  }
]
/* Team NR1 ShortName: ${input[0].value}
    Team NR1 Name: ${input[1].value}
    Team NR2 ShortName: ${input[3].value}
    Team NR2 Name: ${input[4].value}
    Team NR1 Logo: ${input[2].value}
    Team NR2 Logo: ${input[5].value} */
jsonload[0].short_name = input[0].value; 
jsonload[0].full_name = input[2].value; 
jsonload[0].logo = input[4].value; 
jsonload[1].short_name = input[1].value; 
jsonload[1].full_name = input[3].value; 
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
if(input[6].checked){
  jsonload[2].bestof = "one"
}else if(input[7].checked){
  jsonload[2].bestof = "three"
}else if(input[8].checked){
  jsonload[2].bestof = "five"
}
  await fetch(url + `/api/v1/post_team_details`, {
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

add_map_point_1.onclick = async() => {
  var jsonload = {
    action: "add",
    team: "1"
  }
  await fetch(url + `/api/v1/map_point`, {
  method: "POST",
  headers: {
  'Content-Type': 'application/json'
    // 'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: JSON.stringify(jsonload)
}).then(fetch => { thefetch = fetch.status})
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

add_map_point_2.onclick = async() => {
  var jsonload = {
    action: "add",
    team: "2"
  }
  await fetch(url + `/api/v1/map_point`, {
  method: "POST",
  headers: {
  'Content-Type': 'application/json'
    // 'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: JSON.stringify(jsonload)
}).then(fetch => { thefetch = fetch.status})
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

remove_map_point_1.onclick = async() => {
  var jsonload = {
    action: "remove",
    team: "1"
  }
  await fetch(url + `/api/v1/map_point`, {
  method: "POST",
  headers: {
  'Content-Type': 'application/json'
    // 'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: JSON.stringify(jsonload)
}).then(fetch => { thefetch = fetch.status})
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

remove_map_point_2.onclick = async() => {
  var jsonload = {
    action: "remove",
    team: "2"
  }
  await fetch(url + `/api/v1/map_point`, {
  method: "POST",
  headers: {
  'Content-Type': 'application/json'
    // 'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: JSON.stringify(jsonload)
}).then(fetch => { thefetch = fetch.status})
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
