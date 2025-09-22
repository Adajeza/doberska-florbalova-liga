let data;

fetch('data.json')
  .then(response => response.json())
  .then(json => {
    data = json;

    renderTable();
    renderResults();
    renderSchedule();
    renderRosters();
    renderScorers();
    renderGoalies();
  })
  .catch(err => {
    console.error("Chyba při načítání dat:", err);
  });

// ====== TABULKA ======
function renderTable() {
  const container = document.getElementById('tabulka');
  container.innerHTML = '<h2>Tabulka</h2>';

  let standings = data.teams.map(team => {
    let stats = {
      name: team.name,
      played: 0, win: 0, otWin: 0, draw: 0, otLoss: 0, loss: 0,
      points: 0, goalsFor: 0, goalsAgainst: 0
    };

    data.matches.forEach(match => {
      if (!match.played) return;

      if (match.home === team.name || match.away === team.name) {
        let isHome = match.home === team.name;
        let gf = isHome ? match.homeGoals : match.awayGoals;
        let ga = isHome ? match.awayGoals : match.homeGoals;
        stats.played++;
        stats.goalsFor += gf;
        stats.goalsAgainst += ga;

        if (gf > ga) {
          stats.win++; stats.points += 3;
        } else if (gf < ga) {
          stats.loss++;
        } else {
          stats.draw++; stats.points += 1;
        }
      }
    });

    return stats;
  });

  standings.sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));

  const table = document.createElement('table');
  table.innerHTML = `<tr>
    <th>Pořadí</th><th>Název týmu</th><th>Zápasy</th><th>V</th><th>VpN</th><th>R</th><th>PpN</th><th>P</th><th>Body</th><th>Skóre</th>
  </tr>`;

  standings.forEach((t, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${i + 1}</td>
                     <td>${t.name}</td>
                     <td>${t.played}</td>
                     <td>${t.win}</td>
                     <td>${t.otWin}</td>
                     <td>${t.draw}</td>
                     <td>${t.otLoss}</td>
                     <td>${t.loss}</td>
                     <td>${t.points}</td>
                     <td>${t.goalsFor}:${t.goalsAgainst}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

// ====== VÝSLEDKY ======
function renderResults() {
  const container = document.getElementById('vysledky');
  container.innerHTML = '<h2>Výsledky</h2>';

  let matches = data.matches.filter(m => m.played).sort((a, b) => new Date(b.date) - new Date(a.date));

  const table = document.createElement('table');
  table.innerHTML = `<tr><th>Datum</th><th>Domácí</th><th>Výsledek</th><th>Hosté</th></tr>`;

  matches.forEach(m => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${m.date}</td>
                     <td>${m.home}</td>
                     <td>${m.homeGoals}:${m.awayGoals}</td>
                     <td>${m.away}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

// ====== ROZPIS ======
function renderSchedule() {
  const container = document.getElementById('rozpis');
  container.innerHTML = '<h2>Rozpis</h2>';

  let matches = data.matches.filter(m => !m.played).sort((a, b) => new Date(a.date) - new Date(b.date));

  const table = document.createElement('table');
  table.innerHTML = `<tr><th>Datum</th><th>Domácí</th><th>Hosté</th></tr>`;

  matches.forEach(m => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${m.date}</td>
                     <td>${m.home}</td>
                     <td>${m.away}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

// ====== SOUPISKY ======
function renderRosters() {
  const container = document.getElementById('soupisky');
  container.innerHTML = '<h2>Soupisky</h2>';

  data.teams.forEach(team => {
    const section = document.createElement('div');
    section.innerHTML = `<h3>${team.name}</h3>`;

    const table = document.createElement('table');
    table.innerHTML = `<tr><th>Číslo</th><th>Jméno</th><th>Pozice</th><th>Zápasy</th><th>${team.players.some(p => p.position === 'G') ? 'Góly / Obdržené góly' : 'Góly'}</th></tr>`;

    team.players.forEach(p => {
      let stats = calculatePlayerStats(p, team.name);
      const row = document.createElement('tr');
      if (p.position === 'G') {
        row.innerHTML = `<td>${p.number || '-'}</td>
                         <td>${p.name}</td>
                         <td>${p.position}</td>
                         <td>${stats.matches}</td>
                         <td>${stats.goalsAgainst}</td>`;
      } else {
        row.innerHTML = `<td>${p.number}</td>
                         <td>${p.name}</td>
                         <td>${p.position}</td>
                         <td>${stats.matches}</td>
                         <td>${stats.goals}</td>`;
      }
      table.appendChild(row);
    });

    section.appendChild(table);
    container.appendChild(section);
  });
}

// ====== STŘELCI ======
function renderScorers() {
  const container = document.getElementById('strelci');
  container.innerHTML = '<h2>Střelci</h2>';

  let players = [];
  data.teams.forEach(team => {
    team.players.forEach(p => {
      if (p.position !== 'G') {
        let stats = calculatePlayerStats(p, team.name);
        players.push({ team: team.name, name: p.name, goals: stats.goals, matches: stats.matches });
      }
    });
  });

  players.sort((a, b) => b.goals - a.goals);

  const table = document.createElement('table');
  table.innerHTML = `<tr><th>Pořadí</th><th>Jméno</th><th>Tým</th><th>Zápasy</th><th>Góly</th></tr>`;

  players.forEach((p, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${i + 1}</td>
                     <td>${p.name}</td>
                     <td>${p.team}</td>
                     <td>${p.matches}</td>
                     <td>${p.goals}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

// ====== GÓLMANI ======
function renderGoalies() {
  const container = document.getElementById('goalies');
  container.innerHTML = '<h2>Statistika gólmanů</h2>';

  let goalies = [];
  data.teams.forEach(team => {
    team.players.forEach(p => {
      if (p.position === 'G') {
        let stats = calculatePlayerStats(p, team.name);
        goalies.push({ team: team.name, name: p.name, matches: stats.matches, goalsAgainst: stats.goalsAgainst });
      }
    });
  });

  goalies.sort((a, b) => (a.goalsAgainst / (a.matches || 1)) - (b.goalsAgainst / (b.matches || 1)));

  const table = document.createElement('table');
  table.innerHTML = `<tr><th>Pořadí</th><th>Jméno</th><th>Tým</th><th>Zápasy</th><th>Obdržené góly</th><th>Průměr</th></tr>`;

  goalies.forEach((g, i) => {
    const avg = g.matches ? (g.goalsAgainst / g.matches).toFixed(2) : 0;
    const row = document.createElement('tr');
    row.innerHTML = `<td>${i + 1}</td>
                     <td>${g.name}</td>
                     <td>${g.team}</td>
                     <td>${g.matches}</td>
                     <td>${g.goalsAgainst}</td>
                     <td>${avg}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

// ====== Pomocná funkce ======
function calculatePlayerStats(player, teamName) {
  let matches = 0, goals = 0, goalsAgainst = 0;

  data.matches.forEach(match => {
    if (!match.played) return;

    if (match.home === teamName || match.away === teamName) {
      let isHome = match.home === teamName;

      if (player.position === 'G') {
        matches++;
        goalsAgainst += isHome ? match.awayGoals : match.homeGoals;
      } else {
        if ((isHome && match.playersHome.includes(player.number)) ||
            (!isHome && match.playersAway.includes(player.number))) {
          matches++;
          goals += (match.goalscorers || []).filter(gs => gs === player.number).length;
        }
      }
    }
  });

  return { matches, goals, goalsAgainst };
}

