// === Doberská florbalová liga ===
// Hlavní script: načítá data.json a vykresluje taby

let data = null;

// === Načtení dat ===
fetch('data.json')
  .then(res => {
    if (!res.ok) throw new Error('Soubor data.json nenalezen');
    return res.json();
  })
  .then(json => {
    data = json;
    setupTabs();
    renderAll();
  })
  .catch(err => {
    console.error('Chyba při načítání data.json:', err);
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<div style="background:#fee;color:#900;padding:10px;text-align:center;">Chyba načtení data.json – zkontroluj soubor.</div>'
    );
  });

// === Záložky ===
function setupTabs() {
  const buttons = document.querySelectorAll('.tab-button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => (c.style.display = 'none'));
      btn.classList.add('active');
      const id = btn.dataset.tab;
      const el = document.getElementById(id);
      if (el) el.style.display = 'block';
    });
  });
  // zobraz první tab
  const first = document.querySelector('.tab-button.active');
  if (first) document.getElementById(first.dataset.tab).style.display = 'block';
}

// === Vykreslení všeho ===
function renderAll() {
  renderTable();
  renderResults();
  renderSchedule();
  renderRosters();
  renderScorers();
  renderGoalies();
}

// === Tabulka týmů ===
function renderTable() {
  const el = document.getElementById('tab-tabulka');
  if (!data || !el) return;
  el.innerHTML = '<h2>Tabulka</h2>';

  const stats = {};
  data.teams.forEach(t => {
    stats[t.name] = { played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, points: 0 };
  });

  data.matches.forEach(m => {
    if (!m.played) return;
    const home = m.home, away = m.away;
    const hg = Number(m.homeGoals), ag = Number(m.awayGoals);
    stats[home].played++; stats[away].played++;
    stats[home].gf += hg; stats[away].gf += ag;
    stats[home].ga += ag; stats[away].ga += hg;

    if (hg > ag) { stats[home].win++; stats[home].points += 3; stats[away].loss++; }
    else if (hg < ag) { stats[away].win++; stats[away].points += 3; stats[home].loss++; }
    else { stats[home].draw++; stats[away].draw++; stats[home].points++; stats[away].points++; }
  });

  const arr = Object.entries(stats).map(([name, s]) => ({
    name, ...s, diff: s.gf - s.ga
  })).sort((a, b) => b.points - a.points || b.diff - a.diff || b.gf - a.gf);

  let html = '<table><thead><tr><th>Poř.</th><th>Tým</th><th>Zápasy</th><th>V</th><th>R</th><th>P</th><th>Body</th><th>Skóre</th></tr></thead><tbody>';
  arr.forEach((t, i) => {
    html += `<tr><td>${i + 1}</td><td>${t.name}</td><td>${t.played}</td><td>${t.win}</td><td>${t.draw}</td><td>${t.loss}</td><td>${t.points}</td><td>${t.gf}:${t.ga}</td></tr>`;
  });
  html += '</tbody></table>';
  el.innerHTML += html;
}

// === Výsledky ===
function renderResults() {
  const el = document.getElementById('tab-vysledky');
  if (!data || !el) return;
  el.innerHTML = '<h2>Výsledky</h2>';

  const played = data.matches.filter(m => m.played).sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!played.length) return el.insertAdjacentHTML('beforeend', '<p>Žádné odehrané zápasy</p>');

  let html = '<table><thead><tr><th>Datum</th><th>Domácí</th><th>Výsledek</th><th>Hosté</th></tr></thead><tbody>';
  played.forEach(m => {
    html += `<tr><td>${m.date}</td><td>${m.home}</td><td>${m.homeGoals}:${m.awayGoals}</td><td>${m.away}</td></tr>`;
  });
  html += '</tbody></table>';
  el.innerHTML += html;
}

// === Rozpis ===
function renderSchedule() {
  const el = document.getElementById('tab-rozpis');
  if (!data || !el) return;
  el.innerHTML = '<h2>Rozpis</h2>';

  const upcoming = data.matches.filter(m => !m.played).sort((a, b) => new Date(a.date) - new Date(b.date));
  if (!upcoming.length) return el.insertAdjacentHTML('beforeend', '<p>Žádné plánované zápasy</p>');

  let html = '<table><thead><tr><th>Datum</th><th>Domácí</th><th>Hosté</th></tr></thead><tbody>';
  upcoming.forEach(m => {
    html += `<tr><td>${m.date}</td><td>${m.home}</td><td>${m.away}</td></tr>`;
  });
  html += '</tbody></table>';
  el.innerHTML += html;
}

// === Soupisky ===
function renderRosters() {
  const el = document.getElementById('tab-soupisky');
  if (!data || !el) return;
  el.innerHTML = '<h2>Soupisky</h2>';

  data.teams.forEach(team => {
    let html = `<h3>${team.name}</h3><table><thead><tr><th>Číslo</th><th>Jméno</th><th>Pozice</th><th>Zápasy</th><th>${team.name === 'G' ? 'Obdržené' : 'Góly'}</th></tr></thead><tbody>`;
    team.players.forEach(p => {
      const matches = p.matches || 0;
      const goals = p.goals || 0;
      const goalsAgainst = p.goalsAgainst || 0;
      html += `<tr><td>${p.number ?? ''}</td><td>${p.name}</td><td>${p.position || ''}</td><td>${matches}</td><td>${p.position === 'G' ? goalsAgainst : goals}</td></tr>`;
    });
    html += '</tbody></table>';
    el.insertAdjacentHTML('beforeend', html);
  });
}

// === Střelci ===
function renderScorers() {
  const el = document.getElementById('tab-strelci');
  if (!data || !el) return;
  el.innerHTML = '<h2>Střelci</h2>';

  const list = [];
  data.teams.forEach(team => {
    team.players.forEach(p => {
      if (p.position !== 'G' && (p.matches || 0) > 0) {
        list.push({
          name: p.name,
          team: team.name,
          matches: p.matches || 0,
          goals: p.goals || 0
        });
      }
    });
  });

  list.sort((a, b) => b.goals - a.goals);

  if (!list.length) return el.insertAdjacentHTML('beforeend', '<p>Zatím žádní střelci</p>');

  let html = '<table><thead><tr><th>Poř.</th><th>Jméno</th><th>Tým</th><th>Zápasy</th><th>Góly</th></tr></thead><tbody>';
  list.forEach((p, i) => {
    html += `<tr><td>${i + 1}</td><td>${p.name}</td><td>${p.team}</td><td>${p.matches}</td><td>${p.goals}</td></tr>`;
  });
  html += '</tbody></table>';
  el.innerHTML += html;
}

// === Gólmani ===
function renderGoalies() {
  const el = document.getElementById('tab-golmani');
  if (!data || !el) return;
  el.innerHTML = '<h2>Statistika gólmanů</h2>';

  const list = [];
  data.teams.forEach(team => {
    team.players.forEach(p => {
      if (p.position === 'G' && (p.matches || 0) > 0) {
        const avg = p.matches ? (p.goalsAgainst || 0) / p.matches : 0;
        list.push({
          name: p.name,
          team: team.name,
          matches: p.matches,
          goalsAgainst: p.goalsAgainst || 0,
          avg
        });
      }
    });
  });

  list.sort((a, b) => a.avg - b.avg);

  if (!list.length) return el.insertAdjacentHTML('beforeend', '<p>Zatím žádní gólmani</p>');

  let html = '<table><thead><tr><th>Poř.</th><th>Jméno</th><th>Tým</th><th>Zápasy</th><th>Obdržené</th><th>Průměr</th></tr></thead><tbody>';
  list.forEach((g, i) => {
    html += `<tr><td>${i + 1}</td><td>${g.name}</td><td>${g.team}</td><td>${g.matches}</td><td>${g.goalsAgainst}</td><td>${g.avg.toFixed(2)}</td></tr>`;
  });
  html += '</tbody></table>';
  el.innerHTML += html;
}


