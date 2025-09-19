// DATA
const teams = [
  { name: "Homolkovi vepři", players: [
      {number:13,name:"Adam Ježek",position:"P",goals:2,matches:1},
      {number:6,name:"Milan Šulc",position:"P",goals:1,matches:1},
      {number:null,name:"Veronika Šmídová",position:"G",goals:0,matches:1,goalsAgainst:3}
  ]},
  { name:"Skalka", players:[
      {number:13,name:"Dominik Umlauf",position:"P",goals:0,matches:1},
      {number:null,name:"Josef Pohl",position:"G",goals:0,matches:1,goalsAgainst:5}
  ]},
  { name:"Hroši", players:[
      {number:7,name:"Daniel Šmída",position:"P",goals:1,matches:1},
      {number:11,name:"Adam Šmída",position:"P",goals:0,matches:1}
  ]}
];

const matches = [
  {date:"2025-09-18",home:"Homolkovi vepři",result:"5:3",away:"Skalka"},
  {date:"2025-09-12",home:"Skalka",result:"2:4",away:"Homolkovi vepři"}
];

// TABS
function openTab(evt, tabName) {
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let i=0;i<tabcontent.length;i++) tabcontent[i].style.display="none";
  const tablinks = document.getElementsByClassName("tablink");
  for (let i=0;i<tablinks.length;i++) tablinks[i].className=tablinks[i].className.replace(" active","");
  document.getElementById(tabName).style.display="block";
  evt.currentTarget.className+=" active";
}
document.getElementById("defaultOpen").click();

// RENDER FUNCTIONS
function renderTable() {
  const container = document.getElementById("tabulka");
  let html = `<table><tr><th>Pořadí</th><th>Tým</th><th>Z</th><th>V</th><th>V SN</th><th>R</th><th>P SN</th><th>P</th><th>Body</th><th>Skóre</th></tr>`;
  teams.forEach((t,i)=>{
    html+=`<tr><td>${i+1}</td><td>${t.name}</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0:0</td></tr>`;
  });
  html+="</table>";
  container.innerHTML = html;
}

function renderMatches() {
  const vysledky = document.getElementById("vysledky");
  let html = `<table><tr><th>Datum</th><th>Domácí</th><th>Výsledek</th><th>Hosté</th></tr>`;
  matches.sort((a,b)=>new Date(b.date)-new Date(a.date));
  matches.forEach(m=>{
    html+=`<tr><td>${m.date}</td><td>${m.home}</td><td>${m.result}</td><td>${m.away}</td></tr>`;
  });
  html+="</table>";
  vysledky.innerHTML = html;

  const rozpis = document.getElementById("rozpis");
  let html2 = `<table><tr><th>Datum</th><th>Domácí</th><th>Hosté</th></tr>`;
  matches.sort((a,b)=>new Date(a.date)-new Date(b.date));
  matches.forEach(m=>{
    html2+=`<tr><td>${m.date}</td><td>${m.home}</td><td>${m.away}</td></tr>`;
  });
  html2+="</table>";
  rozpis.innerHTML = html2;
}

function renderSoupisky() {
  const buttonsDiv = document.getElementById("team-buttons");
  const rosterDiv = document.getElementById("team-roster");
  buttonsDiv.innerHTML="";
  let activeTeam = teams[0].name;
  teams.forEach(t=>{
    const btn = document.createElement("button");
    btn.textContent = t.name;
    btn.onclick = ()=>{ activeTeam=t.name; showRoster(); };
    buttonsDiv.appendChild(btn);
  });
  function showRoster() {
    const team = teams.find(x=>x.name===activeTeam);
    let html=`<table><tr><th>#</th><th>Jméno</th><th>Pozice</th><th>Zápasy</th><th>Góly/Obdržené</th></tr>`;
    team.players.forEach(p=>{
      html+=`<tr><td>${p.number||""}</td><td>${p.name}</td><td>${p.position}</td><td>${p.matches}</td><td>${p.position==="G"?p.goalsAgainst||0:p.goals}</td></tr>`;
    });
    html+="</table>";
    rosterDiv.innerHTML = html;
  }
  showRoster();
}

function renderStrelci() {
  const container = document.getElementById("streleci");
  let html=`<table><tr><th>Pořadí</th><th>Jméno</th><th>Tým</th><th>Zápasy</th><th>Góly</th></tr>`;
  let players = [];
  teams.forEach(t=>t.players.forEach(p=>{ if(p.position!=="G") players.push({...p,team:t.name}); }));
  players.sort((a,b)=>b.goals-a.goals);
  players.forEach((p,i)=>{
    html+=`<tr><td>${i+1}</td><td>${p.name}</td><td>${p.team}</td><td>${p.matches}</td><td>${p.goals}</td></tr>`;
  });
  html+="</table>";
  container.innerHTML = html;
}

function renderBrankari() {
  const container = document.getElementById("brankari");
  let html=`<table><tr><th>Pořadí</th><th>Jméno</th><th>Tým</th><th>Zápasy</th><th>Obdržené góly</th><th>Průměr</th></tr>`;
  let goalies=[];
  teams.forEach(t=>t.players.forEach(p=>{if(p.position==="G") goalies.push({...p,team:t.name});}));
  goalies.sort((a,b)=>(a.goalsAgainst/a.matches)-(b.goalsAgainst/b.matches));
  goalies.forEach((g,i)=>{
    let avg = g.matches ? (g.goalsAgainst/g.matches).toFixed(2) : 0;
    html+=`<tr><td>${i+1}</td><td>${g.name}</td><td>${g.team}</td><td>${g.matches}</td><td>${g.goalsAgainst}</td
