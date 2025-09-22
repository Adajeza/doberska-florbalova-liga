let data;

// Načtení JSONu
fetch('data.json')
  .then(response => response.json())
  .then(json => {
    data = json;
    calculateStats();
    renderTabs();
  })
  .catch(err => console.error("Chyba při načítání JSON:", err));

// Funkce pro výpočet statistik hráčů a gólmanů
function calculateStats() {
  if (!data.matches) return;

  data.teams.forEach(team => {
    team.players.forEach(player => {
      player.matches = 0;
      if (player.position === 'G') player.goalsAgainst = 0;
      player.goals = player.goals || 0;
    });
  });

  data.matches.forEach(match => {
    if (!match.played) return;

    const homeTeam = data.teams.find(t => t.name === match.home);
    const awayTeam = data.teams.find(t => t.name === match.away);

    // Zvyš zápasy a góly hráčům - pro demo prostě náhodně
    homeTeam.players.forEach(p => { p.matches += 1; });
    awayTeam.players.forEach(p => { p.matches += 1; });

    // Gólmani – obdržené góly
    const homeGoalie = homeTeam.players.find(p => p.position === 'G');
    const awayGoalie = awayTeam.players.find(p => p.position === 'G');
    if (homeGoalie) homeGoalie.goalsAgainst += match.awayGoals;
    if (awayGoalie) awayGoalie.goalsAgainst += match.homeGoals;
  });
}

// Funkce pro vykreslení všech záložek
function renderTabs() {
  renderTable();
  renderMatches();
  renderFutureMatches();
  renderTeamRoster();
  renderScorers();
  renderGoalies();
}

// Tabulka týmů
function renderTable() {
  const container = document.getElementById('team-list');
  container.innerHTML = '<h3>Tabulka týmů</h3>';
  const table = document.createElement('table');
  table.innerHTML = `<tr>
    <th>Pořadí</th>
    <th>Název týmu</th>
    <th>Zápasy</th>
    <th>Výhra</th>
    <th>Výhra po nájezdech</th>
    <th>Remíza</th>
    <th>Prohra po nájezdech</th>
    <th>Prohra</th>
    <th>Body</th>
    <th>Skóre</th>
  </tr>`;

  // Dočasné výpočty skóre – můžeš upravit podle skutečných dat
  data.teams.forEach((team, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${index+1}</td>
                     <td>${team.name}</td>
                     <td>0</td>
                     <td>0</td>
                     <td>0</td>
                     <td>0</td>
                     <td>0</td>
                     <td>0</td>
                     <td>0</td>
                     <td>0:0</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

// Záložka Výsledky
function renderMatches() {
  const container = document.getElementById('matches');
  if(!container) return;
  container.innerHTML = '<h3>Výsledky</h3>';
  const table = document.createElement('table');
  table.innerHTML = `<tr>
    <th>Datum</th>
    <th>Domácí tým</th>
    <th>Výsledek</th>
    <th>Hostující tým</th>
  </tr>`;

  const playedMatches = data.matches.filter(m => m.played).sort((a,b) => new Date(b.date)-new Date(a.date));
  playedMatches.forEach(m => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${m.date}</td>
                     <td>${m.home}</td>
                     <td>${m.homeGoals}:${m.awayGoals}</td>
                     <td>${m.away}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

// Záložka Rozpis
function renderFutureMatches() {
  const container = document.getElementById('future-matches');
  if(!container) return;
  container.innerHTML = '<h3>Rozpis</h3>';
  const table = document.createElement('table');
  table.innerHTML = `<tr>
    <th>Datum</th>
    <th>Domácí tým</th>
    <th>Hostující tým</th>
  </tr>`;

  const futureMatches = data.matches.filter(m => !m.played).sort((a,b) => new Date(a.date)-new Date(b.date));
  futureMatches.forEach(m => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${m.date}</td>
                     <td>${m.home}</td>
                     <td>${m.away}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

// Soupisky týmů
function renderTeamRoster() {
  const container = document.getElementById('team-list');
  if(!container) return;

  data.teams.forEach(team => {
    const teamDiv = document.createElement('div');
    teamDiv.innerHTML = `<h4>${team.name}</h4>`;
    const table = document.createElement('table');
    table.innerHTML = `<tr>
      <th>Číslo</th>
      <th>Příjmení a jméno</th>
      <th>Pozice</th>
      <th>Zápasy</th>
      <th>Góly</th>
      <th>Obr. góly / průměr</th>
    </tr>`;

    team.players.forEach(p => {
      const avg = (p.position==='G' && p.matches>0) ? (p.goalsAgainst/p.matches).toFixed(2) : '';
      const goals = p.position==='G' ? '' : p.goals;
      const goalsAgainst = p.position==='G' ? p.goalsAgainst : '';
      const row = document.createElement('tr');
      row.innerHTML = `<td>${p.number||''}</td>
                       <td>${p.name}</td>
                       <td>${p.position}</td>
                       <td>${p.matches}</td>
                       <td>${goals}</td>
                       <td>${goalsAgainst} ${avg}</td>`;
      table.appendChild(row);
    });

    teamDiv.appendChild(table);
    container.appendChild(teamDiv);
  });
}

// Střelci
function renderScorers() {
  const container = document.getElementById('kanadskebodovani');
  if(!container) return;
  container.innerHTML = '<h3>Střelci</h3>';
  const table = document.createElement('table');
  table.innerHTML = `<tr>
    <th>Pořadí</th>
    <th>Jméno</th>
    <th>Tým</th>
    <th>Zápasy</th>
    <th>Góly</th>
  </tr>`;

  let players = [];
  data.teams.forEach(team => {
    team.players.forEach(p => {
      if(p.position !== 'G') players.push({...p, team: team.name});
    });
  });

  players.sort((a,b) => b.goals - a.goals);

  players.forEach((p,i) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${i+1}</td>
                     <td>${p.name}</td>
                     <td>${p.team}</td>
                     <td>${p.matches}</td>
                     <td>${p.goals}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

// Gólmani
function renderGoalies() {
  const container = document.getElementById('goalies');
  if(!container) return;
  container.innerHTML = '<h3>Statistika gólmanů</h3>';
  const table = document.createElement('table');
  table.innerHTML = `<tr>
    <th>Pořadí</th>
    <th>Jméno</th>
    <th>Tým</th>
    <th>Zápasy</th>
    <th>Obdržené góly</th>
    <th>Průměr gólů na zápas</th>
  </tr>`;

  let goalies = [];
  data.teams.forEach(team => {
    team.players.forEach(p => {
      if(p.position==='G') goalies.push({...p, team: team.name});
    });
  });

  goalies.sort((a,b) => (a.matches? a.goalsAgainst/a.matches : 0) - (b.matches? b.goalsAgainst/b.matches :0));

  goalies.forEach((g,i) => {
    const avg = g.matches ? (g.goalsAgainst/g.matches).toFixed(2) : '';
    const row = document.createElement('tr');
    row.innerHTML = `<td>${i+1}</td>
                     <td>${g.name}</td>
                     <td>${g.team}</td>
                     <td>${g.matches}</td>
                     <td>${g.goalsAgainst}</td>
                     <td>${avg}</td>`;
    table.appendChild(row);
  });

  container.append
