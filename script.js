let data;

fetch('data.json')
  .then(response => response.json())
  .then(json => {
    data = json;

    // spočítat zápasy pro hráče a gólmany, a celkově obdržené góly
    data.matches.forEach(match => {
      // hráči domácího týmu
      match.playersHome.forEach(num => {
        let player = data.teams[0].players.find(p => p.number === num);
        if (player) player.matches += 1;
      });

      // gólman domácího týmu - počítáme obdržené góly
      let homeGoalie = data.teams[0].players.find(p => p.position === 'G');
      if (homeGoalie) {
        homeGoalie.matches += 1;
        homeGoalie.goalsAgainst = (homeGoalie.goalsAgainst || 0) + match.awayGoals;
      }

      // pokud máš více týmů, doplň analogicky pro away
    });

    renderScorers();
    renderGoalies();
  });

// Funkce pro kanadské bodování střelců
function renderScorers() {
  const container = document.getElementById('kanadskebodovani');
  container.innerHTML = '<h3>Kanadské bodování střelců</h3>';
  const table = document.createElement('table');
  table.innerHTML = `<tr>
    <th>Pořadí</th>
    <th>Jméno</th>
    <th>Tým</th>
    <th>Zápasy</th>
    <th>Góly</th>
  </tr>`;

  // získat všechny hráče (bez gólmanů)
  let players = [];
  data.teams.forEach(team => {
    team.players.forEach(p => {
      if (p.position !== 'G') {
        players.push({ team: team.name, ...p });
      }
    });
  });

  // seřadit podle počtu gólů sestupně
  players.sort((a, b) => b.goals - a.goals);

  players.forEach((p, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${index + 1}</td>
                     <td>${p.name}</td>
                     <td>${p.team}</td>
                     <td>${p.matches}</td>
                     <td>${p.goals}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

// Funkce pro statistiku gólmanů
function renderGoalies() {
  const container = document.getElementById('goalies');
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

  // získat všechny gólmany
  let goalies = [];
  data.teams.forEach(team => {
    team.players.forEach(p => {
      if (p.position === 'G') {
        goalies.push({ team: team.name, ...p });
      }
    });
  });

  // seřadit podle průměru obdržených gólů vzestupně (lepší gólman = menší průměr)
  goalies.sort((a, b) => (a.goalsAgainst / a.matches) - (b.goalsAgainst / b.matches));

  goalies.forEach((g, index) => {
    const avg = g.matches ? (g.goalsAgainst / g.matches).toFixed(2) : 0;
    const row = document.createElement('tr');
    row.innerHTML = `<td>${index + 1}</td>
                     <td>${g.name}</td>
                     <td>${g.team}</td>
                     <td>${g.matches}</td>
                     <td>${g.goalsAgainst}</td>
                     <td>${avg}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}