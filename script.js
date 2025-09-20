// Vestavěná záloha (pokud fetch selže) — stejná struktura jako data.json
const embeddedData = {
  teams: [
    {
      name: "Homolkovi vepři",
      players: [
        { number: 13, name: "Adam Ježek", position: "P", goals: 2, matches: 2 },
        { number: 6, name: "Milan Šulc", position: "P", goals: 1, matches: 2 },
        { number: null, name: "Veronika Šmídová", position: "G", goals: 0, matches: 2, goalsAgainst: 7 }
      ]
    },
    {
      name: "Skalka",
      players: [
        { number: 13, name: "Dominik Umlauf", position: "P", goals: 0, matches: 2 },
        { number: null, name: "Josef Pohl", position: "G", goals: 0, matches: 2, goalsAgainst: 9 }
      ]
    }
  ],
  matches: []
};

let data = null;

// Try to fetch external data.json; if fails, use embeddedData
fetch('data.json')
  .then(res => {
    if (!res.ok) throw new Error('data.json not found or not accessible');
    return res.json();
  })
  .then(json => { data = json; init(); })
  .catch(err => {
    console.warn("Nepodařilo se načíst data.json — použití vestavěných dat. Chyba:", err);
    data = embeddedData;
    init();
  });

// ---------- UI: tabs ----------
function init() {
  setupTabs();
  renderAll();
}

function setupTabs() {
  const buttons = document.querySelectorAll('.tab-button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      const el = document.getElementById(tab);
      if (el) el.style.display = 'block';
    });
  });
  // show default
  document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
  const first = document.querySelector('.tab-button.active');
  if (first) {
    const el = document.getElementById(first.dataset.tab);
    if (el) el.style.display = 'block';
  }
}

// ---------- rendering ----------
function renderAll() {
  renderTeamsTable();
  renderResults();
  renderSchedule();
  renderRosters();
  renderScorers();
  renderGoalies();
}

// Utility: parse date safe
function parseDate(d) {
  return d ? new Date(d) : null;
}

/* ---------- Standings (Tabulka) ---------- */
/* Rules:
   - If match has numeric homeGoals & awayGoals => played
   - If match contains shootoutWinner:"home"/"away": winner gets 2, loser 1
   - If tie without shootoutWinner => both 1
   - Regular win => 3, loss => 0
*/
function renderTeamsTable() {
  const container = document.getElementById('tab-teams');
  // prepare stats
  const stats = {};
  data.teams.forEach(t => {
    stats[t.name] = { Z:0, V:0, Vn:0, R:0, Pn:0, P:0, Body:0, scored:0, conceded:0 };
  });

  data.matches.forEach(m => {
    const home = m.home, away = m.away;
    const homeGoals = (m.homeGoals === null || m.homeGoals === undefined) ? null : Number(m.homeGoals);
    const awayGoals = (m.awayGoals === null || m.awayGoals === undefined) ? null : Number(m.awayGoals);
    const played = homeGoals !== null && awayGoals !== null;

    if (!played) return;

    stats[home].Z++; stats[away].Z++;
    stats[home].scored += homeGoals; stats[home].conceded += awayGoals;
    stats[away].scored += awayGoals; stats[away].conceded += homeGoals;

    // shootout logic
    if (m.shootoutWinner) {
      const winner = m.shootoutWinner === 'home' ? home : away;
      const loser = winner === home ? away : home;
      stats[winner].Vn++; stats[winner].Body += 2;
      stats[loser].Pn++; stats[loser].Body += 1;
    } else {
      if (homeGoals > awayGoals) {
        stats[home].V++; stats[home].Body += 3;
        stats[away].P++;
      } else if (homeGoals < awayGoals) {
        stats[away].V++; stats[away].Body += 3;
        stats[home].P++;
      } else {
        // draw
        stats[home].R++; stats[away].R++;
        stats[home].Body += 1; stats[away].Body += 1;
      }
    }
  });

  // build array and sort (points desc, then goal diff desc, then scored)
  const tableArr = Object.keys(stats).map(name => {
    const s = stats[name];
    return { team: name, ...s, diff: s.scored - s.conceded || 0 };
  });
  tableArr.sort((a,b) => b.Body - a.Body || b.diff - a.diff || b.scored - a.scored);

  // render HTML
  let html = `<h3>Tabulka</h3><table>
    <thead><tr>
      <th>Pořadí</th><th>Tým</th><th>Z</th><th>V</th><th>Vn</th><th>R</th><th>Pn</th><th>P</th><th>Body</th><th>Skóre</th>
    </tr></thead><tbody>`;
  tableArr.forEach((r,i) => {
    html += `<tr>
      <td>${i+1}</td><td>${r.team}</td><td>${r.Z}</td><td>${r.V}</td><td>${r.Vn}</td><td>${r.R}</td><td>${r.Pn}</td><td>${r.P}</td><td>${r.Body}</td><td>${r.scored}:${r.conceded}</td>
    </tr>`;
  });
  html += `</tbody></table>`;
  container.innerHTML = html;
}

/* ---------- Results (played matches) ---------- */
function renderResults() {
  const container = document.getElementById('tab-results');
  let played = data.matches.filter(m => m.homeGoals !== null && m.awayGoals !== null);
  played.sort((a,b) => parseDate(b.date) - parseDate(a.date));
  let html = `<h3>Výsledky</h3><table><thead><tr><th>Datum</th><th>Domácí</th><th>Výsledek</th><th>Hosté</th></tr></thead><tbody>`;
  played.forEach(m => {
    const resultStr = (m.homeGoals !== null && m.awayGoals !== null) ? `${m.homeGoals}:${m.awayGoals}` : '';
    const so = m.shootoutWinner ? ' (SN)' : '';
    html += `<tr><td>${m.date}</td><td>${m.home}</td><td>${resultStr}${so}</td><td>${m.away}</td></tr>`;
  });
  html += `</tbody></table>`;
  container.innerHTML = html;
}

/* ---------- Schedule (future matches) ---------- */
function renderSchedule() {
  const container = document.getElementById('tab-schedule');
  let future = data.matches.filter(m => m.homeGoals === null || m.awayGoals === null);
  future.sort((a,b) => parseDate(a.date) - parseDate(b.date));
  let html = `<h3>Rozpis (budoucí zápasy)</h3><table><thead><tr><th>Datum</th><th>Domácí</th><th>Hosté</th></tr></thead><tbody>`;
  if (future.length === 0) {
    html += `<tr><td colspan="3" class="small">Žádné naplánované zápasy</td></tr>`;
  } else {
    future.forEach(m => {
      html += `<tr><td>${m.date}</td><td>${m.home}</td><td>${m.away}</td></tr>`;
    });
  }
  html += `</tbody></table>`;
  container.innerHTML = html;
}

/* ---------- Rosters (soupisky) ---------- */
function renderRosters() {
  const buttonsDiv = document.getElementById('team-buttons');
  const rosterDiv = document.getElementById('team-roster');
  buttonsDiv.innerHTML = '';
  rosterDiv.innerHTML = '';

  let active = data.teams[0] ? data.teams[0].name : '';

  data.teams.forEach((team, idx) => {
    const btn = document.createElement('button');
    btn.textContent = team.name;
    btn.className = idx === 0 ? 'active' : '';
    btn.addEventListener('click', () => {
      active = team.name;
      document.querySelectorAll('.team-buttons button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showRoster(active);
    });
    buttonsDiv.appendChild(btn);
  });

  function showRoster(teamName) {
    const team = data.teams.find(t => t.name === teamName);
    if (!team) { rosterDiv.innerHTML = '<p class="small">Tým nenalezen</p>'; return; }

    // players
    const players = team.players.filter(p => p.position !== 'G');
    const goalies = team.players.filter(p => p.position === 'G');

    let html = `<h4>${team.name}</h4><table><thead><tr><th>Číslo</th><th>Příjmení a jméno</th><th>Pozice</th><th>Zápasy</th><th>Góly</th></tr></thead><tbody>`;
    players.forEach(p => {
      html += `<tr><td>${p.number||''}</td><td>${p.name}</td><td>${p.position}</td><td>${p.matches||0}</td><td>${p.goals||0}</td></tr>`;
    });
    html += `</tbody></table>`;

    // goalies (separátně)
    if (goalies.length > 0) {
      html += `<h5 style="margin-top:12px">Brankáři</h5><table><thead><tr><th>Jméno</th><th>Zápasy</th><th>Obdržené góly</th><th>Průměr</th></tr></thead><tbody>`;
      goalies.forEach(g => {
        const avg = g.matches ? (g.goalsAgainst / g.matches).toFixed(2) : '-';
        html += `<tr><td class="gk">${g.name}</td><td>${g.matches||0}</td><td>${g.goalsAgainst||0}</td><td>${avg}</td></tr>`;
      });
      html += `</tbody></table>`;
    }

    rosterDiv.innerHTML = html;
  }

  // show first team
  if (data.teams.length) showRoster(active);
}

/* ---------- Scorers (Střelci) ---------- */
function renderScorers() {
  const container = document.getElementById('tab-scorers');
  let players = [];
  data.teams.forEach(team => {
    team.players.forEach(p => {
      if (p.position !== 'G') players.push({ name: p.name, team: team.name, goals: p.goals||0, matches: p.matches||0 });
    });
  });
  players.sort((a,b) => b.goals - a.goals || b.matches - a.matches);
  let html = `<h3>Střelci</h3><table><thead><tr><th>Pořadí</th><th>Jméno</th><th>Tým</th><th>Zápasy</th><th>Góly</th></tr></thead><tbody>`;
  players.forEach((p,i) => {
    html += `<tr><td>${i+1}</td><td>${p.name}</td><td>${p.team}</td><td>${p.matches}</td><td>${p.goals}</td></tr>`;
  });
  html += `</tbody></table>`;
  container.innerHTML = html;
}

/* ---------- Goalies ---------- */
function renderGoalies() {
  const container = document.getElementById('tab-goalies');
  let goalies = [];
  data.teams.forEach(team => {
    team.players.forEach(p => {
      if (p.position === 'G') goalies.push({ name: p.name, team: team.name, matches: p.matches||0, goalsAgainst: p.goalsAgainst||0 });
    });
  });
  goalies.sort((a,b) => (a.goalsAgainst / (a.matches||1)) - (b.goalsAgainst / (b.matches||1)));
  let html = `<h3>Statistika gólmanů</h3><table><thead><tr><th>Pořadí</th><th>Jméno</th><th>Tým</th><th>Zápasy</th><th>Obdržené góly</th><th>Průměr</th></tr></thead><tbody>`;
  goalies.forEach((g,i) => {
    const avg = g.matches ? (g.goalsAgainst/g.matches).toFixed(2) : '-';
    html += `<tr><td>${i+1}</td><td class="gk">${g.name}</td><td>${g.team}</td><td>${g.matches}</td><td>${g.goalsAgainst}</td><td>${avg}</td></tr>`;
  });
  html += `</tbody></table>`;
  container.innerHTML = html;
}
