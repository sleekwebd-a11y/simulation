// ---- STATE ----
let state = {
  year: 1,
  calYear: 2026,
  gdp: 12000,
  pop: 31000,
  happy: 42,
  rank: 47,
  ticker: null,
  adoptedPolicies: [],
  chartData: { years: [], gdp: [], happy: [], pop: [] }
};

let charts = {};

// ---- UTILS ----
function fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(0) + 'k';
  return n;
}

function fmtMoney(n) {
  if (n >= 1000) return '€' + (n / 1000).toFixed(0) + 'k';
  return '€' + n;
}

// ---- INIT CHARTS ----
function initCharts() {
  const chartDefs = [
    { id: 'chartGDP',   label: '💰 GDP per capita (€)', color: '#34d399' },
    { id: 'chartHappy', label: '😊 Happiness Index (0–100)', color: '#fbbf24' },
    { id: 'chartPop',   label: '👥 Population', color: '#60a5fa' },
  ];

  chartDefs.forEach(({ id, label, color }) => {
    const ctx = document.getElementById(id);
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          data: [],
          borderColor: color,
          borderWidth: 2,
          fill: true,
          backgroundColor: color + '15',
          tension: 0.4,
          pointRadius: 0,
        }]
      },
      options: {
        responsive: true,
        animation: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: label, color: '#94a3b8', font: { size: 11 } }
        },
        scales: {
          x: { ticks: { color: '#475569', font: { size: 9 } }, grid: { color: '#ffffff06' } },
          y: { ticks: { color: '#475569', font: { size: 9 } }, grid: { color: '#ffffff06' } }
        }
      }
    });
  });
}

function updateCharts() {
  const d = state.chartData;
  ['GDP','Happy','Pop'].forEach((name, i) => {
    const key = name.toLowerCase();
    const c = charts['chart' + name];
    c.data.labels = d.years.map(y => "'" + String(2025 + y).slice(2));
    c.data.datasets[0].data = d[key];
    c.update('none');
  });
}

// ---- DISPLAY ----
function updateDisplay() {
  const rank = calcRank();
  document.getElementById('simYear').textContent  = state.calYear;
  document.getElementById('yearNum').textContent  = state.year;
  document.getElementById('statGDP').textContent  = fmtMoney(state.gdp);
  document.getElementById('statPop').textContent  = fmt(state.pop);
  document.getElementById('statHappy').textContent = Math.round(state.happy) + '/100';
  document.getElementById('statRank').textContent = '#' + rank;
  document.getElementById('progressBar').style.width = (state.year / 20 * 100) + '%';
}

function calcRank() {
  const sorted = [...WORLD_COMPARISON.filter(c => c.name !== 'Saaremaa 🏝️'), { name: 'Saaremaa', gdp: state.gdp }]
    .sort((a, b) => b.gdp - a.gdp);
  return sorted.findIndex(c => c.name === 'Saaremaa') + 1;
}

// ---- POLICY CARD ----
function showPolicy(policy) {
  const card = document.getElementById('policyCard');
  document.getElementById('policyIcon').textContent   = policy.icon;
  document.getElementById('policyTitle').textContent  = policy.title;
  document.getElementById('policySource').textContent = 'Adopted from: ' + policy.source;
  document.getElementById('policyFact').textContent   = '📊 Real world: ' + policy.fact;
  card.classList.remove('hidden');
  card.classList.add('ring-2', 'ring-blue-400/40');
  setTimeout(() => card.classList.remove('ring-2', 'ring-blue-400/40'), 2000);

  // Add to adopted list
  state.adoptedPolicies.push(policy);
  renderAdoptedPolicies();
}

function renderAdoptedPolicies() {
  const el = document.getElementById('policiesAdopted');
  el.innerHTML = state.adoptedPolicies.map(p => `
    <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl text-sm">
      <span class="text-xl shrink-0">${p.icon}</span>
      <div>
        <div class="font-semibold text-white text-xs">${p.title}</div>
        <div class="text-blue-300 text-xs">${p.source}</div>
      </div>
    </div>
  `).join('');
}

// ---- EVENTS ----
function checkEvents() {
  const ev = EVENTS.find(e => e.year === state.year);
  if (!ev) return;

  if (ev.stat === 'gdp')   state.gdp   = Math.round(state.gdp   * (1 + ev.delta / 100));
  if (ev.stat === 'happy') state.happy = Math.min(100, state.happy + ev.delta * 0.5);
  if (ev.stat === 'pop')   state.pop   = Math.round(state.pop   * (1 + ev.delta / 100));

  const log = document.getElementById('eventLog');
  const entry = document.createElement('div');
  entry.className = 'flex gap-3 p-3 bg-white/5 border border-white/10 rounded-xl text-sm';
  entry.innerHTML = `
    <span class="text-xl shrink-0">${ev.icon}</span>
    <div>
      <span class="text-xs font-mono text-blue-300">${state.calYear} — </span>
      <span class="text-slate-200">${ev.text}</span>
    </div>
  `;
  log.insertBefore(entry, log.firstChild);
}

// ---- CHECK POLICIES ----
function checkPolicies() {
  const policy = POLICIES.find(p => p.year === state.year);
  if (policy) showPolicy(policy);
}

// ---- SIMULATE YEAR ----
function simulateYear() {
  if (state.year > 20) {
    clearInterval(state.ticker);
    showFinal();
    return;
  }

  // GDP growth — accelerates as policies compound
  const baseGrowth = 3.5 + (state.adoptedPolicies.length * 0.4);
  const noise = (Math.random() - 0.4) * 1.5;
  state.gdp = Math.round(state.gdp * (1 + (baseGrowth + noise) / 100));

  // Population — grows from immigration + birth rate
  const popGrowth = 2 + (state.adoptedPolicies.length * 0.15);
  state.pop = Math.round(state.pop * (1 + popGrowth / 100));

  // Happiness — compounds with policies
  const happyGain = 1.2 + (state.adoptedPolicies.length * 0.3);
  state.happy = Math.min(95, state.happy + happyGain * (1 + Math.random() * 0.3));

  checkEvents();
  checkPolicies();

  // Update chart data
  state.chartData.years.push(state.year);
  state.chartData.gdp.push(state.gdp);
  state.chartData.happy.push(Math.round(state.happy));
  state.chartData.pop.push(Math.round(state.pop / 1000));

  updateCharts();
  updateDisplay();

  state.year++;
  state.calYear++;
}

// ---- FINAL ----
function showFinal() {
  const finalCard = document.getElementById('finalCard');
  finalCard.classList.remove('hidden');
  finalCard.scrollIntoView({ behavior: 'smooth' });

  const rank = calcRank();

  document.getElementById('finalStats').innerHTML = `
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-3xl font-black text-emerald-300">${fmtMoney(state.gdp)}</div>
        <div class="text-xs text-slate-400 mt-1">GDP per capita</div>
        <div class="text-xs text-emerald-400 mt-1">Top ${rank} in the world</div>
      </div>
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-3xl font-black text-yellow-300">${Math.round(state.happy)}/100</div>
        <div class="text-xs text-slate-400 mt-1">Happiness index</div>
        <div class="text-xs text-yellow-400 mt-1">Among world's happiest</div>
      </div>
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-3xl font-black text-blue-300">${fmt(state.pop)}</div>
        <div class="text-xs text-slate-400 mt-1">Population (was 31k)</div>
        <div class="text-xs text-blue-400 mt-1">${Math.round((state.pop/31000 - 1)*100)}% growth</div>
      </div>
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-3xl font-black text-purple-300">${state.adoptedPolicies.length}</div>
        <div class="text-xs text-slate-400 mt-1">Policies adopted</div>
        <div class="text-xs text-purple-400 mt-1">From ${state.adoptedPolicies.length} countries</div>
      </div>
    </div>
    <div class="p-4 bg-blue-900/30 border border-blue-400/20 rounded-2xl text-sm text-slate-300 leading-relaxed">
      🌍 <strong class="text-white">The verdict:</strong> Saaremaa proved that evidence-based policy 
      beats ideology every time. By copying only what worked — regardless of political label — 
      a 31,000-person island became one of the most successful nations in human history within 20 years.
    </div>
  `;

  // World comparison chart
  const compData = [...WORLD_COMPARISON];
  const saareIdx = compData.findIndex(c => c.name === 'Saaremaa 🏝️');
  if (saareIdx >= 0) compData[saareIdx].gdp = state.gdp;
  compData.sort((a, b) => b.gdp - a.gdp);

  const worldCtx = document.getElementById('chartWorld');
  new Chart(worldCtx, {
    type: 'bar',
    data: {
      labels: compData.map(c => c.name),
      datasets: [{
        data: compData.map(c => c.gdp),
        backgroundColor: compData.map(c =>
          c.name === 'Saaremaa 🏝️' ? '#34d399' : '#3b82f640'
        ),
        borderColor: compData.map(c =>
          c.name === 'Saaremaa 🏝️' ? '#34d399' : '#3b82f660'
        ),
        borderWidth: 1,
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: '#ffffff06' } },
        y: {
          ticks: { color: '#64748b', font: { size: 9 }, callback: v => '€' + (v/1000).toFixed(0) + 'k' },
          grid: { color: '#ffffff08' }
        }
      }
    }
  });
}

// ---- SHARE ----
function shareResult() {
  const text = `🏝️ Republic of Saaremaa — The Perfect Nation Experiment\n\n`
    + `After 20 years of evidence-based policy:\n`
    + `💰 GDP/capita: ${fmtMoney(state.gdp)}\n`
    + `😊 Happiness: ${Math.round(state.happy)}/100\n`
    + `👥 Population: ${fmt(state.pop)} (was 31k)\n\n`
    + `Watch it yourself: ${location.href}`;
  navigator.clipboard.writeText(text)
    .then(() => alert('✅ Results copied! Share the experiment.'))
    .catch(() => prompt('Copy this:', text));
}

function resetSim() {
  clearInterval(state.ticker);
  state = {
    year: 1, calYear: 2026,
    gdp: 12000, pop: 31000, happy: 42, rank: 47,
    ticker: null,
    adoptedPolicies: [],
    chartData: { years: [], gdp: [], happy: [], pop: [] }
  };
  document.getElementById('finalCard').classList.add('hidden');
  document.getElementById('policyCard').classList.add('hidden');
  document.getElementById('eventLog').innerHTML = '';
  document.getElementById('policiesAdopted').innerHTML = '';
  initCharts();
  updateDisplay();
  state.ticker = setInterval(simulateYear, 1200);
}

// ---- START ----
function startSim() {
  document.getElementById('introScreen').classList.add('hidden');
  document.getElementById('simScreen').classList.remove('hidden');
  initCharts();
  updateDisplay();
  state.ticker = setInterval(simulateYear, 1200);
}
