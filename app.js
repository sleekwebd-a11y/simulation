// ══════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════
let simLen    = 20;
let autoPlay  = false;
let autoTimer = null;
let autoDelay = 4000;
let charts    = {};
let cd        = { labels:[], gdp:[], happy:[], pop:[] };
let s         = {};

// ══════════════════════════════════════════════
//  BOOT — runs after DOM + scripts fully loaded
// ══════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', function () {

  // Build intro policy list
  buildPolicyPreview();

  // Set default length selection
  pickLen(20);

  // ── Wire up every button here — NO inline onclick ──
  document.getElementById('beginBtn').addEventListener('click', startSimulation);
  document.getElementById('btnNext').addEventListener('click', advanceYear);
  document.getElementById('btnManual').addEventListener('click', function () { setAuto(false); });
  document.getElementById('btnAuto').addEventListener('click',   function () { setAuto(true);  });
  document.getElementById('sp1').addEventListener('click', function () { setSpeed(4000); });
  document.getElementById('sp2').addEventListener('click', function () { setSpeed(2000); });
  document.getElementById('sp3').addEventListener('click', function () { setSpeed(800);  });

  document.querySelectorAll('.len-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      pickLen(parseInt(btn.dataset.len));
    });
  });

  // Share + reset wired after sim starts, but safe to wire now
  document.getElementById('btnShare').addEventListener('click', shareResult);
  document.getElementById('btnReset').addEventListener('click', resetSim);
});

// ══════════════════════════════════════════════
//  POLICY PREVIEW
// ══════════════════════════════════════════════
function buildPolicyPreview() {
  var el = document.getElementById('policyPreviewList');
  POLICIES.forEach(function (pol) {
    var row = document.createElement('div');
    row.className = 'flex gap-3 items-start py-2 border-b border-white/5 last:border-0';
    row.innerHTML =
      '<span class="text-xl shrink-0 mt-0.5">' + pol.icon + '</span>' +
      '<div class="flex-1 min-w-0">' +
        '<div class="text-sm font-semibold text-white leading-snug">' + pol.title + '</div>' +
        '<div class="text-xs text-teal-400 mt-0.5">' + pol.source + ' · <span class="text-slate-500">Year ' + pol.year + '</span></div>' +
      '</div>';
    el.appendChild(row);
  });
}

// ══════════════════════════════════════════════
//  LENGTH PICKER
// ══════════════════════════════════════════════
function pickLen(val) {
  simLen = val;
  document.querySelectorAll('.len-btn').forEach(function (btn) {
    var active = parseInt(btn.dataset.len) === val;
    btn.className = 'len-btn py-3 rounded-2xl text-sm font-bold border transition-all ' +
      (active
        ? 'bg-teal-600 border-teal-500 text-white'
        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white');
  });
}

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════
function fmt(n) {
  if (n >= 1e9)  return (n / 1e9).toFixed(1)  + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(1)  + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
  return Math.round(n).toString();
}
function fmtM(n) {
  if (n >= 1e9)  return '€' + (n / 1e9).toFixed(1)  + 'B';
  if (n >= 1e6)  return '€' + (n / 1e6).toFixed(1)  + 'M';
  if (n >= 1000) return '€' + (n / 1000).toFixed(0) + 'k';
  return '€' + Math.round(n);
}
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
function calYear()         { return NATION.founded + s.year; }

function getEra() {
  var p = s.year / simLen;
  if (p < 0.2) return { name: '🌱 Foundation Era',  color: 'text-emerald-300' };
  if (p < 0.4) return { name: '📈 Growth Era',      color: 'text-blue-300'   };
  if (p < 0.6) return { name: '⚡ Trial Era',        color: 'text-yellow-300' };
  if (p < 0.8) return { name: '🏛️ Maturity Era',   color: 'text-violet-300' };
  return               { name: '🌟 Legacy Era',      color: 'text-amber-300'  };
}

// ══════════════════════════════════════════════
//  START SIMULATION
// ══════════════════════════════════════════════
function startSimulation() {
  s = {
    year:           0,
    gdp:            8000,
    pop:            31000,
    happy:          50,
    stability:      60,
    debt:           20,
    wealthFund:     0,
    eduBoost:       false,
    finished:       false,
    activePolicies: new Set(),
  };
  cd = { labels:[], gdp:[], happy:[], pop:[] };

  document.getElementById('introPanel').classList.add('hidden');
  document.getElementById('simPanel').classList.remove('hidden');
  document.getElementById('policyCard').classList.add('hidden');
  document.getElementById('yearSummary').classList.add('hidden');
  document.getElementById('finalCard').classList.add('hidden');
  document.getElementById('chronicle').innerHTML = '';

  // Reset next button in case of replay
  var nb = document.getElementById('btnNext');
  nb.disabled  = false;
  nb.innerHTML = '▶ Next Year →';
  nb.className = 'w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95';

  setAuto(false);
  initCharts();
  updateDisplay();
  updateWorldComparison();

  logEvent('🏝️', 'The Republic of Varde declares independence. A new chapter begins.', 'era');
  logEvent('📜', 'Founding charter signed. The experiment starts now.', 'era');
}

// ══════════════════════════════════════════════
//  AUTO / SPEED CONTROLS
// ══════════════════════════════════════════════
function setAuto(on) {
  autoPlay = on;
  document.getElementById('btnManual').className = 'px-4 py-2 rounded-xl text-sm font-bold transition-all ' + (!on ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white');
  document.getElementById('btnAuto').className   = 'px-4 py-2 rounded-xl text-sm font-bold transition-all ' + ( on ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white');
  document.getElementById('speedControl').classList.toggle('hidden', !on);
  document.getElementById('btnNext').classList.toggle('hidden', on);

  if (autoTimer) clearInterval(autoTimer);
  if (on) {
    advanceYear();
    autoTimer = setInterval(function () {
      if (s.finished) { clearInterval(autoTimer); return; }
      advanceYear();
    }, autoDelay);
  }
}

function setSpeed(ms) {
  autoDelay = ms;
  var speeds = [4000, 2000, 800];
  ['sp1','sp2','sp3'].forEach(function (id, i) {
    document.getElementById(id).className = 'px-3 py-2 rounded-xl text-xs font-bold transition-all ' +
      (ms === speeds[i] ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white');
  });
  if (autoPlay) {
    clearInterval(autoTimer);
    autoTimer = setInterval(function () {
      if (s.finished) { clearInterval(autoTimer); return; }
      advanceYear();
    }, autoDelay);
  }
}

// ══════════════════════════════════════════════
//  ADVANCE YEAR
// ══════════════════════════════════════════════
function advanceYear() {
  if (s.finished) return;
  s.year++;

  var newPolicies = [];
  var yearEvents  = [];

  // Activate scheduled policies
  POLICIES.forEach(function (pol) {
    if (pol.year === s.year && !s.activePolicies.has(pol.id)) {
      s.activePolicies.add(pol.id);
      newPolicies.push(pol);
      applyPolicyEffect(pol);
      logEvent(pol.icon, 'Policy enacted: ' + pol.title + ' — ' + pol.source, 'policy');
    }
  });

  // Fire world events
  EVENTS.forEach(function (ev) {
    if (ev.year === s.year) {
      yearEvents.push(ev);
      if (ev.stat === 'gdp')   s.gdp   = Math.round(s.gdp   * (1 + ev.delta / 100));
      if (ev.stat === 'happy') s.happy = clamp(s.happy + ev.delta, 0, 100);
      if (ev.stat === 'pop')   s.pop   = Math.round(s.pop   * (1 + ev.delta / 100));
      logEvent(ev.icon, ev.text, 'good');
    }
  });

  organicGrowth();

  cd.labels.push(calYear());
  cd.gdp.push(s.gdp);
  cd.happy.push(Math.round(s.happy));
  cd.pop.push(s.pop);

  updateCharts();
  updateDisplay();
  showYearSummary(yearEvents, newPolicies);
  showPolicyCard(newPolicies);
  buildActivePoliciesList();
  updateWorldComparison();

  if (s.year >= simLen) {
    s.finished = true;
    if (autoTimer) clearInterval(autoTimer);
    var nb = document.getElementById('btnNext');
    nb.disabled   = true;
    nb.textContent = '✅ Simulation Complete';
    nb.className   = 'w-full py-4 bg-slate-700 rounded-2xl font-black text-lg cursor-default opacity-60';
    showFinal();
  }
}

// ══════════════════════════════════════════════
//  POLICY EFFECTS
// ══════════════════════════════════════════════
function applyPolicyEffect(pol) {
  var fx = {
    tax:         function () { s.gdp = Math.round(s.gdp * 1.06); s.happy += 4; },
    corporate:   function () { s.gdp = Math.round(s.gdp * 1.08); },
    ubi:         function () { s.happy += 8;  s.stability += 6; },
    healthcare:  function () { s.happy += 6;  s.stability += 4; },
    education:   function () { s.eduBoost = true; s.happy += 3; },
    housing:     function () { s.happy += 8;  s.stability += 5; },
    banking:     function () { s.gdp = Math.round(s.gdp * 1.03); s.happy += 3; },
    privacy:     function () { s.stability += 4; s.happy += 2; },
    egov:        function () { s.gdp = Math.round(s.gdp * 1.05); s.stability += 5; },
    workweek:    function () { s.happy += 7; s.gdp = Math.round(s.gdp * 1.03); },
    immigration: function () { s.pop = Math.round(s.pop * 1.12); s.gdp = Math.round(s.gdp * 1.04); },
    energy:      function () { s.gdp = Math.round(s.gdp * 1.04); s.stability += 3; },
    drugs:       function () { s.happy += 5; s.stability += 4; s.debt = Math.max(0, s.debt - 5); },
    wealth:      function () { s.wealthFund += s.gdp * 500; },
    wages:       function () { s.happy += 6; s.stability += 5; },
    parental:    function () { s.happy += 5; s.pop = Math.round(s.pop * 1.04); },
    mental:      function () { s.happy += 7; s.stability += 3; },
    eresidency:  function () { s.gdp = Math.round(s.gdp * 1.07); },
    voting:      function () { s.stability += 8; s.happy += 4; },
    startup:     function () { s.gdp = Math.round(s.gdp * 1.09); },
  };
  if (fx[pol.id]) fx[pol.id]();
  s.happy     = clamp(s.happy,     0, 100);
  s.stability = clamp(s.stability, 0, 100);
}

// ══════════════════════════════════════════════
//  ORGANIC GROWTH
// ══════════════════════════════════════════════
function organicGrowth() {
  var polCount = s.activePolicies.size;
  var gdpG = 2.5 + polCount * 0.35 + (s.eduBoost && s.year > 10 ? 1.5 : 0);
  gdpG += (Math.random() - 0.38) * 1.5;
  s.gdp = Math.round(s.gdp * (1 + clamp(gdpG, -2, 18) / 100));

  var popG = 1.2
    + (s.activePolicies.has('immigration') ? 2.5 : 0)
    + (s.activePolicies.has('parental')    ? 1.0 : 0);
  popG += (Math.random() - 0.38) * 0.8;
  s.pop = Math.round(s.pop * (1 + clamp(popG, 0, 8) / 100));

  s.happy     = clamp(s.happy     + (Math.random() - 0.28) * 0.7, 0, 100);
  s.stability = clamp(s.stability + (Math.random() - 0.28) * 0.5, 0, 100);
  s.debt      = clamp(s.debt - 0.9 + (Math.random() - 0.4) * 0.4, 0, 100);

  if (s.activePolicies.has('wealth')) {
    s.wealthFund += s.gdp * s.pop * 0.0008;
  }
}

// ══════════════════════════════════════════════
//  YEAR SUMMARY
// ══════════════════════════════════════════════
function showYearSummary(events, policies) {
  var box  = document.getElementById('yearSummary');
  var html = '<div class="text-sm font-bold text-teal-300">' + calYear() + ' — Year ' + s.year + ' Summary</div>';

  if (!events.length && !policies.length) {
    html += '<div class="text-xs text-slate-500 italic mt-1">Steady year — Varde grows quietly.</div>';
  }
  policies.forEach(function (p) {
    html += '<div class="flex gap-2 items-start text-xs mt-1"><span class="shrink-0">' + p.icon + '</span><span class="text-teal-200">Policy enacted: <strong>' + p.title + '</strong></span></div>';
  });
  events.forEach(function (e) {
    html += '<div class="flex gap-2 items-start text-xs mt-1"><span class="shrink-0">' + e.icon + '</span><span class="text-emerald-200">' + e.text + '</span></div>';
  });
  html += '<div class="grid grid-cols-4 gap-2 mt-3">' +
    '<div class="bg-black/20 rounded-xl p-2 text-center"><div class="text-sm font-black text-emerald-300">' + fmtM(s.gdp) + '</div><div class="text-xs text-slate-500">GDP/cap</div></div>' +
    '<div class="bg-black/20 rounded-xl p-2 text-center"><div class="text-sm font-black text-yellow-300">' + Math.round(s.happy) + '/100</div><div class="text-xs text-slate-500">Happiness</div></div>' +
    '<div class="bg-black/20 rounded-xl p-2 text-center"><div class="text-sm font-black text-blue-300">'   + fmt(s.pop)          + '</div><div class="text-xs text-slate-500">Population</div></div>' +
    '<div class="bg-black/20 rounded-xl p-2 text-center"><div class="text-sm font-black text-violet-300">' + Math.round(s.stability) + '/100</div><div class="text-xs text-slate-500">Stability</div></div>' +
  '</div>';

  box.innerHTML = html;
  box.classList.remove('hidden');
}

// ══════════════════════════════════════════════
//  POLICY SPOTLIGHT
// ══════════════════════════════════════════════
function showPolicyCard(policies) {
  var card = document.getElementById('policyCard');
  if (!policies.length) { card.classList.add('hidden'); return; }
  var pol = policies[policies.length - 1];
  document.getElementById('pcIcon').textContent   = pol.icon;
  document.getElementById('pcTitle').textContent  = pol.title;
  document.getElementById('pcSource').textContent = pol.source;
  document.getElementById('pcFact').textContent   = pol.fact;
  card.classList.remove('hidden');
}

// ══════════════════════════════════════════════
//  ACTIVE POLICIES LIST
// ══════════════════════════════════════════════
function buildActivePoliciesList() {
  var el    = document.getElementById('activePolicies');
  var count = document.getElementById('activePolicyCount');
  var active = POLICIES.filter(function (p) { return s.activePolicies.has(p.id); });
  count.textContent = active.length;
  if (!active.length) {
    el.innerHTML = '<div class="text-xs text-slate-500 italic">No policies active yet.</div>';
    return;
  }
  el.innerHTML = '';
  active.slice().reverse().forEach(function (pol) {
    var row = document.createElement('div');
    row.className = 'flex gap-3 items-center p-3 bg-black/20 rounded-2xl';
    row.innerHTML =
      '<span class="text-xl shrink-0">' + pol.icon + '</span>' +
      '<div class="flex-1 min-w-0">' +
        '<div class="text-sm font-semibold text-white truncate">' + pol.title + '</div>' +
        '<div class="text-xs text-teal-400">' + pol.source + '</div>' +
      '</div>' +
      '<div class="text-xs text-slate-500 shrink-0">Yr ' + pol.year + '</div>';
    el.appendChild(row);
  });
}

// ══════════════════════════════════════════════
//  WORLD COMPARISON
// ══════════════════════════════════════════════
function updateWorldComparison() {
  var live = { name:'🏝️ Varde', gdp: s.gdp, happy: Math.round(s.happy), live: true };
  var all  = WORLD_COMPARISON.map(function (c) { return Object.assign({}, c); });
  all.push(live);
  all.sort(function (a, b) { return b.gdp - a.gdp; });

  var maxGdp = all[0].gdp;
  var el = document.getElementById('worldTable');
  el.innerHTML = '';

  all.forEach(function (c, i) {
    var pct = Math.round((c.gdp / maxGdp) * 100);
    var div = document.createElement('div');
    div.className = 'space-y-1 ' + (c.live ? 'bg-teal-900/30 border border-teal-500/30 rounded-2xl p-3' : 'px-1 py-0.5');
    div.innerHTML =
      '<div class="flex justify-between text-sm">' +
        '<span class="font-semibold ' + (c.live ? 'text-teal-300' : 'text-slate-300') + '">' + (i+1) + '. ' + c.name + '</span>' +
        '<span class="text-xs text-slate-400 font-mono">' + fmtM(c.gdp) + ' · 😊 ' + c.happy + '</span>' +
      '</div>' +
      '<div class="h-1.5 bg-white/10 rounded-full overflow-hidden">' +
        '<div class="h-full rounded-full transition-all duration-500 ' + (c.live ? 'bg-teal-400' : 'bg-slate-600') + '" style="width:' + pct + '%"></div>' +
      '</div>';
    el.appendChild(div);
  });
}

// ══════════════════════════════════════════════
//  DISPLAY UPDATE
// ══════════════════════════════════════════════
function updateDisplay() {
  var era  = getEra();
  var prog = clamp((s.year / simLen) * 100, 0, 100);

  document.getElementById('simYearDisplay').textContent  = calYear();
  document.getElementById('simYearSub').textContent      = 'Year ' + s.year + ' of ' + simLen;
  document.getElementById('simProgressBar').style.width  = prog + '%';
  document.getElementById('eraLabel').textContent        = era.name;
  document.getElementById('eraLabel').className          = 'text-xs mt-0.5 uppercase tracking-wider ' + era.color;

  document.getElementById('sGDP').textContent      = fmtM(s.gdp);
  document.getElementById('sPop').textContent      = fmt(s.pop);
  document.getElementById('sHappy').textContent    = Math.round(s.happy)     + '/100';
  document.getElementById('sStab').textContent     = Math.round(s.stability) + '/100';
  document.getElementById('sDebt').textContent     = Math.round(s.debt)      + '%';
  document.getElementById('sWealth').textContent   = fmtM(s.wealthFund);
  document.getElementById('sPolicies').textContent = s.activePolicies.size   + ' / 20';

  if (!s.finished) {
    document.getElementById('btnNext').innerHTML =
      '▶ Next Year → <span class="text-teal-200 text-sm font-normal">' + (calYear() + 1) + '</span>';
  }
}

// ══════════════════════════════════════════════
//  CHRONICLE
// ══════════════════════════════════════════════
function logEvent(icon, text, type) {
  var log    = document.getElementById('chronicle');
  var colors = {
    good:   'bg-emerald-900/20 border-emerald-500/20',
    policy: 'bg-teal-900/20 border-teal-500/20',
    era:    'bg-violet-900/20 border-violet-500/20',
  };
  var el = document.createElement('div');
  el.className = 'flex gap-3 p-3 border ' + (colors[type] || 'bg-white/5 border-white/10') + ' rounded-xl text-sm';
  el.innerHTML =
    '<span class="text-lg shrink-0">' + icon + '</span>' +
    '<div><span class="text-xs font-mono text-slate-400">' + calYear() + ' — </span>' +
    '<span class="text-slate-200">' + text + '</span></div>';
  log.insertBefore(el, log.firstChild);
}

// ══════════════════════════════════════════════
//  CHARTS
// ══════════════════════════════════════════════
function initCharts() {
  var defs = [
    { id:'chartGDP',   label:'💰 GDP per capita (€)',       color:'#2dd4bf' },
    { id:'chartHappy', label:'😊 Happiness Index (0–100)',  color:'#fbbf24' },
    { id:'chartPop',   label:'👥 Population',               color:'#60a5fa' },
  ];
  defs.forEach(function (d) {
    if (charts[d.id]) charts[d.id].destroy();
    charts[d.id] = new Chart(document.getElementById(d.id), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          data: [], borderColor: d.color, borderWidth: 2,
          fill: true, backgroundColor: d.color + '18',
          tension: 0.4, pointRadius: 0
        }]
      },
      options: {
        responsive: true, animation: false,
        plugins: {
          legend: { display: false },
          title:  { display: true, text: d.label, color: '#94a3b8', font: { size: 11 } }
        },
        scales: {
          x: { ticks: { color:'#475569', font:{size:9}, maxTicksLimit:10 }, grid: { color:'#ffffff05' } },
          y: { ticks: { color:'#475569', font:{size:9} },                   grid: { color:'#ffffff08' } }
        }
      }
    });
  });
}

function updateCharts() {
  [['chartGDP','gdp'],['chartHappy','happy'],['chartPop','pop']].forEach(function (pair) {
    charts[pair[0]].data.labels           = cd.labels;
    charts[pair[0]].data.datasets[0].data = cd[pair[1]];
    charts[pair[0]].update('none');
  });
}

// ══════════════════════════════════════════════
//  FINAL SCREEN
// ══════════════════════════════════════════════
function calcGrade() {
  var score = (s.gdp / 1000) * 0.3 + s.happy * 0.4 + s.stability * 0.2 + (100 - s.debt) * 0.1;
  if (score > 90) return { g:'S', c:'text-emerald-300', label:'Utopia achieved — a model for all humanity' };
  if (score > 75) return { g:'A', c:'text-lime-300',    label:'Exceptional — among the world\'s greatest nations' };
  if (score > 60) return { g:'B', c:'text-yellow-300',  label:'Solid success — above average across the board' };
  if (score > 45) return { g:'C', c:'text-orange-300',  label:'Mixed results — some policies underdelivered' };
  return                  { g:'F', c:'text-red-400',     label:'The experiment struggled — back to the drawing board' };
}

function showFinal() {
  var card = document.getElementById('finalCard');
  var gr   = calcGrade();
  card.classList.remove('hidden');
  card.scrollIntoView({ behavior: 'smooth' });
  document.getElementById('finalContent').innerHTML =
    '<div class="text-center py-4 space-y-1">' +
      '<div class="text-8xl font-black ' + gr.c + '">' + gr.g + '</div>' +
      '<div class="text-slate-200 font-semibold">' + gr.label + '</div>' +
      '<div class="text-xs text-slate-500">' + NATION.founded + '–' + calYear() + ' · ' + simLen + '-year experiment</div>' +
    '</div>' +
    '<div class="grid grid-cols-2 gap-3">' +
      '<div class="bg-white/5 rounded-2xl p-4 text-center"><div class="text-2xl font-black text-emerald-300">' + fmtM(s.gdp) + '</div><div class="text-xs text-slate-400 mt-1">Final GDP/capita</div></div>' +
      '<div class="bg-white/5 rounded-2xl p-4 text-center"><div class="text-2xl font-black text-yellow-300">' + Math.round(s.happy) + '/100</div><div class="text-xs text-slate-400 mt-1">Final happiness</div></div>' +
      '<div class="bg-white/5 rounded-2xl p-4 text-center"><div class="text-2xl font-black text-blue-300">'   + fmt(s.pop) + '</div><div class="text-xs text-slate-400 mt-1">Final population</div></div>' +
      '<div class="bg-white/5 rounded-2xl p-4 text-center"><div class="text-2xl font-black text-rose-300">'   + Math.round(s.debt) + '%</div><div class="text-xs text-slate-400 mt-1">Final debt/GDP</div></div>' +
    '</div>' +
    '<div class="p-4 bg-white/5 rounded-2xl text-sm text-slate-300 leading-relaxed">' +
      'All <strong>' + s.activePolicies.size + '</strong> policies enacted over ' + simLen + ' years. ' +
      'Varde started with 31,000 citizens and ended with <strong>' + fmt(s.pop) + '</strong>. ' +
      'Sovereign wealth fund: <strong>' + fmtM(s.wealthFund) + '</strong>.' +
    '</div>';
}

// ══════════════════════════════════════════════
//  SHARE
// ══════════════════════════════════════════════
function shareResult() {
  var gr   = calcGrade();
  var text =
    '🏝️ Republic of Varde — Nation Experiment\n\n' +
    'Grade: ' + gr.g + ' — ' + gr.label + '\n' +
    '📅 ' + NATION.founded + '–' + calYear() + ' (' + simLen + ' years)\n' +
    '💰 GDP/cap: ' + fmtM(s.gdp) + ' | 😊 Happiness: ' + Math.round(s.happy) + '/100\n' +
    '👥 Population: ' + fmt(s.pop) + ' | 🏛️ Stability: ' + Math.round(s.stability) + '/100\n' +
    '💼 Wealth Fund: ' + fmtM(s.wealthFund) + '\n\n' +
    'What if a tiny island copied every best policy in the world?';
  navigator.clipboard.writeText(text)
    .then(function ()  { alert('✅ Copied to clipboard!'); })
    .catch(function ()  { prompt('Copy your result:', text); });
}

// ══════════════════════════════════════════════
//  RESET
// ══════════════════════════════════════════════
function resetSim() {
  if (autoTimer) clearInterval(autoTimer);
  autoPlay = false;
  document.getElementById('simPanel').classList.add('hidden');
  document.getElementById('introPanel').classList.remove('hidden');
  pickLen(simLen);
}
