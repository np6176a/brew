/* ============================================
   BREW — Barista Bar (game)
   Customer orders → pick beans → build ratio → score
   ============================================ */

// ---------- Data ----------

const BEANS = [
  {
    id: 'ethiopia',
    origin: 'Ethiopia',
    flavor: 'fruity & bright',
    notes: 'citrus, jasmine, stone fruit',
    color: '#B5552E'
  },
  {
    id: 'colombia',
    origin: 'Colombia',
    flavor: 'balanced & sweet',
    notes: 'red apple, brown sugar, cocoa',
    color: '#C89968'
  },
  {
    id: 'brazil',
    origin: 'Brazil',
    flavor: 'nutty & smooth',
    notes: 'chocolate, hazelnut, caramel',
    color: '#7A5C3F'
  },
  {
    id: 'sumatra',
    origin: 'Sumatra',
    flavor: 'earthy & full',
    notes: 'cedar, dark chocolate, tobacco',
    color: '#3B2418'
  }
];

// Recipes are described in "parts" — the way baristas actually think.
const RECIPES = {
  espresso: {
    name: 'espresso',
    parts: { espresso: 1 },
    blurb: 'A single shot. Pure espresso, nothing else.'
  },
  americano: {
    name: 'americano',
    parts: { espresso: 1, water: 2 },
    blurb: '1 part espresso to about 2 parts hot water.'
  },
  cappuccino: {
    name: 'cappuccino',
    parts: { espresso: 1, milk: 1, foam: 1 },
    blurb: 'Equal thirds: espresso, steamed milk, foam.'
  },
  latte: {
    name: 'latte',
    parts: { espresso: 1, milk: 3, foam: 1 },
    blurb: 'Mostly milk — a thin foam cap.'
  },
  macchiato: {
    name: 'macchiato',
    parts: { espresso: 2, foam: 1 },
    blurb: 'Espresso "marked" with a dab of foam.'
  }
};

const INGREDIENTS = [
  { id: 'espresso', name: 'Espresso',     hint: 'concentrated coffee',   color: '#3B2418' },
  { id: 'milk',     name: 'Steamed milk', hint: 'silky, sweet, hot',     color: '#F5EFE4' },
  { id: 'foam',     name: 'Foam',         hint: 'airy microfoam',        color: '#FAF6EE' },
  { id: 'water',    name: 'Hot water',    hint: 'dilutes & lengthens',   color: '#B6C9D2' },
  { id: 'syrup',    name: 'Syrup',        hint: 'optional sweetness',    color: '#C89968' }
];

// 8 customers — 5 will be drawn per shift.
const CUSTOMERS = [
  { name: 'Marisol',  drink: 'latte',      bean: 'ethiopia', line: "I'd love a latte today — something fruity and bright." },
  { name: 'Devon',    drink: 'cappuccino', bean: 'brazil',   line: "A cappuccino, please. Make it nutty and smooth." },
  { name: 'Ahmet',    drink: 'espresso',   bean: 'colombia', line: "Just an espresso. Caramel notes if you can." },
  { name: 'Priya',    drink: 'americano',  bean: 'sumatra',  line: "Americano. Earthy and bold — wake me up." },
  { name: 'Jules',    drink: 'macchiato',  bean: 'ethiopia', line: "Macchiato, surprise me — bright and floral." },
  { name: 'Tomás',    drink: 'latte',      bean: 'sumatra',  line: "A latte, but make it earthy. Full-bodied." },
  { name: 'Beatrice', drink: 'cappuccino', bean: 'colombia', line: "Cappuccino — balanced, sweet, a little cocoa." },
  { name: 'Wren',     drink: 'americano',  bean: 'brazil',   line: "Americano. Deep, chocolatey, a little nutty." }
];

const COACH_TIPS = {
  intro: "Welcome to the bar. Read the order, pick your beans, build the drink.",
  ratioOff: "The ratio matters more than the ingredients. A latte is mostly milk — try about 1:3.",
  beanOff: "Re-read the customer's flavor cue and match it to a bean's profile.",
  perfect: "That's the bar. Keep that shape — same beans, same ratios.",
  empty: "Add at least one part of an ingredient before serving."
};

const SHIFT_LENGTH = 5;

// ---------- State ----------

const state = {
  beans: 0,
  customerIndex: 0,
  shiftCustomers: [],
  selectedBean: null,
  build: {},      // ingredient id → parts
  served: false
};

// ---------- DOM ----------

const $ = (id) => document.getElementById(id);
const beanCountEl = $('beanCount');
const customerNumberEl = $('customerNumber');
const customerTotalEl = $('customerTotal');
const customerNameEl = $('customerName');
const customerLineEl = $('customerLine');
const customerCard = $('customerCard');
const beanGrid = $('beanGrid');
const ingredientList = $('ingredientList');
const cupLayers = $('cupLayers');
const cupCaption = $('cupCaption');
const serveButton = $('serveButton');
const resetCupButton = $('resetCupButton');
const resultOverlay = $('resultOverlay');
const resultBadge = $('resultBadge');
const resultTitle = $('resultTitle');
const resultLine = $('resultLine');
const resultPoints = $('resultPoints');
const nextCustomerButton = $('nextCustomerButton');
const shiftOverlay = $('shiftOverlay');
const shiftBeansEl = $('shiftBeans');
const shiftCustomersEl = $('shiftCustomers');
const shiftRankEl = $('shiftRank');
const newShiftButton = $('newShiftButton');
const coachPip = $('coachPip');
const coachLine = $('coachLine');

// ---------- Helpers ----------

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const sumValues = (obj) =>
  Object.values(obj).reduce((acc, v) => acc + v, 0);

const showCoach = (line) => {
  coachLine.textContent = line;
  coachPip.classList.add('visible');
};

const hideCoach = () => coachPip.classList.remove('visible');

// ---------- Render: bean grid ----------

const renderBeans = () => {
  beanGrid.innerHTML = '';
  BEANS.forEach((bean) => {
    const card = document.createElement('button');
    card.className = 'bean-card';
    card.type = 'button';
    card.dataset.beanId = bean.id;
    card.innerHTML = `
      <span class="bean-origin">${bean.origin}</span>
      <span class="bean-flavor">${bean.flavor}</span>
      <span class="bean-notes">${bean.notes}</span>
    `;
    card.addEventListener('click', () => selectBean(bean.id));
    beanGrid.appendChild(card);
  });
};

const selectBean = (id) => {
  state.selectedBean = id;
  beanGrid.querySelectorAll('.bean-card').forEach((el) => {
    el.classList.toggle('selected', el.dataset.beanId === id);
  });
  updateServeEnabled();
};

// ---------- Render: ingredient list ----------

const renderIngredients = () => {
  ingredientList.innerHTML = '';
  INGREDIENTS.forEach((ing) => {
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.innerHTML = `
      <span class="ingredient-swatch" style="background:${ing.color}"></span>
      <span class="ingredient-info">
        <span class="ingredient-name">${ing.name}</span>
        <span class="ingredient-hint">${ing.hint}</span>
      </span>
      <span class="parts-control">
        <button class="parts-button" type="button" data-action="dec" data-ing="${ing.id}" aria-label="Less ${ing.name}">−</button>
        <span class="parts-value" data-value="${ing.id}">0</span>
        <span class="parts-unit">parts</span>
        <button class="parts-button" type="button" data-action="inc" data-ing="${ing.id}" aria-label="More ${ing.name}">+</button>
      </span>
    `;
    ingredientList.appendChild(row);
  });

  ingredientList.addEventListener('click', (e) => {
    const btn = e.target.closest('.parts-button');
    if (!btn) return;
    const id = btn.dataset.ing;
    const action = btn.dataset.action;
    const current = state.build[id] || 0;
    if (action === 'inc') state.build[id] = Math.min(current + 1, 8);
    if (action === 'dec') state.build[id] = Math.max(current - 1, 0);
    if (state.build[id] === 0) delete state.build[id];
    renderBuild();
  });
};

const renderBuild = () => {
  // Update part counters
  INGREDIENTS.forEach((ing) => {
    const el = ingredientList.querySelector(`[data-value="${ing.id}"]`);
    if (el) el.textContent = state.build[ing.id] || 0;
  });
  renderCup();
  updateServeEnabled();
};

// ---------- Render: cup ----------

const renderCup = () => {
  cupLayers.innerHTML = '';
  const total = sumValues(state.build);

  if (total === 0) {
    cupCaption.textContent = 'Empty cup';
    return;
  }

  const cupTop = 43;
  const cupBottom = 187;
  const cupHeight = cupBottom - cupTop;

  // Order layers from heaviest at bottom to lightest at top:
  // espresso → water → milk → syrup → foam
  const order = ['espresso', 'water', 'syrup', 'milk', 'foam'];
  let cursorY = cupBottom;

  order.forEach((id) => {
    const parts = state.build[id];
    if (!parts) return;
    const ing = INGREDIENTS.find((i) => i.id === id);
    const layerHeight = (parts / total) * cupHeight;
    const y = cursorY - layerHeight;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '30');
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', '100');
    rect.setAttribute('height', String(layerHeight));
    rect.setAttribute('fill', ing.color);
    cupLayers.appendChild(rect);
    cursorY = y;
  });

  // Caption summarizes the build as a ratio
  const summary = INGREDIENTS
    .filter((ing) => state.build[ing.id])
    .map((ing) => `${state.build[ing.id]} ${ing.name.toLowerCase()}`)
    .join(' · ');
  cupCaption.textContent = summary;
};

// ---------- Serve gating ----------

const updateServeEnabled = () => {
  const hasIngredients = sumValues(state.build) > 0;
  const hasBean = !!state.selectedBean;
  serveButton.disabled = !(hasIngredients && hasBean) || state.served;
};

// ---------- Scoring ----------

// Compare actual build to target recipe.
// Distance = total absolute difference between target and actual proportions, halved
// (so it lives in 0..1 where 0 = exact match).
const ratioDistance = (actual, target) => {
  const allKeys = new Set([...Object.keys(actual), ...Object.keys(target)]);
  const actualTotal = sumValues(actual) || 1;
  const targetTotal = sumValues(target) || 1;

  let diff = 0;
  allKeys.forEach((k) => {
    const a = (actual[k] || 0) / actualTotal;
    const t = (target[k] || 0) / targetTotal;
    diff += Math.abs(a - t);
  });
  return diff / 2; // 0 = perfect, 1 = no overlap at all
};

// Returns { points, tier, line }
const scoreRound = (customer) => {
  const recipe = RECIPES[customer.drink];
  const dist = ratioDistance(state.build, recipe.parts);
  const beanRight = state.selectedBean === customer.bean;
  const customerBean = BEANS.find((b) => b.id === customer.bean);
  const orderedBean = BEANS.find((b) => b.id === state.selectedBean);

  // Tiered scoring
  let points = 0;
  let tier = 'off';
  let line = '';

  if (beanRight && dist < 0.12) {
    points = 100;
    tier = 'perfect';
    line = `${customer.name} sips and smiles. "Exactly what I wanted — that ${recipe.name} is dialed in."`;
  } else if (beanRight && dist < 0.28) {
    points = 65;
    tier = 'good';
    line = `${customer.name} nods. "Right beans. The ratio's close — a touch off, but I'll take it." (${recipe.blurb})`;
  } else if (!beanRight && dist < 0.18) {
    points = 45;
    tier = 'fair';
    line = `${customer.name} pauses. "The ${recipe.name} itself is well-made, but I asked for ${customerBean.flavor} — these ${orderedBean ? orderedBean.origin : 'beans'} aren't it."`;
  } else if (beanRight && dist < 0.5) {
    points = 25;
    tier = 'fair';
    line = `${customer.name} hesitates. "Beans are right, but the ratio's noticeably off. ${recipe.blurb}"`;
  } else {
    points = 8;
    tier = 'off';
    line = `${customer.name} sets it down politely. "Not quite what I asked for. ${recipe.blurb} And I wanted ${customerBean.flavor} beans."`;
  }

  return { points, tier, line, recipe };
};

// ---------- Round flow ----------

const startShift = () => {
  state.beans = 0;
  state.customerIndex = 0;
  state.shiftCustomers = shuffle(CUSTOMERS).slice(0, SHIFT_LENGTH);
  beanCountEl.textContent = '0';
  customerTotalEl.textContent = String(SHIFT_LENGTH);
  shiftOverlay.hidden = true;
  resultOverlay.hidden = true;
  showCoach(COACH_TIPS.intro);
  setTimeout(hideCoach, 5000);
  loadCustomer();
};

const loadCustomer = () => {
  state.selectedBean = null;
  state.build = {};
  state.served = false;

  const customer = state.shiftCustomers[state.customerIndex];
  customerNumberEl.textContent = String(state.customerIndex + 1);
  customerNameEl.textContent = customer.name;
  customerLineEl.textContent = `"${customer.line}"`;

  // Slide-in animation
  customerCard.classList.remove('entered');
  void customerCard.offsetWidth; // restart transition
  requestAnimationFrame(() => customerCard.classList.add('entered'));

  // Reset stations
  beanGrid.querySelectorAll('.bean-card').forEach((el) => {
    el.classList.remove('selected');
    el.disabled = false;
  });
  renderBuild();
};

const handleServe = () => {
  if (sumValues(state.build) === 0) {
    showCoach(COACH_TIPS.empty);
    return;
  }
  state.served = true;
  serveButton.disabled = true;

  const customer = state.shiftCustomers[state.customerIndex];
  const result = scoreRound(customer);

  // Award points with bump animation
  state.beans += result.points;
  beanCountEl.textContent = String(state.beans);
  beanCountEl.classList.add('bump');
  setTimeout(() => beanCountEl.classList.remove('bump'), 280);

  // Show result overlay
  resultBadge.textContent =
    result.tier === 'perfect' ? 'Perfect pour' :
    result.tier === 'good'    ? 'Solid drink'  :
    result.tier === 'fair'    ? 'Close, not quite' :
                                'Off the mark';
  resultTitle.textContent = `${customer.name}'s ${result.recipe.name}`;
  resultLine.textContent = result.line;
  resultPoints.textContent = String(result.points);
  resultOverlay.hidden = false;

  // Coach tip if they missed
  if (result.tier === 'perfect') {
    showCoach(COACH_TIPS.perfect);
  } else if (state.selectedBean !== customer.bean) {
    showCoach(COACH_TIPS.beanOff);
  } else {
    showCoach(COACH_TIPS.ratioOff);
  }
  setTimeout(hideCoach, 6000);
};

const advance = () => {
  resultOverlay.hidden = true;
  state.customerIndex += 1;
  if (state.customerIndex >= SHIFT_LENGTH) {
    endShift();
  } else {
    loadCustomer();
  }
};

const rankFor = (beans) => {
  if (beans >= 420) return "Head-barista material. Wren's impressed.";
  if (beans >= 300) return "A solid shift — drinks went out clean.";
  if (beans >= 180) return "You held the bar. Room to grow on the ratios.";
  return "Rough shift. Re-read the guide and run it again.";
};

const endShift = () => {
  shiftBeansEl.textContent = String(state.beans);
  shiftCustomersEl.textContent = String(SHIFT_LENGTH);
  shiftRankEl.textContent = rankFor(state.beans);
  shiftOverlay.hidden = false;
};

// ---------- Wire up ----------

resetCupButton.addEventListener('click', () => {
  state.build = {};
  renderBuild();
});

serveButton.addEventListener('click', handleServe);
nextCustomerButton.addEventListener('click', advance);
newShiftButton.addEventListener('click', startShift);

// Keyboard: Enter advances result overlay
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (!resultOverlay.hidden) advance();
    else if (!shiftOverlay.hidden) startShift();
  }
});

// ---------- Intro modal ----------

const introOverlay = $('introOverlay');
const startShiftButton = $('startShiftButton');

const beginGame = () => {
  introOverlay.classList.add('dismissed');
  try { sessionStorage.setItem('brewIntroSeen', '1'); } catch (_) {}
  startShift();
};

startShiftButton.addEventListener('click', beginGame);

// ---------- Init ----------

renderBeans();
renderIngredients();
renderBuild();

const introSeen = (() => {
  try { return sessionStorage.getItem('brewIntroSeen') === '1'; }
  catch (_) { return false; }
})();

if (introSeen) {
  introOverlay.classList.add('dismissed');
  startShift();
}
