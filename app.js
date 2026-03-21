// ══════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════
let simLen     = 20;
let autoPlay   = false;
let autoTimer  = null;
let autoDelay  = 4000;
let charts     = {};
let cd         = { labels:[], gdp:[], happy:[], pop:[] };

let s = {};

// ══════════════════════════════════════════════
//  INIT — policy preview on load
// ══════════════════════════════════════════════
(function initPreview() {
  const el = document.getElementById('policyPreviewList');
  POLICIES.forEach(pol => {
    el.innerHTML += `
      <div class="flex gap-3 items-start py-2 border-b border-white/5">
        <span class="text-xl shrink-0">${pol.icon}</span>
        <div>
          <div class="text-sm font-semibold text-white">${pol.title}</div>
          <div class="text-xs text-teal-400 mt-0.5">${pol.source} · Activates year ${pol.year}</div>
        </div>
      </div>`;
  });
})();

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════
function fmt(n) {
  if (n >= 1e9)  return (n/1e9).toFixed(1)  + 'B';
  if (n >= 1e6)  return (n/1e6).toFixed(1)  + 'M';
  if (n >= 1000) return (n/1000).toFixed(0) + 'k';
  return Math.round(n).toString();
}
function fmtMoney(n) {
  if (n >= 1e6)  return '€' + (n/1e6).toFixed(1)  + 'M';
  if (n >= 1000) return '€' + (n/1000).toFixed(0) + 'k';
  return '€' + Math.round(n);
}
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

function calYear() { return SAAREMAA.founded + s.year; }

function getEra() {
  const pct = s.year / simLen;
  if (pct < 0.2) return { name: '🌱 Foundation Era',  color: 'text-emerald-300' };
  if (pct < 0.4) return { name: '📈 Growth Era',      color: 'text-blue-300'   };
  if (pct < 0.6) return { name: '⚡ Trial Era',        color: 'text-yellow-300' };
  if (pct < 0.8) return { name: '🏛️ Maturity Era',   color: 'text-violet-300' };
  return                 { name: '🌟 Legacy Era',      color: 'text-amber-300'  };
}

// ══════════════════════════════════════════════
//  LENGTH PICKER
// ══════════════════════════════════════════════
function pickLen(val) {
  simLen = val;
  document.querySelectorAll('.len-btn').forEach(b => {
    const active = parseInt(b.dataset.val) === val;
    b.className = `len-btn py-3 rounded-2xl text-sm font-bold border transition-all ${active ? 'bg-teal-600 border-teal-500 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`;
  });
}

// ══════════════════════════════════════════════
//  CONTROLS
// ══════════════════════════════════════════════
function setAuto(on) {
  autoPlay = on;
  document.getElementById('btnManual').className = `px-4 py-2 rounded-xl text-sm font-bold transition-all ${!on ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`;
  document.getElementById('btnAuto').className   = `px-4 py-2 rounded-xl text-sm font-bold transition-all ${on  ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`;
  document.getElementById('speedControl').classList.toggle('hidden', !on);
  document.getElementById('btnNext').classList.toggle('hidden', on);

  if (autoTimer) clearInterval(autoTimer);
  if (on) {
    advanceYear();
    autoTimer = setInterval(() => { if (!s.finished) advanceYear(); else clearInterval(autoTimer); }, autoDelay);
  }
}

function setSpeed(ms) {
  autoDelay = ms;
  ['sp1','sp2','sp3'].forEach((id, i) => {
    const speeds = [4000, 2000, 800];
    document.getElementById(id).className = `px-3 py-2 rounded-xl text-xs font-bold transition-all ${ms === speeds[i] ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`;
  });
  if (autoPlay) {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => { if (!s.finished) advanceYear(); else clearInterval(autoTimer); }, autoDelay);
  }
}

// ══════════════════════════════════════════════
//  CORE ADVANCE
// ══════════════════════════════════════════════
function advanceYear() {
  if (s.finished) return;
  s.year++;

  const yearEvents   = [];
  const newPolicies  = [];

  // ── Activate policies for this year ──
  POLICIES.forEach(pol => {
    if (pol.year === s.year && !s.activePolicies.has(pol.id)) {
      s.activePolicies.add(pol.id);
      newPolicies.push(pol);
      applyPolicyEffect(pol);
    }
  });

  // ── Fire scheduled events ──
  EVENTS.forEach(ev => {
    if (ev.year === s.year) {
      yearEvents.push(ev);
      if (ev.stat === 'gdp')   s.gdp    = Math.round(s.gdp    * (1 + ev.delta / 100));
      if (ev.stat === 'happy') s.happy  = clamp(s.happy  + ev.delta, 0, 100);
      if (ev.stat === 'pop')   s.pop    = Math.round(s.pop * (1 + ev.delta / 100));
      logEvent(ev.icon, ev.text, 'good');
    }
  });

  // ── Organic growth each year ──
  organicGrowth();

  // ── Record chart data ──
  cd.labels.push(calYear());
  cd.gdp.push(s.gdp);
  cd.happy.push(Math.round(s.happy));
  cd.pop.push(s.pop);
  updateCharts();

  // ── UI updates ──
  updateDisplay();
  showYearSummary(yearEvents, newPolicies);
  showNewPolicyCard(newPolicies);
  updateActivePoliciesList();
  updateWorldComparison();

  if (s.year >= simLen) {
    s.finished = true;
    if (autoTimer) clearInterval(autoTimer);
    document.getElementById('btnNext').disabled = true;
    document.getElementById('btnNext').textContent = '✅ Simulation Complete';
    showFinal();
  }
}

// ══════════════════════════════════════════════
//  POLICY EFFECTS
// ══════════════════════════════════════════════
function applyPolicyEffect(pol) {
  const effects = {
    tax:         () => { s.gdp    = Math.round(s.gdp * 1.06); s.happy += 4; },
    corporate:   () => { s.gdp    = Math.round(s.gdp * 1.08); },
    ubi:         () => { s.happy += 8; s.stability += 6; },
    healthcare:  () => { s.happy += 6; s.stability += 4; },
    education:   () => { s.eduBoost = true; s.happy += 3; },
    housing:     () => { s.happy += 8; s.stability += 5; },
    banking:     () => { s.gdp    = Math.round(s.gdp * 1.03); s.happy += 3; },
    privacy:     () => { s.stability += 4; s.happy += 2; },
    egov:        () => { s.gdp    = Math.round(s.gdp * 1.05); s.stability += 5; },
    workweek:    () => { s.happy += 7; s.gdp = Math.round(s.gdp * 1.03); },
    immigration: () => { s.pop    = Math.round(s.pop * 1.12); s.gdp = Math.round(s.gdp * 1.04); },
    energy:      () => { s.gdp    = Math.round(s.gdp * 1.04); s.stability += 3; },
    drugs:       () => { s.happy += 5; s.stability += 4; s.debt = Math.max(0, s.debt - 5); },
    wealth:      () => { s.wealthFund += s.gdp * s.pop * 0.001; },
    wages:       () => { s.happy += 6; s.stability += 5; },
    parental:    () => { s.happy += 5; s.pop = Math.round(s.pop * 1.04); },
    mental:      () => { s.happy += 7; s.stability += 3; },
    eresidency:  () => { s.gdp    = Math.round(s.gdp * 1.07); },
    voting:      () => { s.stability += 8; s.happy += 4; },
    startup:     () => { s.gdp    = Math.round(s.gdp * 1.09); },
  };
  if (effects[pol.id]) effects[pol.id]();
  s.happy     = clamp(s.happy,     0, 100);
  s.stability = clamp(s.stability, 0, 100);
  logEvent(pol.icon, `Policy enacted: ${pol.title} (${pol.source})`, 'policy');
}

// ══════════════════════════════════════════════
//  ORGANIC GROWTH
// ══════════════════════════════════════════════
function organicGrowth() {
  const polCount = s.activePolicies.size;
  let gdpGrowth  = 2.5 + polCount * 0.3 + (s.eduBoost && s.year > 10 ? 1.5 : 0);
  gdpGrowth     += (Math.random() - 0.4) * 1.5;
  gdpGrowth      = clamp(gdpGrowth, -2, 18);
  s.gdp          = Math.round(s.gdp * (1 + gdpGrowth / 100));

  let popGrowth  = 1.2 + (s.activePolicies.has('immigration') ? 2 : 0)
                       + (s.activePolicies.has('parental')    ? 1 : 0);
  popGrowth     += (Math.random() - 0.4) * 0.8;
  s.pop          = Math.round(s.pop * (1 + clamp(popGrowth, 0, 8) / 100));

  s.happy        = clamp(s.happy + (Math.random() - 0.3) * 0.8, 0, 100);
  s.stability    = clamp(s.stability + (Math.random() - 0.3) * 0.5, 0, 100);

  // Wealth fund grows with GDP
  if (s.activePolicies.has('wealth')) {
    s.wealthFund += s.gdp * s.pop * 0.0015;
  }

  // Debt slowly reduces with good governance
  s.debt = clamp(s.debt - 0.8 + (Math.random() - 0.4) * 0.4, 0, 100);
}

// ══════════════════════════════════════════════
//  YEAR SUMMARY BOX
// ══════════════════════════════════════════════
function showYearSummary(events, policies) {
  const box = document.getElementById('yearSummary');
  let html  = `<div class="text-sm font-bold text-teal-300 mb-2">📅 ${calYear()} — Year ${s.year} Summary</div>`;

  if (policies.length === 0 && events.length === 0) {
    html += `<div class="text-xs text-slate-500 italic">Steady year — no major events.</div>`;
  }

  events.forEach(ev => {
    html += `<div class="flex gap-2 text-xs text-emerald-300"><span>${ev.icon}</span><span>${ev.text}</span></div>`;
  });
  policies.forEach(pol => {
    html += `<div class="flex gap-2 text-xs text-teal-300"><span>${pol.icon}</span><span>Policy enacted: <strong>${pol.title}</strong></span></div>`;
  });

  html += `<div class="grid grid-cols-3 gap-2 mt-3">
    <div class="bg-black/20 rounded-xl p-2 text-center"><div class="text-sm font-bold text-emerald-300">${fmtMoney(s.gdp)}</div><div class="text-xs text-slate-500">GDP/cap</div></div>
    <div class="bg-black/20 rounded-xl p-2 text-center"><div class="text-sm font-bold text-yellow-300">${Math.round(s.happy)}/100</div><div class="text-xs text-slate-500">Happiness</div></div>
    <div class="bg-black/20 rounded-xl p-2 text-center"><div class="text-sm font-bold text-blue-300">${fmt(s.pop)}</div><div class="text-xs text-slate-500">Population</div></div>
  </div>`;

  box.innerHTML = html;
  box.classList.remove('hidden');
}

// ══════════════════════════════════════════════
//  NEW POLICY CARD
// ══════════════════════════════════════════════
function showNewPolicyCard(policies) {
  const card = document.getElementById('newPolicyCard');
  if (policies.length === 0) { card.classList.add('hidden'); return; }
  const pol = policies[policies.length - 1]; // show the last one
  document.getElementById('npIcon').textContent   = pol.icon;
  document.getElementById('npTitle').textContent  = pol.title;
  document.getElementById('npSource').textContent = pol.source;
  document.getElementById('npFact').textContent   = pol.fact;
  card.classList.remove('hidden');
}

// ══════════════════════════════════════════════
//  ACTIVE POLICIES LIST
// ══════════════════════════════════════════════
function updateActivePoliciesList() {
  const el = document.getElementById('activePolicies');
  el.innerHTML = '';
  POLICIES.filter(p => s.activePolicies.has(p.id)).reverse().forEach(pol => {
    el.innerHTML += `
      <div class="flex gap-3 items-center p-3 bg-black/20 rounded-2xl">
        <span class="text-xl shrink-0">${pol.icon}</span>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-semibold text-white truncate">${pol.title}</div>
          <div class="text-xs text-teal-400">${pol.source}</div>
        </div>
        <div class="text-xs text-slate-500 shrink-0">Yr ${pol.year}</div>
      </div>`;
  });
  if (s.activePolicies.size === 0) {
    el.innerHTML = '<div class="text-xs text-slate-500 italic">No policies active yet.</div>';
  }
}

// ══════════════════════════════════════════════
//  WORLD COMPARISON
// ══════════════════════════════════════════════
function updateWorldComparison() {
  const el  = document.getElementById('worldTable');
  const all = WORLD_COMPARISON.map(c =>
    c.name.includes('Saaremaa')
      ? { ...c, gdp: s.gdp, happy: Math.round(s.happy), live: true }
      : c
  ).sort((a, b) => b.gdp - a.gdp);

  const maxGdp = all[0].gdp;
  el.innerHTML = '';
  all.forEach((c, i) => {
    const isLive = c.live;
    const pct    = Math.round((c.gdp / maxGdp) * 100);
    el.innerHTML += `
      <div class="space-y-1 ${isLive ? 'bg-teal-900/30 border border-teal-500/30 rounded-2xl p-3' : 'px-1'}">
        <div class="flex justify-between text-sm">
          <span class="font-semibold ${isLive ? 'text-teal-300' : 'text-slate-300'}">${i+1}. ${c.name}</span>
          <span class="font-mono text-xs text-slate-400">${fmtMoney(c.gdp)} GDP · 😊 ${c.happy}</span>
        </div>
        <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div class="h-full rounded-full ${isLive ? 'bg-teal-400' : 'bg-slate-600'}" style="width:${pct}%"></div>
        </div>
      </div>`;
  });
}

// ══════════════════════════════════════════════
//  DISPLAY UPDATE
// ══════════════════════════════════════════════
function updateDisplay() {
  const era  = getEra();
  const prog = clamp(s.year / simLen * 100, 0, 100);

  document.getElementById('simYearDisplay').textContent = calYear();
  document.getElementById('simYearSub').textContent     = `Year ${s.year} of ${simLen}`;
  document.getElementById('simProgressBar').style.width = prog + '%';
  document.getElementById('eraLabel').textContent       = era.name;
  document.getElementById('eraLabel').className         = `text-xs mt-0.5 uppercase tracking-wider ${era.color}`;

  document.getElementById('sGDP').textContent     = fmtMoney(s.gdp);
  document.getElementById('sPop').textContent     = fmt(s.pop);
  document.getElementById('sHappy').textContent   = Math.round(s.happy) + '/100';
  document.getElementById('sStab').textContent    = Math.round(s.stability) + '/100';
  document.getElementById('sDebt').textContent    = Math.round(s.debt) + '%';
  document.getElementById('sWealth').textContent  = fmt(s.wealthFund);
  document.getElementById('sPolicies').textContent = `${s.activePolicies.size} / ${POLICIES.length}`;

  document.getElementById('btnNext').innerHTML =
    `▶ Next Year → <span class="text-teal-200 text-sm font-normal">${calYear() + 1}</span>`;
}

// ══════════════════════════════════════════════
//  CHRONICLE
// ══════════════════════════════════════════════
function logEvent(icon, text, type) {
  const log    = document.getElementById('chronicle');
  const colors = {
    good:   'bg-emerald-900/20 border-emerald-500/20',
    policy: 'bg-teal-900/20 border-teal-500/20',
    era:    'bg-violet-900/20 border-violet-500/20',
  };
  const el = document.createElement('div');
  el.className = `flex gap-3 p-3 border ${colors[type]||'bg-white/5 border-white/10'} rounded-xl text-sm`;
  el.innerHTML = `<span class="text-lg shrink-0">${icon}</span><div><span class="text-xs font-mono text-slate-400">${calYear()} — </span><span class="text-slate-200">${text}</span></div>`;
  log.insertBefore(el, log.firstChild);
}

// ══════════════════════════════════════════════
//  CHARTS
// ══════════════════════════════════════════════
function initCharts() {
  [
    { id:'chartGDP',   label:'💰 GDP per capita (€)',      color:'#2dd4bf' },
    { id:'chartHappy', label:'😊 Happiness Index (0–100)', color:'#fbbf24' },
    { id:'chartPop',   label:'👥 Population',              color:'#60a5fa' },
  ].forEach(({id, label, color}) => {
    const ctx = document.getElementById(id);
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(ctx, {
      type: 'line',
      data: { labels:[], datasets:[{ data:[], borderColor:color, borderWidth:2, fill:true,
        backgroundColor:
