let data;

fetch('data.json')
  .then(response => response.json())
  .then(json => {
    data = json;
    renderStandings();
    renderResults();
    renderSchedule();
    renderRosters();
    renderScorers();
    renderGoalies();
  });

// ------------------ TABULKA ------------------
function renderStandings() {
  const container = document.getElementById('tabulka');
  container.innerHTML = '<h2>Tabulka</h2>';
  const table = document.createElement('table');
  table.innerHTML = `<tr>
    <th>Pořadí</th>
    <th>Název týmu</th>
    <th>Zápasy</th>
    <th>Výhry</th>
    <th>Výhry SN</th>
    <th>Remízy</th>
    <th>Prohry SN</th>
    <th>Prohry</th>
    <th>Body</th>
    <th>Skóre</th>
  </tr>`;

  let standings = data.teams.map(team => {
    let matches = data.matches.filter(
      m => m.home === team.name || m.away === team.name
    );
    let played = matches.filter(m => m.played);
    let wins = 0, winsSO = 0, draws = 0, lossesSO = 0, losses = 0, goalsFor = 0, goalsAgainst = 0, points = 0;

    played.forEach(m => {
      let isHome = m.home === team.name;
      let gf = isHome ? m.homeGoals : m.awayGoals;
      let ga = isHome ? m.awayGoals : m.homeGoals;
      goalsFor += gf;
      goalsAgainst += ga;

      if (gf > ga && !m.shootout) { wins++; points += 3; }
      else if (gf > ga && m.shootout) { winsSO++; points += 2; }
      else if (gf === ga) { draws++; points += 1; }
      else if (gf < ga && m.shootout) { lossesSO++; points += 1; }
      else { losses++; }
    });

    return {
      name: team.name,
      matches: played.length,
      wins, winsSO, draws, lossesSO, losses, points,
      score: `${goalsFor}:${goalsAgainst}`
    };
  });

  standings.sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));

  standings.forEach((t, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${index + 1}</td>
                     <td>${t.name}</td>
                     <td>${t.matches}</td>
                     <td>${t.wins}</td>
                     <td>${t.winsSO}</td>
                     <td>${t.draws}</td>
                     <td>${t.lossesSO}</td>
                     <td>${t.losses}</td>
                     <td>${t.points}</td>
                     <td>${t.score}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

// ------------------ VÝSLEDKY ------------------
function renderResults() {
  const container = document.getElementById('vysledky');
  container.innerHTML = '<h2>Výsledky</h2>';
  const table = document.createElement('table');
  table.innerHTML = `<tr><th>Datum</th><th>Domácí tým</th><th>Výsledek</th><th>Hostující tým</th></tr>`;

  let results = data.matches.filter(m => m.played);
  results.sort((a, b) => new Date(b.date) - new Date(a.date));

  results.forEach(m => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${m.date}</td>
                     <td>${m.home}</td>
                     <td>${m.homeGoals}:${m.awayGoals}</td>
                     <td>${m.away}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

// ------------------ ROZPIS ------------------
function renderSchedule() {
  const container = document.getElementById('rozpis');
  container.innerHTML = '<h2>Rozpis</h2>';
  const table = document.createElement('table');
  table.innerHTML = `<tr><th>Datum</th><th>Domácí tým</th><th>Hostující tým</th></tr>`;

  let schedule = data.matches.filter(m => !m.played);
  schedule.sort((a, b) => new Date(a.date) - new Date(b.date));

  schedule.forEach(m => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${m.date}</td>
                     <td>${m.home}</td>
                     <td>${m.away}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

// ------------------ SOUPISKY ------------------
function renderRosters() {
  const container = document.getElementById('soupisky');
  container.innerHTML = '<h2>Soupisky</h2>';

  data.teams.forEach(team => {
    const teamDiv = document.createElement('div');
    teamDiv.innerHTML = `<h3>${team.name}</h3>`;

    const table = document.createElement('table');
    table.innerHTML = `<tr>
      <th>Číslo</th>
      <th>Jméno</th>
      <th>Pozice</th>
      <th>Zápasy</th>
      <th>${team.players.some(p => p.position === "G") ? "Statistika" : "Góly"}</th>
    </tr>`;

    team.players.forEach(p => {
      let statCol = "";
      if (p.position === "G") {
        let avg = p.matches ? (p.goalsAgainst / p.matches).toFixed(2) : "0.00";
        statCol = `Obdržené góly: ${p.goalsAgainst || 0}, Průměr: ${avg}`;
      } else {
        statCol = p.goals;
      }
      const row = document.createElement('tr');
      row.innerHTML = `<td>${p.number || "-"}</td>
                       <td>${p.name}</td>
                       <td>${p.position}</td>
                       <td>${p.matches || 0}</td>
                       <td>${statCol}</td>`;
      table.appendChild(row);
    });

    teamDiv.appendChild(table);
    container.appendChild(teamDiv);
  });
}

// ------------------ STŘELCI ------------------
function renderScorers() {
  const container = document.getElementById('strelci');
  container.innerHTML = '<h2>Střelci</h2>';
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
      if (p.position !== 'G') {
        players.push({ team: team.name, ...p });
      }
    });
  });

  players.sort((a, b) => b.goals - a.goals);

  players.forEach((p, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${index + 1}</td>
                     <td>${p.name}</td>
                     <td>${p.team}</td>
                     <td>${p.matches || 0}</td>
                     <td>${p.goals}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

// ------------------ GÓLMANI ------------------
function renderGoalies() {
  const container = document.getElementById('goalies');
  container.innerHTML = '<h2>Statistika gólmanů</h2>';
  const table = document.createElement('table');
  table.innerHTML = `<tr>
    <th>Pořadí</th>
    <th>Jméno</th>
    <th>Tým</th>
    <th>Zápasy</th>
    <th>Obdržené góly</th>
    <th>Průměr na zápas</th>
  </tr>`;

  let goalies = [];
  data.teams.forEach(team => {
    team.players.forEach(p => {
      if (p.position === 'G') {
        goalies.push({ team: team.name, ...p });
      }
    });
  });

  goalies.sort((a, b) => {
    let avgA = a.matches ? a.goalsAgainst / a.matches : Infinity;
    let avgB = b.matches ? b.goalsAgainst / b.matches : Infinity;
    return avgA - avgB;
  });

  goalies.forEach((g, index) => {
    const avg = g.matches ? (g.goalsAgainst / g.matches).toFixed(2) : "0.00";
    const row = document.createElement('tr');
    row.innerHTML = `<td>${index + 1}</td>
                     <td>${g.name}</td>
                     <td>${g.team}</td>
                     <td>${g.matches || 0}</td>
                     <td>${g.goalsAgainst || 0}</td>
                     <td>${avg}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}
