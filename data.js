const SAAREMAA = {
  name: "Republic of Saaremaa",
  founded: 2026,
  population: 31000,
  area: 2673, // km²
  capital: "Kuressaare",
  currency: "Saare (SRK) — pegged 1:1 to EUR",
  flag: "🏝️",
};

const POLICIES = [
  {
    id: "tax",
    title: "0% income tax under €2,500/month — 15% above",
    source: "🇦🇪 UAE + 🇧🇭 Bahrain",
    fact: "UAE has 0% income tax. Bahrain kept it simple. Both attract talent globally.",
    year: 1,
    icon: "💰"
  },
  {
    id: "corporate",
    title: "0% corporate tax on reinvested profits — 15% on dividends only",
    source: "🇮🇪 Ireland adapted",
    fact: "Ireland's 12.5% corporate tax attracted Google, Apple, Meta. Saaremaa goes further — reinvest and pay nothing.",
    year: 1,
    icon: "🏢"
  },
  {
    id: "ubi",
    title: "Universal Basic Income — €800/month for every citizen",
    source: "🇫🇮 Finland + 🇳🇴 Norway",
    fact: "Finland's UBI pilot showed recipients had better mental health, more entrepreneurship, and same employment rates.",
    year: 1,
    icon: "💸"
  },
  {
    id: "healthcare",
    title: "Universal healthcare — single payer, fully public",
    source: "🇹🇼 Taiwan",
    fact: "Taiwan's single-payer covers 99.9% of citizens at 6.6% of GDP — half what the US spends for worse outcomes.",
    year: 2,
    icon: "🏥"
  },
  {
    id: "education",
    title: "Free education — kindergarten through university",
    source: "🇩🇪 Germany + 🇩🇰 Denmark",
    fact: "Germany abolished university fees in 2014. Graduate debt dropped to zero. International applications tripled.",
    year: 2,
    icon: "🎓"
  },
  {
    id: "housing",
    title: "Public housing — 70% state-built, sold at cost price",
    source: "🇸🇬 Singapore",
    fact: "Singapore's HDB scheme means 89% of citizens OWN their home. Homelessness is functionally zero.",
    year: 2,
    icon: "🏠"
  },
  {
    id: "banking",
    title: "Public non-profit bank — no fees, no minimum balance",
    source: "🇩🇪 Sparkasse model",
    fact: "Germany's Sparkasse banks return profits to communities. Zero fees. 100% financial inclusion.",
    year: 3,
    icon: "🏦"
  },
  {
    id: "privacy",
    title: "Constitutional right to privacy — strongest in the world",
    source: "🇨🇭 Switzerland + 🇩🇪 Germany",
    fact: "Switzerland's banking secrecy and Germany's post-Nazi privacy laws are the gold standard. Saaremaa goes further — you OWN your data.",
    year: 3,
    icon: "🔐"
  },
  {
    id: "egov",
    title: "Full e-government — company in 18 mins, taxes auto-filed",
    source: "🇪🇪 Estonia 1.0",
    fact: "Estonia's e-government saves citizens 5 working days per year in paperwork. 99% of services are online.",
    year: 3,
    icon: "💻"
  },
  {
    id: "workweek",
    title: "4-day work week — 32 hours, same pay",
    source: "🇮🇸 Iceland",
    fact: "Iceland's 4-day week trials (2015–2019) showed same or better productivity. 86% of workforce now on reduced hours.",
    year: 4,
    icon: "📅"
  },
  {
    id: "immigration",
    title: "Open skilled immigration — citizenship in 5 years",
    source: "🇨🇦 Canada points system",
    fact: "Canada's points-based immigration fuels 400k+ skilled arrivals yearly. GDP per capita grows 1.5% faster than US.",
    year: 4,
    icon: "🌍"
  },
  {
    id: "energy",
    title: "100% renewable energy — wind + solar + tidal",
    source: "🇮🇸 Iceland + 🇩🇰 Denmark",
    fact: "Denmark hit 53% wind energy in 2022. Iceland runs on 100% renewable. Saaremaa has Baltic wind + tidal potential.",
    year: 4,
    icon: "🌿"
  },
  {
    id: "drugs",
    title: "Full drug decriminalization + regulated cannabis",
    source: "🇵🇹 Portugal",
    fact: "Portugal decriminalized all drugs in 2001. Drug deaths fell 80%. HIV infections fell 95%. Prison costs halved.",
    year: 5,
    icon: "⚕️"
  },
  {
    id: "wealth",
    title: "Sovereign wealth fund — 30% of all tax revenue invested",
    source: "🇳🇴 Norway",
    fact: "Norway's $1.4 trillion oil fund means every citizen owns $250,000 in assets. Funded by extracting value from the economy.",
    year: 5,
    icon: "📈"
  },
  {
    id: "wages",
    title: "Max wage ratio — CEO earns max 20x lowest paid employee",
    source: "🇨🇭 Switzerland referendum",
    fact: "Swiss voters nearly passed a 12:1 cap in 2013. Countries with lower wage ratios have higher happiness + lower crime.",
    year: 6,
    icon: "⚖️"
  },
  {
    id: "parental",
    title: "18 months paid parental leave — split between parents",
    source: "🇸🇪 Sweden",
    fact: "Sweden's parental leave system leads to highest female workforce participation + best child development outcomes globally.",
    year: 6,
    icon: "👶"
  },
  {
    id: "mental",
    title: "Free mental health care — therapy for all, no waitlist",
    source: "🇮🇸 Iceland",
    fact: "Iceland has lowest depression rates in Europe. Investment in mental health returns €4 for every €1 spent.",
    year: 7,
    icon: "🧠"
  },
  {
    id: "eresidency",
    title: "e-Residency 2.0 — run a Saaremaa company from anywhere",
    source: "🇪🇪 Estonia improved",
    fact: "Estonia's e-residency program added €1.8B to its economy from non-resident companies. Saaremaa's version has zero corporate tax on reinvested profits.",
    year: 7,
    icon: "🌐"
  },
  {
    id: "voting",
    title: "Ranked choice voting + citizens assembly",
    source: "🇮🇪 Ireland",
    fact: "Ireland's citizens assemblies solved abortion, same-sex marriage, and climate — issues politicians couldn't touch. RCV eliminates tactical voting.",
    year: 8,
    icon: "🗳️"
  },
  {
    id: "startup",
    title: "Public startup fund — 0% interest loans, equity model",
    source: "🇮🇱 Israel",
    fact: "Israel's Yozma program in the 1990s created the world's highest startup density per capita. Government takes equity, not interest.",
    year: 8,
    icon: "🚀"
  },
];

const EVENTS = [
  { year: 2,  text: "First international tech company registers via e-Residency. 340 jobs created.", stat: "gdp", delta: 3,  icon: "💻" },
  { year: 3,  text: "Finland sends healthcare advisors. First public hospital opens in Kuressaare.", stat: "happy", delta: 5, icon: "🏥" },
  { year: 4,  text: "Housing waitlist clears — 2,100 families moved into affordable homes.", stat: "happy", delta: 7, icon: "🏠" },
  { year: 4,  text: "First sovereign wealth fund dividend paid — €240/citizen.", stat: "happy", delta: 4, icon: "💰" },
  { year: 5,  text: "Population hits 38,000. Skilled immigrants arriving at 800/year.", stat: "pop", delta: 8, icon: "🌍" },
  { year: 5,  text: "Drug decriminalization passes. Police redirect to violent crime. Crime down 31%.", stat: "happy", delta: 6, icon: "⚕️" },
  { year: 6,  text: "Saaremaa ranked #1 in Europe for startup density per capita.", stat: "gdp", delta: 8, icon: "🚀" },
  { year: 7,  text: "100% renewable energy achieved. Selling surplus to Latvia via undersea cable.", stat: "gdp", delta: 5, icon: "🌿" },
  { year: 7,  text: "UN Human Development report: Saaremaa enters top 10 globally.", stat: "happy", delta: 8, icon: "🏆" },
  { year: 8,  text: "Zero homelessness declared. Last shelter closes — converted to co-working space.", stat: "happy", delta: 10, icon: "🏘️" },
  { year: 9,  text: "e-Residency reaches 50,000 non-resident companies. Tax revenue +€180M.", stat: "gdp", delta: 12, icon: "🌐" },
  { year: 10, text: "GDP per capita crosses €40,000 — surpassing Estonia, Latvia and Lithuania.", stat: "gdp", delta: 10, icon: "📈" },
  { year: 11, text: "Mental health crisis rate falls to lowest in Europe. Iceland model validated.", stat: "happy", delta: 6, icon: "🧠" },
  { year: 12, text: "4-day work week productivity study published: Saaremaa workers 22% more productive than EU average.", stat: "gdp", delta: 5, icon: "📅" },
  { year: 13, text: "Sovereign wealth fund hits €2.1B. Annual citizen dividend raised to €800.", stat: "happy", delta: 8, icon: "💸" },
  { year: 14, text: "First Saare-born unicorn startup — logistics AI company valued at €1.4B.", stat: "gdp", delta: 10, icon: "🦄" },
  { year: 15, text: "Population 61,000. Birth rate highest in Europe — families can afford children.", stat: "pop", delta: 12, icon: "👶" },
  { year: 16, text: "World Happiness Report: Saaremaa ranks #2 globally, behind only Finland.", stat: "happy", delta: 10, icon: "😊" },
  { year: 18, text: "Baltic Sea clean energy corridor launches — Saaremaa as hub. €400M in contracts.", stat: "gdp", delta: 14, icon: "⚡" },
  { year: 20, text: "GDP per capita €67,000 — top 5 in the world. Population 85,000.", stat: "gdp", delta: 8, icon: "🏆" },
];

const WORLD_COMPARISON = [
  { name: "Luxembourg",   gdp: 128820, happy: 73 },
  { name: "Switzerland",  gdp: 98767,  happy: 78 },
  { name: "Norway",       gdp: 89154,  happy: 79 },
  { name: "USA",          gdp: 76329,  happy: 68 },
  { name: "Denmark",      gdp: 67984,  happy: 82 },
  { name: "Saaremaa 🏝️", gdp: 67000,  happy: 91 },
  { name: "Sweden",       gdp: 61867,  happy: 80 },
  { name: "Finland",      gdp: 53654,  happy: 83 },
  { name: "Germany",      gdp: 48717,  happy: 72 },
  { name: "Estonia",      gdp: 28765,  happy: 62 },
  { name: "Latvia",       gdp: 22531,  happy: 58 },
];
