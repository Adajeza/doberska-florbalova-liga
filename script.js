// hlavní script: načte data.json a vykreslí vše
let data = null;

// fetch data.json; pokud selže, vypíše chybu do konzole
fetch('data.json')
  .then(res => {
    if (!res.ok) throw new Error('data.json nenalezen nebo není přístupný (404)');
    return res.json();
  })
  .then(json => {
    data = json;
    setupTabs();
    renderAll();
  })
  .catch(err => {
    console.error('Chyba při načítání data.json:', err);
    document.body.insertAdjacentHTML('afterbegin', '<div style="background:#fee; color:#900; padding:10px; text-align:center;">Chyba načtení data.json — zkontroluj soubor v repozitáři. (Konzole má více detailů)</div>');
  });

// ---- UI: záložky ----
function setupTabs(){
  const buttons = document.querySelectorAll('.tab-button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
      btn.classList.add('active');
      const id = btn.dataset.tab;
      const el = document.getElementById(id);
      if (el) el.style.display = 'block';
    });
  });
  // zobrazit první
  document.querySelectorAll('.tab-content').forEach(s=>s.style.display='none');
  const first = document.querySelector('.tab-button.active');
  if (first) {
    const el = document.getElementById(first.dataset.tab);
    if (el) el.style.display = 'block';
  }
}

// ---- Všechny render funkce ----
function renderAll(){
  renderTable();
  renderResults();
  renderSchedule();
  renderRosters();
  renderScorers();
  renderGoalies();
}

// --- TABULKA ---
function renderTable(){
  const el = document.getElementById('tab-tabulka');
  if (!data || !el) return;
  el.innerHTML = '<h2>Tabulka</h2>';

  // init stats
  const stats = {};
  data.teams.forEach(t => {
    stats[t.name] = { played:0, win:0, otWin:0, draw:0, otLoss:0, loss:0, points:0, gf:0, ga:0 };
  });

  data.matches.forEach(m => {
    if (!m.played) return;
    const home = m.home, away = m.away;
    const hg = Number(m.homeGoals), ag = Number(m.awayGoals);
    if (!(home in stats) || !(away in stats)) return;

    stats[home].played++; stats[away].played++;
    stats[home].gf += hg; stats[home].ga += ag;
    stats[away].gf += ag; stats[away].ga += hg;

    // jednoduchý systém: výhra 3, remíza 1, prohra 0; SN not used here
    if (hg > ag) { stats[home].win++; stats[home].points += 3; stats[away].loss++; }
    else if (hg < ag) { stats[away].win++; stats[away].points += 3; stats[home].loss++; }
    else { stats[home].draw++; stats[away].draw++; stats[home].points +=1; stats[away].points +=1; }
  });

  const arr = Object.keys(stats).map(name => {
    const s = stats[name];
    return { name, ...s, diff: s.gf - s.ga };
  });

  arr.sort((a,b) => b.points - a.points || b.diff - a.diff || b.gf - a.gf);

  let html = '<table><thead><tr><th>Poř.</th><th>Tým</th><th>Zápasy</th><th>V</th><th>VpN</th><th>R</th><th>PpN</th><th>P</th><th>Body</th><th>Skóre</th></tr></thead><tbody>';
  arr.forEach((r,i) => {
    html += `<tr><td>${i+1}</td><td>${r.name}</td><td>${r.played}</td><td>${r.win}</td><td>${r.otWin}</td><td>${r.draw}</td><td>${r.otLoss}</td><td>${r.loss}</td><td>${r.points}</td><td>${r.gf}:${r.ga}</td></tr>`;
  });
  html += '</tbody></table>';
  el.insertAdjacentHTML('beforeend', html);
}

// --- VÝSLEDKY (odehrané) ---
function renderResults(){
  const el = document.getElementById('tab-vysledky');
  if (!data || !el) return;
  el.innerHTML = '<h2>Výsledky</h2>';

  const played = data.matches.filter(m => m.played).sort((a,b) => new Date(b.date) - new Date(a.date));
  if (!played.length) el.insertAdjacentHTML('beforeend','<p class="small">Žádné odehrané zápasy</p>');

  let html = '<table><thead><tr><th>Datum</th><th>Domácí</th><th>Výsledek</th><th>Hosté</th></tr></thead><tbody>';
  played.forEach(m => {
    html += `<tr><td>${m.date}</td><td>${m.home}</td><td>${m.homeGoals}:${m.awayGoals}</td><td>${m.away}</td></tr>`;
  });
  html += '</tbody></table>';
  el.insertAdjacentHTML('beforeend', html);
}

// --- ROZPIS (neodehrané) ---
function renderSchedule(){
  const el = document.getElementById('tab-rozpis');
  if (!data || !el) return;
  el.innerHTML = '<h2>Rozpis</h2>';

  const future = data.matches.filter(m => !m.played).sort((a,b) => new Date(a.date) - new Date(b.date));
  if (!future.length) el.insertAdjacentHTML('beforeend','<p class="small">Žádné naplánované zápasy</p>');

  let html = '<table><thead><tr><th>Datum</th><th>Domácí</th><th>Hosté</th></tr></thead><tbody>';
  future.forEach(m => html += `<tr><td>${m.date}</td><td>${m.home}</td><td>${m.away}</td></tr>`);
  html += '</tbody></table>';
  el.insertAdjacentHTML('beforeend', html);
}

// --- SOUPISKY ---
function renderRosters(){
  const el = document.getElementById('tab-soupisky');
  if (!data || !el) return;
  el.innerHTML = '<h2>Soupisky</h2>';

  data.teams.forEach(team => {
    let section = `<div><h3>${team.name}</h3>`;
    section += '<table><thead><tr><th>Číslo</th><th>Příjmení a jméno</th><th>Pozice</th><th>Zápasy</th><th>Góly / Obdržené</th></tr></thead><tbody>';
    team.players.forEach(p => {
      const isG = p.position && p.position.toUpperCase() === 'G';
      const num = p.number === null ? '' : p.number;
      const matches = ('matches' in p) ? p.matches : 0;
      const goals = ('goals' in p) ? p.goals : 0;
      const ga = ('goalsAgainst' in p) ? p.goalsAgainst : 0;
      section += `<tr><td>${num}</td><td>${p.name}</td><td class="${isG? 'gk':''}">${p.position || ''}</td><td>${matches}</td><td>${isG? ga : goals}</td></tr>`;
    });
    section += '</tbody></table></div>';
    el.insertAdjacentHTML('beforeend', section);
  });
}

// --- STŘELCI ---
function renderScorers(){
  const el = document.getElementById('tab-strelci');
  if (!data || !el) return;
  el.innerHTML = '<h2>Střelci</h2>';

  const list = [];
  data.teams.forEach(team => {
    team.players.forEach(p => {
      if (!p.position || p.position.toUpperCase() === 'G') return;
      // spočítat ze zápasů
      const stats = calculatePlayerStats(p, team.name);
      list.push({ name: p.name, team: team.name, goals: stats.goals, matches: stats.matches });
    });
  });

  list.sort((a,b) => b.goals - a.goals || b.matches - a.matches);

  let html = '<table><thead><tr><th>Poř.</th><th>Jméno</th><th>Tým</th><th>Zápasy</th><th>Góly</th></tr></thead><tbody>';
  list.forEach((p,i) => html += `<tr><td>${i+1}</td><td>${p.name}</td><td>${p.team}</td><td>${p.matches}</td><td>${p.goals}</td></tr>`);
  html += '</tbody></table>';
  el.insertAdjacentHTML('beforeend', html);
}

// --- GÓLMANI ---
function renderGoalies(){
  const el = document.getElementById('tab-golmani');
  if (!data || !el) return;
  el.innerHTML = '<h2>Statistika gólmanů</h2>';

  const list = [];
  data.teams.forEach(team => {
    team.players.forEach(p => {
      if (!p.position || p.position.toUpperCase() !== 'G') return;
      const s = calculatePlayerStats(p, team.name);
      list.push({ name: p.name, team: team.name, matches: s.matches, goalsAgainst: s.goalsAgainst, avg: s.matches? (s.goalsAgainst/s.matches) : 0 });
    });
  });

  list.sort((a,b) => a.avg - b.avg);

  let html = '<table><thead><tr><th>Poř.</th><th>Jméno</th><th>Tým</th><th>Zápasy</th><th>Obdržené</th><th>Průměr</th></tr></thead><tbody>';
  list.forEach((g,i) => html += `<tr><td>${i+1}</td><td class="gk">${g.name}</td><td>${g.team}</td><td>${g.matches}</td><td>${g.goalsAgainst}</td><td>${g.avg.toFixed(2)}</td></tr>`);
  html += '</tbody></table>';
  el.insertAdjacentHTML('beforeend', html);
}

// --- pomocná funkce: počítání zápasů a gólů ---
function calculatePlayerStats(player, teamName){
  let matches = 0, goals = 0, goalsAgainst = 0;
  data.matches.forEach(m => {
    if (!m.played) return;
    const isHomeTeam = m.home === teamName;
    const isAwayTeam = m.away === teamName;

    if (player.position && player.position.toUpperCase() === 'G'){
      if (isHomeTeam || isAwayTeam){
        matches++;
        goalsAgainst += isHomeTeam ? Number(m.awayGoals) : Number(m.homeGoals);
      }
    } else {
      // u hráče kontrolujeme pole playersHome/playersAway (uložená čísla)
      if (isHomeTeam && Array.isArray(m.playersHome) && player.number !== null){
        if (m.playersHome.includes(player.number)) {
          matches++;
          // goalscorers pole obsahuje čísla střelců; sečíst jak často se číslo objevilo
          if (Array.isArray(m.goalscorers)) goals += m.goalscorers.filter(g => g === player.number).length;
        }
      }
      if (isAwayTeam && Array.isArray(m.playersAway) && player.number !== null){
        if (m.playersAway.includes(player.number)) {
          matches++;
          if (Array.isArray(m.goalscorers)) goals += m.goalscorers.filter(g => g === player.number).length;
        }
      }
    }
  });
  return { matches, goals, goalsAgainst };
}

