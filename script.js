let data;

fetch('data.json')
  .then(res => res.json())
  .then(json => {
    data = json;

    // Spočítat zápasy a góly pro hráče a gólmany
    data.matches.forEach(match => {
      // Hráči domácího týmu
      match.playersHome.forEach(num => {
        if (num !== null) {
          let player = data.teams[0].players.find(p => p.number === num);
          if (player) player.matches += 1;
        }
      });

      // Gólmani domácího týmu
      data.teams[0].players.filter(p => p.position === 'G').forEach(gk => {
        gk.matches += 1;
        gk.goalsAgainst += match.awayGoals;
      });
    });

    renderTeams();
    renderMatches();
    renderScorers();
    renderGoalies();
  });

function renderTeams() {
  const container = document.getElementById('team-list');
  container.innerHTML = '';
  data.teams.forEach(team => {
    const div = document.createElement('div');
    div.innerHTML = `<h3>${team.name}</h3>`;
    const ul = document.createElement('ul');
    team.players.forEach(p => {
      ul.innerHTML += `<li>${p.name} (#${p.number || 'G'}) - Góly: ${p.goals}, Zápasy: ${p.matches}</li>`;
    });
    div.appendChild(ul);
    container.appendChild(div);
  });
}

function renderMatches() {
  const container = document.getElementById('matches');
  container.innerHTML = '<h3>Zápasy</h3>';
  const table = document.createElement('table');
  table.innerHTML = `<tr>
    <th>Datum</th>
    <th>Domácí</th>
    <th>Góly</th>
    <th>Hosté</th>
    <th>Góly</th>
  </tr>`;

  data.matches.forEach(match => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${match.date}</td>
                     <td>${match.home}</td>
                     <td>${match.homeGoals}</td>
                     <td>${match.away}</td>
                     <td>${match.awayGoals}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

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

  let players = [];
  data.teams.forEach(team => {
    team.players.forEach(p => {
      if (p.position !== 'G') players.push({ team: team.name, ...p });
    });
  });

  players.sort((a,b) => b.goals - a.goals);

  players.forEach((p,index) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${index+1}</td>
                     <td>${p.name}</td>
                     <td>${p.team}</td>
                     <td>${p.matches}</td>
                     <td>${p.goals}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}

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

  let goalies = [];
  data.teams.forEach(team => {
    team.players.forEach(p => {
      if (p.position === 'G') goalies.push({ team: team.name, ...p });
    });
  });

  goalies.sort((a,b) => (a.goalsAgainst/a.matches) - (b.goalsAgainst/b.matches));

  goalies.forEach((g,index) => {
    const avg = g.matches ? (g.goalsAgainst/g.matches).toFixed(2) : 0;
    const row = document.createElement('tr');
    row.innerHTML = `<td>${index+1}</td>
                     <td>${g.name}</td>
                     <td>${g.team}</td>
                     <td>${g.matches}</td>
                     <td>${g.goalsAgainst}</td>
                     <td>${avg}</td>`;
    table.appendChild(row);
  });

  container.appendChild(table);
}
