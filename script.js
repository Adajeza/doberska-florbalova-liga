let data;

fetch('data.json')
  .then(res => res.json())
  .then(json => {
    data = json;
    renderTable();
    renderMatches();
    renderTeams();
    renderScorers();
    renderGoalies();
  });

// TABULKA LIGY
function renderTable() {
  const container = document.getElementById('league-table');
  const table = document.createElement('table');
  table.innerHTML = `<tr>
    <th>Pořadí</th><th>Tým</th><th>Body</th><th>V</th><th>VPn</th><th>PPn</th><th>R</th><th>P</th>
  </tr>`;

  const standings = data.teams.map(team => {
    const teamMatches = data.matches.filter(m => m.home === team.name || m.away === team.name);
    let body = 0, V=0, VPn=0, PPn=0, R=0, P=0;
    teamMatches.forEach(m => {
      const isHome = m.home === team.name;
      const goalsFor = isHome ? m.homeGoals : m.awayGoals;
      const goalsAgainst = isHome ? m.awayGoals : m.homeGoals;

      if (goalsFor > goalsAgainst) { body+=3; V++; }
      else if (goalsFor === goalsAgainst) { body+=1; R++; }
      else { P++; }
    });
    return { team: team.name, body, V, VPn, PPn, R, P };
  });

  standings.sort((a,b) => b.body - a.body);

  standings.forEach((t,i)=>{
    const row = `<tr>
      <td>${i+1}</td><td>${t.team}</td><td>${t.body}</td>
      <td>${t.V}</td><td>${t.VPn}</td><td>${t.PPn}</td><td>${t.R}</td><td>${t.P}</td>
    </tr>`;
    table.innerHTML += row;
  });

  container.appendChild(table);
}

// ZÁPASY
function renderMatches() {
  const container = document.getElementById('matches');
  const table = document.createElement('table');
  table.innerHTML = `<tr><th>Domácí</th><th>Výsledek</th><th>Hosté</th></tr>`;
  data.matches.forEach(m=>{
    table.innerHTML += `<tr><td>${m.home}</td><td>${m.homeGoals}:${m.awayGoals}</td><td>${m.away}</td></tr>`;
  });
  container.appendChild(table);
}

// SOUPISKY
function renderTeams() {
  const container = document.getElementById('team-list');
  data.teams.forEach(team=>{
    const h = document.createElement('h3');
    h.textContent = team.name;
    const table = document.createElement('table');
    table.innerHTML = `<tr><th>Číslo</th><th>Jméno</th><th>Pozice</th><th>Zápasy</th><th>Góly</th></tr>`;
    team.players.forEach(p=>{
      table.innerHTML += `<tr>
        <td>${p.number ?? '-'}</td>
        <td>${p.name}</td>
        <td class="${p.position==='G'?'gk':''}">${p.position}</td>
        <td>${p.matches||0}</td>
        <td>${p.goals||0}</td>
      </tr>`;
    });
    container.appendChild(h);
    container.appendChild(table);
  });
}

// STŘELCI
function renderScorers() {
  const container = document.getElementById('scorers');
  const table = document.createElement('table');
  table.innerHTML = `<tr><th>Pořadí</th><th>Jméno</th><th>Tým</th><th>Zápasy</th><th>Góly</th></tr>`;
  let players = [];
  data.teams.forEach(t=>t.players.forEach(p=>{ if(p.position!=='G') players.push({team:t.name,...p}) }));
  players.sort((a,b)=>b.goals-a.goals);
  players.forEach((p,i)=>{
    table.innerHTML += `<tr><td>${i+1}</td><td>${p.name}</td><td>${p.team}</td><td>${p.matches}</td><td>${p.goals}</td></tr>`;
  });
  container.appendChild(table);
}

// GÓLMANI
function renderGoalies() {
  const container = document.getElementById('goalies');
  const table = document.createElement('table');
  table.innerHTML = `<tr><th>Pořadí</th><th>Jméno</th><th>Tým</th><th>Zápasy</th><th>Obdržené góly</th><th>Průměr</th></tr>`;
  let goalies = [];
  data.teams.forEach(t=>t.players.forEach(p=>{ if(p.position==='G') goalies.push({team:t.name,...p}) }));
  goalies.sort((a,b)=>(a.goalsAgainst/a.matches)-(b.goalsAgainst/b.matches));
  goalies.forEach((g,i)=>{
    const avg = g.matches? (g.goalsAgainst/g.matches).toFixed(2):'0.00';
    table.innerHTML += `<tr><td>${i+1}</td><td>${g.name}</td><td>${g.team}</td><td>${g.matches}</td><td>${g.goalsAgainst}</td><td>${avg}</td></tr>`;
  });
  container.appendChild(table);
}
