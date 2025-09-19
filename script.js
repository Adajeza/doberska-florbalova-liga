let data;

fetch('data.json')
  .then(response => response.json())
  .then(json => {
    data = json;

    // spočítat zápasy pro každého hráče
    data.matches.forEach(match => {
      match.playersHome.forEach(num => {
        let player = data.teams[0].players.find(p => p.number === num);
        if (player) player.matches += 1;
      });
      // Pokud máš více týmů, může se doplnit analogicky pro away
    });

    renderTeams();
    renderStats();
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

function renderStats() {
  const container = document.getElementById('kanadskebodovani');
  container.innerHTML = '<h3>Kanadské bodování</h3>';
  const table = document.createElement('table');
  table.innerHTML = `<tr><th>Tým</th><th>Hráč</th><th>Góly</th><th>Zápasy</th></tr>`;
  
  data.teams.forEach(team => {
    team.players.forEach(p => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${team.name}</td><td>${p.name}</td><td>${p.goals}</td><td>${p.matches}</td>`;
      table.appendChild(row);
    });
  });

  container.appendChild(table);
}
