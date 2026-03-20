// ══════════════════════════════════════════════
//  POLICY DEFINITIONS
// ══════════════════════════════════════════════
const POLICY_DEFS = [
  { id:'tax',         label:'💰 Tax Rate',           min:0, max:20, default:8,  cost:0.8, desc:'Revenue vs. growth/emigration trade-off' },
  { id:'healthcare',  label:'🏥 Healthcare',         min:0, max:20, default:10, cost:1.2, desc:'Pandemic resilience, happiness, life expectancy' },
  { id:'education',   label:'🎓 Education',          min:0, max:20, default:10, cost:1.0, desc:'GDP multiplier — payoff after 20 years' },
  { id:'military',    label:'⚔️ Military',           min:0, max:20, default:5,  cost:1.5, desc:'War deterrence — drains economy if too high' },
  { id:'welfare',     label:'🤝 Welfare',            min:0, max:20, default:8,  cost:1.1, desc:'Inequality buffer — low = unrest' },
  { id:'environment', label:'🌿 Environment',        min:0, max:20, default:8,  cost:0.9, desc:'Disaster risk, tourism, long-term health' },
  { id:'egov',        label:'💻 e-Governance',       min:0, max:20, default:5,  cost:0.7, desc:'Cuts corruption, attracts FDI, boosts efficiency' },
  { id:'openness',    label:'🌍 Trade & Immigration',min:0, max:20, default:8,  cost:0.6, desc:'Growth engine — cultural tension risk' },
];

const PRESETS = {
  nordic:      { tax:18, healthcare:18, education:16, military:4,  welfare:16, environment:14, egov:10, openness:10 },
  singapore:   { tax:8,  healthcare:12, education:16, military:10, welfare:8,  environment:10, egov:18, openness:16 },
  libertarian: { tax:4,  healthcare:4,  education:6,  military:8,  welfare:2,  environment:4,  egov:12, openness:18 },
  military:    { tax:14, healthcare:8,  education:8,  military:20, welfare:6,  environment:4,  egov:6,  openness:4  },
};

// ══════════════════════════════════════════════
//  CRISIS POOL
// ══════════════════════════════════════════════
const CRISES = [
  {
    id:'war', icon:'⚔️', title:'War Declared',
    trigger: (s,p) => p.military < 5 && Math.random() < 0.12,
    desc: 'A neighboring power tests Varde\'s borders. The military is too weak to fully resist.',
    effects: { gdp:-22, pop:-7, happy:-18, stability:-28, debt:25 },
  },
  {
    id:'pandemic', icon:'🦠', title:'Pandemic Outbreak',
    trigger: (s,p) => p.healthcare < 6 && Math.random() < 0.10,
    desc: 'A deadly virus spreads. Underfunded hospitals are overwhelmed within weeks.',
    effects: { gdp:-14, pop:-5, happy:-22, stability:-15, debt:12 },
  },
  {
    id:'climate_flood', icon:'🌊', title:'Catastrophic Flooding',
    trigger: (s,p) => p.environment < 5 && Math.random() < 0.11,
    desc: 'Rising sea levels devastate Varde\'s low-lying coast. Infrastructure destroyed.',
    effects: { gdp:-16, pop:-3, happy:-14, stability:-12, debt:18 },
  },
  {
    id:'debt', icon:'💱', title:'Sovereign Debt Crisis',
    trigger: (s) => s.debt > 120 && Math.random() < 0.22,
    desc: 'International creditors demand repayment. The IMF imposes painful austerity cuts.',
    effects: { gdp:-18, pop:-1, happy:-28, stability:-22, debt:-35 },
  },
  {
    id:'coup', icon:'🏴', title:'Political Coup',
    trigger: (s) => s.stability < 22 && s.happy < 30 && Math.random() < 0.20,
    desc: 'Street protests turn violent. The government falls. Years of uncertainty follow.',
    effects: { gdp:-12, pop:-2, happy:-22, stability:-32, debt:6 },
  },
  {
    id:'braindrain', icon:'🚪', title:'Mass Brain Drain',
    trigger: (s,p) => p.tax > 15 && p.welfare < 6 && Math.random() < 0.16,
    desc: 'Educated citizens leave in droves. High taxes with poor services push talent abroad.',
    effects: { gdp:-9, pop:-8, happy:-10, stability:-8, debt:0 },
  },
  {
    id:'recession', icon:'📉', title:'Global Recession',
    trigger: (s,p) => p.openness > 13 && Math.random() < 0.09,
    desc: 'Varde\'s open economy absorbs the full shock of a global financial downturn.',
    effects: { gdp:-15, pop:-1, happy:-14, stability:-11, debt:14 },
  },
  {
    id:'cyber', icon:'🕵️', title:'State Cyber Attack',
    trigger: (s,p) => p.egov > 13 && p.military < 8 && Math.random() < 0.11,
    desc: 'Foreign hackers cripple government systems. Power outages last weeks.',
    effects: { gdp:-8, pop:0, happy:-9, stability:-14, debt:6 },
  },
  {
    id:'famine', icon:'🌾', title:'Agricultural Collapse',
    trigger: (s,p) => p.environment < 4 && p.welfare < 4 && Math.random() < 0.09,
    desc: 'Soil degradation and poor welfare combine. Food imports can\'t fill the gap.',
    effects: { gdp:-11, pop:-9, happy:-32, stability:-22, debt:9 },
  },
  {
    id:'tension', icon:'😡', title:'Cultural Unrest',
    trigger: (s,p) => p.openness > 15 && p.welfare < 8 && s.year > 10 && Math.random() < 0.13,
    desc: 'Rapid immigration without social investment sparks riots. Integration has failed.',
    effects: { gdp:-6, pop:-2, happy:-17, stability:-20, debt:4 },
  },
  {
    id:'energy', icon:'⛽', title:'Energy Price Shock',
    trigger: (s,p) => p.environment < 8 && s.year > 5 && Math.random() < 0.12,
    desc: 'Global oil prices triple overnight. Varde\'s fossil fuel dependency is exposed.',
    effects: { gdp:-10, pop:0, happy:-12, stability:-9, debt:8 },
  },
  {
    id:'currency', icon:'💸', title:'Currency Speculation Attack',
    trigger: (s) => s.debt > 80 && Math.random() < 0.10,
    desc: 'Hedge funds bet against the Varde kroon. The central bank burns through reserves.',
    effects: { gdp:-13, pop:0, happy:-10, stability:-16, debt:20 },
  },
  {
    id:'refugee', icon:'🏕️', title:'Refugee Crisis',
    trigger: (s,p) => p.openness > 10 && p.welfare < 10 && Math.random() < 0.10,
    desc: 'Tens of thousands flee conflict next door. Varde\'s welfare system buckles.',
    effects: { gdp:-5, pop:4, happy:-13, stability:-15, debt:7 },
  },
  {
    id:'fishingdispute', icon:'🐟', title:'Fishing Rights Dispute',
    trigger: (s,p) => p.military < 8 && Math.random() < 0.10,
    desc: 'Foreign fleets encroach on Varde\'s waters. The navy lacks power to push back.',
    effects: { gdp:-6, pop:0, happy:-7, stability:-8, debt:0 },
  },
  {
    id:'corruption', icon:'🤑', title:'Corruption Scandal',
    trigger: (s,p) => p.egov < 6 && Math.random() < 0.14,
    desc: 'A major embezzlement scheme implicates senior ministers. Trust collapses.',
    effects: { gdp:-7, pop:0, happy:-14, stability:-18, debt:5 },
  },
  {
    id:'coldwave', icon:'❄️', title:'Historic Cold Wave',
    trigger: (s) => Math.random() < 0.06,
    desc: 'Record-breaking winter freezes infrastructure. Heating costs spike, harvests fail.',
    effects: { gdp:-5, pop:-1, happy:-8, stability:-5, debt:4 },
  },
];

// ══════════════════════════════════════════════
//  GOOD EVENTS
// ══════════════════════════════════════════════
const GOOD_EVENTS = [
  { icon:'🌐', text:'Varde declared a Baltic tech hub — FDI surges 40%',             condition:(p,s)=> p.egov>12 && p.tax<10,            gdp:12, happy:6,  stab:5  },
  { icon:'🎓', text:'Education dividends arrive — productivity boom across industry', condition:(p,s)=> p.education>14 && s.year>20,       gdp:9,  happy:7,  stab:4  },
  { icon:'🏥', text:'Life expectancy hits 85 — Varde becomes a longevity model',     condition:(p,s)=> p.healthcare>14,                   gdp:4,  happy:12, stab:7  },
  { icon:'🌿', text:'Green energy exports begin — Varde becomes energy independent', condition:(p,s)=> p.environment>12,                  gdp:8,  happy:6,  stab:4  },
  { icon:'🤝', text:'UN declares Varde poverty-free — welfare model cited globally', condition:(p,s)=> p.welfare>14,                      gdp:4,  happy:14, stab:9  },
  { icon:'🚀', text:'First Varde unicorn startup IPOs on Nasdaq — €2B valuation',    condition:(p,s)=> p.egov>10 && p.tax<12,             gdp:14, happy:8,  stab:5  },
  { icon:'🏆', text:'World Happiness Report: Varde ranked #3 globally',              condition:(p,s)=> p.welfare>12 && p.healthcare>12,   gdp:5,  happy:16, stab:8  },
  { icon:'🛡️', text:'NATO exercise in Varde — security guarantees signed',           condition:(p,s)=> p.military>10,                     gdp:5,  happy:8,  stab:14 },
  { icon:'🌍', text:'Skilled immigration wave — population grows 8% in one year',    condition:(p,s)=> p.openness>12,                     gdp:9,  happy:5,  stab:3  },
  { icon:'💻', text:'e-Governance ranked #1 in Europe — public satisfaction peaks',  condition:(p,s)=> p.egov>15,                         gdp:15, happy:7,  stab:6  },
  { icon:'🤝', text:'EU trade deal signed — tariffs eliminated on all exports',      condition:(p,s)=> p.openness>10 && p.egov>8,         gdp:10, happy:5,  stab:6  },
  { icon:'🏖️', text:'Tourism boom — 2M visitors this year, record revenue',          condition:(p,s)=> p.environment>10 && p.openness>8,  gdp:8,  happy:6,  stab:3  },
  { icon:'🏗️', text:'Infrastructure decade — Varde builds best roads in the Baltics',condition:(p,s)=> p.egov>8 && p.tax>10,             gdp:6,  happy:9,  stab:5  },
  { icon:'🔬', text:'Research university founded — brain gain begins reversing drain',condition:(p,s)=> p.education>12 && p.egov>8,       gdp:7,  happy:8,  stab:5  },
  { icon:'🎭', text:'Cultural renaissance — Varde arts scene goes global',           condition:(p,s)=> p.welfare>10 && p.openness>8,      gdp:4,  happy:11, stab:4  },
  { icon:'⚡', text:'Baltic energy grid connects Varde — electricity prices drop 30%',condition:(p,s)=> p.environment>8 && p.egov>8,     gdp:7,  happy:7,  stab:5  },
];

// ══════════════════════════════════════════════
//  ERAS
// ══════════════════════════════════════════════
const ERAS = [
  { pct:0,   name:'🌱 Foundation Era',  color:'text-emerald-300' },
  { pct:0.2, name:'📈 Growth Era',      color:'text-blue-300'   },
  { pct:0.4, name:'⚡ Trial Era',        color:'text-yellow-300' },
  { pct:0.6, name:'🏛️ Maturity Era',   color:'text-violet-300' },
  { pct:0.8, name:'🌟 Legacy Era',      color:'text-amber-300'  },
];

// ══════════════════════════════════════════════
//  MONTHS
// ══════════════════════════════════════════════
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ══════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════
let p = {};
let s = {};
let simMode   = 'month'; // 'month' | 'year'
let autoPlay  = false;
let autoTimer = null;
let autoDelay = 4000;
let simLen    = 50;
let startCal  = 1991;
let charts    = {};
let cd        = { labels:[], gdp:[], happy:[], stab:[] };

// ══════════════════════════════════════════════
//  SLIDERS
// ══════════════════════════════════════════════
function buildSliders() {
  const c = document.getElementById('sliders');
  c.innerHTML = '';
  POLICY_DEFS.forEach(def => {
    p[def.id] = def.default;
    c.innerHTML += `
      <div>
        <div class="flex justify-between mb-1">
          <span class="text-sm font-semibold">${def.label}</span>
          <span id="v_${def.id}" class="text-sm font-mono text-indigo-300 w-8 text-right">${def.default}</span>
        </div>
        <input type="range" id="sl_${def.id}" min="${def.min}" max="${def.max}" value="${def.default}" step="1"
          class="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-500 bg-white/10"
          oninput="onSlider('${def.id}',this.value)">
        <div class="text-xs text-slate-500 mt-1">${def.desc}</div>
      </div>`;
  });
  updateBudget();
}

function onSlider(id, val) {
  p[id] = parseInt(val);
  document.getElementById('v_' + id).textContent = val;
  updateBudget();
}

function updateBudget() {
  const spent = POLICY_DEFS.reduce((sum,d) => sum + p[d.id]*d.cost, 0);
  const max   = POLICY_DEFS.reduce((sum,d) => sum + d.max*d.cost, 0);
  const budget = Math.round(100 - (spent/max)*100);
  const pct    = Math.max(0, budget);
  const el = document.getElementById('budgetDisplay');
  el.textContent = budget;
  el.className   = `text-2xl font-black ${budget<0?'text-red-400':budget<20?'text-yellow-300':'text-emerald-300'}`;
  const bar = document.getElementById('budgetBar');
  bar.style.width = pct + '%';
  bar.className   = `h-full rounded-full transition-all duration-300 ${budget<0?'bg-gradient-to-r from-red-600 to-rose-600':budget<20?'bg-gradient-to-r from-yellow-500 to-orange-500':'bg-gradient-to-r from-emerald-500 to-teal-500'}`;
}

function applyPreset(name) {
  const preset = PRESETS[name];
  Object.entries(preset).forEach(([id,val]) => {
    p[id] = val;
    const sl = document.getElementById('sl_'+id);
    const vl = document.getElementById('v_'+id);
    if(sl) sl.value = val;
    if(vl) vl.textContent = val;
  });
  updateBudget();
}

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════
function fmt(n) {
  if(n>=1e6)  return (n/1e6).toFixed(1)+'M';
  if(n>=1000) return (n/1000).toFixed(0)+'k';
  return Math.round(n).toString();
}
function fmtMoney(n) {
  if(n>=1000) return '€'+(n/1000).toFixed(0)+'k';
  return '€'+Math.round(n);
}
function clamp(v,mn,mx){ return Math.max(mn,Math.min(mx,v)); }

function getCalDate() {
  const totalMonths = (s.year - 1)*12 + s.month;
  const cy  = startCal + Math.floor((totalMonths-1)/12);
  const cm  = ((totalMonths-1) % 12);
  return { year: cy, month: cm };
}

function getDateLabel() {
  const d = getCalDate();
  if(simMode === 'month') return `${MONTH_NAMES[d.month]} ${d.year}`;
  return `${d.year}`;
}

function getEra() {
  const pct = (s.year-1) / simLen;
  let era = ERAS[0];
  for(const e of ERAS) if(pct >= e.pct) era = e;
  return era;
}

function calcInitialDebt() {
  const spent = POLICY_DEFS.reduce((sum,d) => sum + p[d.id]*d.cost, 0);
  const max   = POLICY_DEFS.reduce((sum,d) => sum + d.max*d.cost, 0);
  const over  = Math.max(0, (spent/max*100) - 100);
  return 20 + over * 0.8;
}

// ══════════════════════════════════════════════
//  CONTROL BUTTONS
// ══════════════════════════════════════════════
function setMode(mode) {
  simMode = mode;
  document.getElementById('btnMonth').className = `px-4 py-2 rounded-xl text-sm font-bold transition-all ${mode==='month'?'bg-indigo-600 text-white':'text-slate-400 hover:text-white'}`;
  document.getElementById('btnYear').className  = `px-4 py-2 rounded-xl text-sm font-bold transition-all ${mode==='year' ?'bg-indigo-600 text-white':'text-slate-400 hover:text-white'}`;
  updateNextBtn();
}

function setAuto(on) {
  autoPlay = on;
  document.getElementById('btnManual').className = `px-4 py-2 rounded-xl text-sm font-bold transition-all ${!on?'bg-indigo-600 text-white':'text-slate-400 hover:text-white'}`;
  document.getElementById('btnAuto').className   = `px-4 py-2 rounded-xl text-sm font-bold transition-all ${on ?'bg-indigo-600 text-white':'text-slate-400 hover:text-white'}`;
  document.getElementById('speedControl').classList.toggle('hidden', !on);
  document.getElementById('btnNext').classList.toggle('hidden', on);

  if(autoTimer) clearInterval(autoTimer);
  if(on) {
    advanceStep();
    autoTimer = setInterval(() => { if(!s.collapsed && !s.finished) advanceStep(); }, autoDelay);
  }
}

function setAutoSpeed(ms) {
  autoDelay = ms;
  document.getElementById('sp1').className = `px-3 py-2 rounded-xl text-xs font-bold transition-all ${ms===4000?'bg-indigo-600 text-white':'text-slate-400 hover:text-white'}`;
  document.getElementById('sp2').className = `px-3 py-2 rounded-xl text-xs font-bold transition-all ${ms===2000?'bg-indigo-600 text-white':'text-slate-400 hover:text-white'}`;
  document.getElementById('sp3').className = `px-3 py-2 rounded-xl text-xs font-bold transition-all ${ms===800 ?'bg-indigo-600 text-white':'text-slate-400 hover:text-white'}`;
  if(autoPlay) {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => { if(!s.collapsed && !s.finished) advanceStep(); }, autoDelay);
  }
}

function updateNextBtn() {
  const lbl = simMode === 'month' ? '▶ Next Month' : '▶ Next Year';
  const d   = getCalDate();
  let sub   = '';
  if(simMode === 'month') {
    sub = `${MONTH_NAMES[d.month]} ${d.year}`;
  } else {
    sub = `${d.year}`;
  }
  document.getElementById('btnNextLabel').textContent = lbl;
  document.getElementById('btnNextSub').textContent   = sub;
}

// ══════════════════════════════════════════════
//  CORE SIMULATION STEP
// ══════════════════════════════════════════════
function advanceStep() {
  if(s.collapsed || s.finished) return;

  const periodEvents  = [];
  const periodChanges = {};

  if(simMode === 'month') {
    simulateMonth(periodEvents, periodChanges);
    s.month++;
    if(s.month > 12) { s.month = 1; s.year++; }
  } else {
    for(let m=0; m<12; m++) {
      simulateMonth(periodEvents, periodChanges);
      s.month++;
      if(s.month > 12) { s.month = 1; s.year++; }
    }
  }

  // Record chart point once per year
  if(s.month === 1 || simMode === 'year') {
    const d = getCalDate();
    cd.labels.push(simMode==='year' ? d.year : `${d.year}`);
    cd.gdp.push(s.gdp);
    cd.happy.push(Math.round(s.happy));
    cd.stab.push(Math.round(s.stability));
    updateCharts();
  }

  updateDisplay();
  showPeriodSummary(periodEvents, periodChanges);
  updateNextBtn();

  if(s.year > simLen && !s.collapsed) {
    s.finished = true;
    if(autoTimer) clearInterval(autoTimer);
    showFinal();
  }
}

// ══════════════════════════════════════════════
//  MONTHLY SIMULATION ENGINE
// ══════════════════════════════════════════════
function simulateMonth(events, changes) {
  // GDP (annualised / 12)
  let gdpGrowth = 1.5/12;
  gdpGrowth += (p.egov      - 10) * 0.08/12;
  gdpGrowth += (10 - p.tax)       * 0.06/12;
  gdpGrowth += (p.openness   - 10) * 0.05/12;
  gdpGrowth += s.year > 20 ? (p.education - 10) * 0.06/12 : 0;
  gdpGrowth -= s.debt > 80  ? 1.2/12 : 0;
  gdpGrowth -= s.debt > 120 ? 2.0/12 : 0;
  gdpGrowth += (Math.random() - 0.45) * 0.5/12;
  gdpGrowth  = clamp(gdpGrowth, -8/12, 14/12);
  const prevGdp = s.gdp;
  s.gdp = Math.round(s.gdp * (1 + gdpGrowth/100));
  if(Math.abs(s.gdp - prevGdp) > 50) changes['gdp'] = { label:'GDP/cap', val: fmtMoney(s.gdp), diff: s.gdp > prevGdp ? '+' : '−', color: s.gdp > prevGdp ? 'text-emerald-300' : 'text-red-300' };

  // Population
  let popGrowth = 0.4/12;
  popGrowth += (p.openness   - 10) * 0.04/12;
  popGrowth += (p.healthcare - 10) * 0.03/12;
  popGrowth += (p.welfare    - 10) * 0.02/12;
  popGrowth -= s.happy < 30 ? 0.8/12 : 0;
  s.pop = Math.round(s.pop * (1 + clamp(popGrowth,-3/12,6/12)/100));

  // Happiness
  let hD = 0;
  hD += (p.healthcare  - 10) * 0.12;
  hD += (p.welfare     - 10) * 0.10;
  hD += (p.environment - 10) * 0.06;
  hD -= (p.tax         - 10) * 0.04;
  hD -= s.debt > 100 ? 3 : 0;
  hD += (Math.random() - 0.5) * 1.5;
  const prevH = s.happy;
  s.happy = clamp(s.happy + hD * 0.015, 0, 100);
  if(Math.abs(s.happy - prevH) > 0.5) changes['happy'] = { label:'Happiness', val: Math.round(s.happy)+'/100', diff: s.happy > prevH?'+':'−', color: s.happy > prevH?'text-yellow-300':'text-orange-300' };

  // Stability
  let stD = 0;
  stD += (p.welfare  - 10) * 0.08;
  stD += (p.military - 10) * 0.06;
  stD -= s.happy < 25 ? 4 : 0;
  stD -= s.debt > 100 ? 2 : 0;
  stD += (Math.random() - 0.5) * 1.2;
  const prevSt = s.stability;
  s.stability = clamp(s.stability + stD * 0.012, 0, 100);
  if(Math.abs(s.stability - prevSt) > 0.5) changes['stab'] = { label:'Stability', val: Math.round(s.stability)+'/100', diff: s.stability > prevSt?'+':'−', color: s.stability > prevSt?'text-violet-300':'text-pink-300' };

  // Debt
  const revenue  = p.tax*4.5 + p.openness*1.5;
  const spending = p.healthcare*2.5 + p.education*2 + p.military*3 + p.welfare*2.5 + p.environment*1.5 + p.egov*1.2;
  const balance  = revenue - spending;
  s.debt = clamp(s.debt - balance*0.04/12 + (Math.random()-0.5)*0.04, 0, 200);

  // Environment
  s.envHealth = clamp((s.envHealth||50) + (p.environment-10)*0.02, 0, 100);

  // Trade score
  s.tradeScore = clamp((s.tradeScore||50) + (p.openness-10)*0.05 + (p.egov-10)*0.03, 0, 100);

  // ── CRISES (check every 8 sim-years, at month 1) ──
  if(s.month === 1 && s.year % 8 === 0) {
    const crisis = CRISES.find(c => !s.crisesHit.has(c.id) && c.trigger(s,p));
    if(crisis) {
      triggerCrisis(crisis, events);
    }
  }

  // ── GOOD EVENTS (check every 5 sim-years at month 6) ──
  if(s.month === 6 && s.year % 5 === 0) {
    const pool = GOOD_EVENTS.filter(e => !s.goodHit.has(e.text) && e.condition(p,s));
    if(pool.length > 0) {
      const ev = pool[Math.floor(Math.random()*pool.length)];
      s.goodHit.add(ev.text);
      s.gdp       = Math.round(s.gdp * (1 + ev.gdp/100));
      s.happy     = clamp(s.happy + ev.happy, 0, 100);
      s.stability = clamp(s.stability + ev.stab, 0, 100);
      events.push({ icon:ev.icon, text:ev.text, type:'good' });
      logEvent(ev.icon, ev.text, 'good');
    }
  }

  // ── ERA CHANGE ──
  const era = getEra();
  if(era.name !== s.lastEra) {
    s.lastEra = era.name;
    events.push({ icon:'🕰️', text:`Entering the ${era.name}`, type:'era' });
    logEvent('🕰️', `Entering the ${era.name}`, 'era');
  }

  // ── COLLAPSE CHECK ──
  if(s.stability < 5 || s.pop < 1000) {
    collapse(s.stability < 5
      ? 'Political instability tore Varde apart. The government lost all control.'
      : 'Population collapsed — Varde was abandoned.', events);
  }
}

// ══════════════════════════════════════════════
//  CRISIS
// ══════════════════════════════════════════════
function triggerCrisis(crisis, events) {
  s.crisesHit.add(crisis.id);
  const fx = crisis.effects;
  s.gdp       = Math.round(s.gdp * (1 + fx.gdp/100));
  s.pop       = Math.round(s.pop * (1 + fx.pop/100));
  s.happy     = clamp(s.happy     + fx.happy,      0, 100);
  s.stability = clamp(s.stability + fx.stability,   0, 100);
  s.debt      = clamp(s.debt      + fx.debt,        0, 200);

  // Show banner
  const banner = document.getElementById('crisisBanner');
  document.getElementById('crisisIcon').textContent    = crisis.icon;
  document.getElementById('crisisTitle').textContent   = crisis.title;
  document.getElementById('crisisDesc').textContent    = crisis.desc;
  document.getElementById('crisisEffect').textContent  =
    `GDP ${fx.gdp}% | Happiness ${fx.happy>0?'+':''}${fx.happy} | Stability ${fx.stability>0?'+':''}${fx.stability} | Debt ${fx.debt>0?'+':''}${fx.debt}%`;
  banner.classList.remove('hidden');

  events.push({ icon:crisis.icon, text:`⚠️ CRISIS: ${crisis.title} — ${crisis.desc}`, type:'crisis' });
  logEvent(crisis.icon, `CRISIS: ${crisis.title} — ${crisis.desc}`, 'crisis');
}

// ══════════════════════════════════════════════
//  PERIOD SUMMARY BOX
// ══════════════════════════════════════════════
function showPeriodSummary(events, changes) {
  const box = document.getElementById('periodSummary');
  const d   = getCalDate();
  const prevD = simMode==='month'
    ? `${MONTH_NAMES[(d.month+11)%12]} ${d.month===0?d.year-1:d.year}`
    : `${d.year - 1}`;

  document.getElementById('periodTitle').textContent = simMode==='month'
    ? `📅 ${prevD} Summary`
    : `📅 Year ${d.year-1} Summary`;

  // Events
  const evEl = document.getElementById('periodEvents');
  evEl.innerHTML = '';
  if(events.length === 0) {
    evEl.innerHTML = '<div class="text-xs text-slate-500 italic">Quiet period — no major events.</div>';
  } else {
    events.forEach(ev => {
      const colors = { good:'text-emerald-300', crisis:'text-red-300', era:'text-violet-300', neutral:'text-slate-300' };
      evEl.innerHTML += `<div class="text-xs flex gap-2"><span>${ev.icon}</span><span class="${colors[ev.type]||colors.neutral}">${ev.text}</span></div>`;
    });
  }

  // Stat changes
  const chEl = document.getElementById('periodChanges');
  chEl.innerHTML = '';
  const allChanges = [
    { label:'GDP/cap',   val:fmtMoney(s.gdp),               color:'text-emerald-300' },
    { label:'Population',val:fmt(s.pop),                     color:'text-blue-300'    },
    { label:'Happiness', val:Math.round(s.happy)+'/100',     color:'text-yellow-300'  },
    { label:'Stability', val:Math.round(s.stability)+'/100', color:'text-violet-300'  },
    { label:'Debt/GDP',  val:Math.round(s.debt)+'%',         color:'text-rose-300'    },
    { label:'Trade',     val:Math.round(s.tradeScore||50)+'/100', color:'text-cyan-300' },
  ];
  allChanges.forEach(c => {
    chEl.innerHTML += `<div class="bg-black/20 rounded-xl p-2 flex justify-between items-center">
      <span class="text-xs text-slate-400">${c.label}</span>
      <span class="text-sm font-bold ${c.color}">${c.val}</span>
    </div>`;
  });

  box.classList.remove('hidden');
}

// ══════════════════════════════════════════════
//  COLLAPSE
// ══════════════════════════════════════════════
function collapse(reason, events) {
  s.collapsed = true;
  if(autoTimer) clearInterval(autoTimer);
  const d = getCalDate();
  document.getElementById('collapseCard').classList.remove('hidden');
  document.getElementById('collapseReason').innerHTML = reason +
    `<br><br>Varde lasted <strong>${s.year-1} years</strong> (until ${d.year}).<br>` +
    `Final GDP/cap: ${fmtMoney(s.gdp)} | Happiness: ${Math.round(s.happy)}/100 | Population: ${fmt(s.pop)}`;
  document.getElementById('collapseCard').scrollIntoView({ behavior:'smooth' });
}

// ══════════════════════════════════════════════
//  DISPLAY
// ══════════════════════════════════════════════
function updateDisplay() {
  const era = getEra();
  const d   = getCalDate();
  const prog = clamp((s.year-1)/simLen*100, 0, 100);

  document.getElementById('simDateDisplay').textContent = simMode==='month'
    ? `${MONTH_NAMES[d.month].slice(0,3)} ${d.year}`
    : `${d.year}`;
  document.getElementById('simProgress2').textContent    = `Year ${s.year} of ${simLen}`;
  document.getElementById('simProgressBar').style.width  = prog + '%';
  document.getElementById('eraLabel').textContent        = era.name;
  document.getElementById('eraLabel').className          = `text-xs mt-0.5 uppercase tracking-wider ${era.color}`;
  document.getElementById('leaderLabel').textContent     = s.leaderName ? `Led by ${s.leaderName}` : '';

  document.getElementById('sGDP').textContent    = fmtMoney(s.gdp);
  document.getElementById('sPop').textContent    = fmt(s.pop);
  document.getElementById('sHappy').textContent  = Math.round(s.happy)+'/100';
  document.getElementById('sStab').textContent   = Math.round(s.stability)+'/100';
  document.getElementById('sDebt').textContent   = Math.round(s.debt)+'%';
  document.getElementById('sMil').textContent    = p.military+'/20';
  document.getElementById('sEnv').textContent    = Math.round(s.envHealth||50)+'/100';
  document.getElementById('sTrade').textContent  = Math.round(s.tradeScore||50)+'/100';
}

// ══════════════════════════════════════════════
//  CHRONICLE
// ══════════════════════════════════════════════
function logEvent(icon, text, type) {
  const log = document.getElementById('chronicle');
  const colors = {
    good:    'bg-emerald-900/20 border-emerald-500/20',
    crisis:  'bg-red-900/20 border-red-500/30',
    era:     'bg-violet-900/20 border-violet-500/20',
    neutral: 'bg-white/5 border-white/10'
  };
  const d   = getCalDate();
  const lbl = simMode==='month' ? `${MONTH_NAMES[d.month].slice(0,3)} ${d.year}` : `${d.year}`;
  const el  = document.createElement('div');
  el.className = `flex gap-3 p-3 border ${colors[type]||colors.neutral} rounded-xl text-sm`;
  el.innerHTML = `<span class="text-lg shrink-0">${icon}</span><div><span class="text-xs font-mono text-slate-400">${lbl} — </span><span class="text-slate-200">${text}</span></div>`;
  log.insertBefore(el, log.firstChild);
}

// ══════════════════════════════════════════════
//  CHARTS
// ══════════════════════════════════════════════
function initCharts() {
  [
    { id:'chartGDP',   label:'💰 GDP per capita (€)',    color:'#34d399' },
    { id:'chartHappy', label:'😊 Happiness Index (0–100)', color:'#fbbf24' },
    { id:'chartStab',  label:'🏛️ Political Stability',   color:'#a78bfa' },
  ].forEach(({id,label,color}) => {
    const ctx = document.getElementById(id);
    if(charts[id]) charts[id].destroy();
    charts[id] = new Chart(ctx, {
      type:'line',
      data:{ labels:[], datasets:[{ data:[], borderColor:color, borderWidth:2, fill:true,
        backgroundColor:color+'18', tension:0.4, pointRadius:0 }] },
      options:{
        responsive:true, animation:false,
        plugins:{ legend:{display:false}, title:{display:true,text:label,color:'#94a3b8',font:{size:11}} },
        scales:{
          x:{ ticks:{color:'#475569',font:{size:9},maxTicksLimit:10}, grid:{color:'#ffffff05'} },
          y:{ ticks:{color:'#475569',font:{size:9}}, grid:{color:'#ffffff08'} }
        }
      }
    });
  });
}

function updateCharts() {
  [['chartGDP','gdp'],['chartHappy','happy'],['chartStab','stab']].forEach(([id,key]) => {
    charts[id].data.labels           = cd.labels;
    charts[id].data.datasets[0].data = cd[key];
    charts[id].update('none');
  });
}

// ══════════════════════════════════════════════
//  FINAL SCREEN
// ══════════════════════════════════════════════
function calcGrade() {
  const score = (s.gdp/1000)*0.25 + s.happy*0.35 + s.stability*0.25 + (100-s.debt)*0.15;
  if(score > 85) return { g:'S', c:'text-emerald-300', label:'Utopia — a model for all of humanity' };
  if(score > 70) return { g:'A', c:'text-lime-300',    label:'Exceptional — among the world\'s best nations' };
  if(score > 55) return { g:'B', c:'text-yellow-300',  label:'Solid governance — above average in most areas' };
  if(score > 40) return { g:'C', c:'text-orange-300',  label:'Struggling — major reforms urgently needed' };
  return                  { g:'F', c:'text-red-400',     label:'Failed state — collapse was narrowly avoided' };
}

function showFinal() {
  document.getElementById('finalCard').classList.remove('hidden');
  document.getElementById('finalCard').scrollIntoView({ behavior:'smooth' });
  const gr = calcGrade();
  const d  = getCalDate();
  document.getElementById('finalContent').innerHTML = `
    <div class="text-center py-4 space-y-1">
      <div class="text-7xl font-black ${gr.c}">${gr.g}</div>
      <div class="text-slate-300 font-semibold">${gr.label}</div>
      <div class="text-xs text-slate-500">${startCal} – ${d.year} (${simLen} years)</div>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-2xl font-black text-emerald-300">${fmtMoney(s.gdp)}</div>
        <div class="text-xs text-slate-400 mt-1">Final GDP/capita</div>
      </div>
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-2xl font-black text-yellow-300">${Math.round(s.happy)}/100</div>
        <div class="text-xs text-slate-400 mt-1">Final happiness</div>
      </div>
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-2xl font-black text-blue-300">${fmt(s.pop)}</div>
        <div class="text-xs text-slate-400 mt-1">Final population</div>
      </div>
      <div class="bg-white/5 rounded-2xl p-4 text-center">
        <div class="text-2xl font-black text-rose-300">${Math.round(s.debt)}%</div>
        <div class="text-xs text-slate-400 mt-1">Final debt/GDP</div>
      </div>
    </div>
    <div class="p-4 bg-white/5 rounded-2xl text-sm text-slate-300 leading-relaxed">
      <strong>${s.crisesHit.size}</strong> crises survived. <strong>${s.goodHit.size}</strong> positive milestones reached.
      Varde governed for ${simLen} years under <strong>${document.getElementById('govType').options[document.getElementById('govType').selectedIndex].text}</strong> rule.
    </div>`;
}

// ══════════════════════════════════════════════
//  SHARE
// ══════════════════════════════════════════════
function shareResult() {
  const gr = calcGrade();
  const d  = getCalDate();
  const text = `🏝️ Republic of Varde — Nation Simulator\n\n`
    + `Grade: ${gr.g} — ${gr.label}\n`
    + `📅 ${startCal}–${d.year} (${simLen} years)\n`
    + `💰 GDP: ${fmtMoney(s.gdp)} | 😊 Happiness: ${Math.round(s.happy)}/100\n`
    + `👥 Population: ${fmt(s.pop)} | 🏛️ Stability: ${Math.round(s.stability)}/100\n`
    + `⚠️ Crises survived: ${s.crisesHit.size}`;
  navigator.clipboard.writeText(text)
    .then(()  => alert('✅ Copied to clipboard!'))
    .catch(()  => prompt('Copy your result:', text));
}

// ══════════════════════════════════════════════
//  START / RESET
// ══════════════════════════════════════════════
function startSimulation() {
  simLen   = parseInt(document.getElementById('simLength').value);
  startCal = parseInt(document.getElementById('startYear').value);

  s = {
    year: 1, month: 1,
    gdp: 8000,
    pop: parseInt('500000'),
    happy: 45, stability: 60,
    debt: calcInitialDebt(),
    envHealth: 50, tradeScore: 50,
    collapsed: false, finished: false,
    crisesHit: new Set(), goodHit: new Set(),
    leaderName: document.getElementById('leaderName').value.trim(),
    lastEra: ''
  };
  cd = { labels:[], gdp:[], happy:[], stab:[] };

  document.getElementById('setupPanel').classList.add('hidden');
  document.getElementById('simPanel').classList.remove('hidden');
  document.getElementById('collapseCard').classList.add('hidden');
  document.getElementById('finalCard').classList.add('hidden');
  document.getElementById('crisisBanner').classList.add('hidden');
  document.getElementById('periodSummary').classList.add('hidden');
  document.getElementById('chronicle').innerHTML = '';

  setMode('month');
  setAuto(false);

  logEvent('🏝️', `The Republic of Varde declares independence. A new nation is born from the island of Saaremaa.`, 'era');
  if(s.leaderName) logEvent('👤', `${s.leaderName} elected as founding leader of Varde.`, 'neutral');
  initCharts();
  updateDisplay();
  updateNextBtn();
}

function resetSim() {
  if(autoTimer) clearInterval(autoTimer);
  autoPlay = false;
  document.getElementById('simPanel').classList.add('hidden');
  document.getElementById('setupPanel').classList.remove('hidden');
}

// ── INIT ──
buildSliders();
