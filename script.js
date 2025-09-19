let data;

fetch('data.json')
  .then(response => response.json())
  .then(json => {
    data = json;
    renderTeams();
    renderGoalStats();
  });

function showSection(id) {
  document.querySelectorAll('main section').forEach(sec => sec.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

function renderTeams() {
  const container = document.getElementById('teamLists');
  container.innerHTML = '';

  data.teams.forEach(team => {
    let html = `<h3>${team.name}</h3><table><tr><th>#</th><th>Jméno</th><th>Pozice</th><th>Zápasy</th><th>Góly</th>`;
    html += `<th>Obr. góly</th></tr>`;
    team.players.forEach(p => {
      html += `<tr>
        <td>${p.number !== null ? p.number : '-'}</td>
        <td>${p.name}</td>
        <td class="${p.position === 'G' ? 'gk' : ''}">${p.position === 'G' ? '🥅 Brankář' : 'Hráč'}</td>
        <td>${p.matches}</td>
        <td>${p.goals}</td>
        <td>${p.position === 'G' ? p.goalsAgainst : '-'}</td>
      </tr>`;
    });
    html += '</table>';
    container.innerHTML += html;
  });
}

function renderGoalStats() {
  const container = document.getElementById('goalStats');
  container.innerHTML = '';

  data.teams.forEach(team => {
    let html = `<h3>${team.name}</h3><table><tr><th>Jméno</th><th>Góly</th></tr>`;
    team.players.forEach(p => {
      if (p.position !== 'G') {
        html += `<tr><td>${p.name}</td><td>${p.goals}</td></tr>`;
      }
    });
    html += '</table>';
    container.innerHTML += html;
  });
}
