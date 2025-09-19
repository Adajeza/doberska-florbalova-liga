let data;

fetch('data.json')
  .then(response => response.json())
  .then(json => {
    data = json;
    renderTeams();
    renderResults();
    renderSchedule();
    renderRosters();
    renderScorers();
    renderGoalies();
  })
  .catch(err => console.error("Chyba při načítání JSON:", err));

// Záložky
document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).style.display = 'block';
  });
});
document.getElementById('tab-teams').style.display = 'block'; // default

// Funkce pro tabulku týmů
function renderTeams() {
  const container = document.getElementById('tab-teams');
  let table = `<h3>Tabulka týmů</h3><table>
    <tr>
      <th>Pořadí</th><th>Tým</th><th>Zápasy</th><th>Výhra</th><th>Výhra po nájezdech</th>
      <th>Remíza</th><th>Prohra po nájezdech</th><th>Prohra</th><th>Body</th><th>Skóre</th>
    </tr>`;
  data.teams.forEach((team, i) => {
    table += `<tr>
      <td>${i+1}</td>
      <td>${team.name}</td>
      <td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0:0</td>
    </tr>`;
  });
  table += `</table>`;
  container.innerHTML = table;
}

// Funkce pro výsledky
function renderResults() {
  const container = document.getElementById('tab-results');
  let table = `<h3>Výsledky</h3><table>
    <tr><th>Datum</th><th>Domácí</th><th>Výsledek</th><th>Hosté</th></tr>`;
  let sorted = data.matches.slice().sort((a,b) => new Date(b.date) - new Date(a.date));
  sorted.forEach(m => {
    table += `<tr><td>${m.date}</td><td>${m.home}</td><td>${m.result}</td><td>${m.away}</td></tr>`;
  });
  table += `</table>`;
  container.innerHTML = table;
}

// Funkce pro rozpis (budoucí zápasy)
function renderSchedule() {
  const container = document.getElementById('tab-schedule');
  let table = `<h3>Rozpis</h3><table>
    <tr><th>Datum</th><th>Domácí</th><th>Hosté</th></tr>`;
  // aktuálně žádné budoucí zápasy, necháme prázdné
  table += `</table>`;
  container.innerHTML = table;
}

// Funkce pro soupisky
function renderRosters() {
  const container = document.getElementById('tab-rosters');
  container.innerHTML = '<h3>Soupisky týmů</h3>';
  data.teams.forEach(team => {
    let div = document.createElement('div');
    div.innerHTML = `<h4>${team.name}</h4><table>
      <tr><th>Číslo</th><th>Jméno</th><th>Pozice</th><th>Zápasy</th><th>Góly</th><th>Obr. góly</th><th>Průměr</th></tr>`;
    team.players.forEach(p => {
      const avg = p.position==='G' && p.matches ? (p.goalsAgainst/p.matches).toFixed(2) : '';
      div.innerHTML += `<tr>
        <td>${p.number||''}</td>
        <td>${p.name}</td>
        <td>${p.position}</td>
        <td>${p.matches}</td>
        <td>${p.goals}</td>
        <td>${p.goalsAgainst||''}</td>
        <td>${avg}</td>
      </tr>`;
    });
    div.innerHTML += '</table>';
    container.appendChild(div);
  });
}

// Funkce pro střelce
function renderScorers() {
  const container = document.getElementById('tab-scorers');
  container.innerHTML = '<h3>Střelci</h3>';
  let table = `<table>
    <tr><th>Pořadí</th><th>Jméno</th><th>Tým</th><th>Zápasy</th><th>Góly</th></tr>`;
  let players = [];
  data.teams.forEach(team => team.players.forEach(p => { if(p.position!=='G') players.push({...p, team: team.name}); }));
  players.sort((a,b)=>b.goals-a.goals);
  players.forEach((p,i)=>{table += `<tr><td>${i+1}</td><td>${p.name}</td><td>${p.team}</td><td>${p.matches}</td><td>${p.goals}</td></tr>`;});
  table += `</table>`;
  container.innerHTML += table;
}

// Funkce pro gólmany
function renderGoalies() {
  const container = document.getElementById('tab-goalies');
  container.innerHTML = '<h3>Statistika gólmanů</h3>';
  let table = `<table>
    <tr><th>Pořadí</th><th>Jméno</th><th>Tým</th><th>Zápasy</th><th>Obdržené góly</th><th>Průměr na zápas</th></tr>`;
  let goalies = [];
  data.teams.forEach(team=>team.players.forEach(p=>{if(p.position==='G') goalies.push({...p, team:team.name});}));
  goalies.sort((a,b)=>(a.goalsAgainst/a.matches)-(b.goalsAgainst/b.matches));
  goalies.forEach((g,i)=>{
    const avg = g.matches ? (g.goalsAgainst/g.matches).toFixed(2) : '';
    table += `<tr><td>${i+1}</td><td>${g.name}</td><td>${g.team}</td><td>${g.matches}</td><td>${g.goalsAgainst}</td><td>${avg}</td></tr>`;
  });
  table += `</table>`;
  container.innerHTML += table;
}