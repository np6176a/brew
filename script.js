/* ============================================
   BREW — Game Logic
   ============================================ */

// ==========================================
// NAVIGATION
// ==========================================
const screens = document.querySelectorAll('.screen');
const totalScreens = screens.length;
const progressFill = document.getElementById('progressFill');
const currentScreenEl = document.getElementById('currentScreen');
const totalScreensEl = document.getElementById('totalScreens');
const backButton = document.getElementById('backButton');
const nextButton = document.getElementById('nextButton');

let currentScreen = 1;
totalScreensEl.textContent = totalScreens;

function showScreen(n) {
  screens.forEach((s) => s.classList.remove('active'));
  const target = document.querySelector(`.screen[data-screen="${n}"]`);
  if (target) target.classList.add('active');

  currentScreen = n;
  currentScreenEl.textContent = n;
  progressFill.style.width = `${(n / totalScreens) * 100}%`;

  backButton.disabled = n === 1;
  nextButton.textContent = n === totalScreens ? 'Finish' : 'Next →';

  // Trigger screen-specific behavior
  if (n === 2) animateMap();
}

backButton.addEventListener('click', () => {
  if (currentScreen > 1) showScreen(currentScreen - 1);
});

nextButton.addEventListener('click', () => {
  if (currentScreen < totalScreens) {
    showScreen(currentScreen + 1);
  } else {
    // Finish — restart
    showScreen(1);
  }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' && currentScreen < totalScreens) {
    showScreen(currentScreen + 1);
  } else if (e.key === 'ArrowLeft' && currentScreen > 1) {
    showScreen(currentScreen - 1);
  }
});

// ==========================================
// KNOWLEDGE CHECKS
// ==========================================
const correctResponses = [
  "Right. The first wave was about scale and convenience — coffee for everyone, everywhere.",
  "Exactly. Third-wave cafes treat coffee like wine — with attention to origin, varietal, and craft."
];

const incorrectResponses = [
  "Not quite. The first wave was mass-produced coffee built for shelf life and convenience.",
  "Not quite. Third-wave coffee is about traceability, light roasts, and showcasing single origins."
];

document.querySelectorAll('.knowledge-check').forEach((check) => {
  const checkNum = parseInt(check.dataset.check, 10);
  const options = check.querySelectorAll('.option');
  const feedback = document.getElementById(`feedback-${checkNum}`);

  options.forEach((opt) => {
    opt.addEventListener('click', () => {
      const isCorrect = opt.dataset.correct === 'true';
      options.forEach((o) => {
        o.disabled = true;
        if (o.dataset.correct === 'true') o.classList.add('correct');
      });
      if (!isCorrect) opt.classList.add('incorrect');
      feedback.textContent = isCorrect
        ? correctResponses[checkNum - 1]
        : incorrectResponses[checkNum - 1];
    });
  });
});

// ==========================================
// MAP ANIMATION (Screen 2)
// ==========================================
function animateMap() {
  const path = document.getElementById('journeyPath');
  const stops = document.querySelectorAll('.stop');
  const label = document.getElementById('mapLabel');
  if (!path) return;

  // Reset
  path.classList.remove('animate');
  stops.forEach((s) => s.classList.remove('show'));
  void path.offsetWidth; // reflow

  // Animate path
  path.classList.add('animate');

  // Pop stops in sequence with labels
  stops.forEach((stop, i) => {
    setTimeout(() => {
      stop.classList.add('show');
      label.textContent = stop.dataset.label;
    }, i * 1000);
  });
}

document.getElementById('replayMap')?.addEventListener('click', animateMap);

// ==========================================
// BREW LAB (Screen 6)
// ==========================================
const labState = {
  origin: 'ethiopia',
  roast: 'light',
  grind: 'medium',
  method: 'pourover'
};

// Origin profiles — base flavor character
const originProfiles = {
  ethiopia:  { acidity: 80, body: 30, sweet: 60, bitter: 25, name: 'bright & floral',
               notes: 'citrus, jasmine, stone fruit' },
  brazil:    { acidity: 35, body: 65, sweet: 75, bitter: 40, name: 'nutty & smooth',
               notes: 'chocolate, hazelnut, caramel' },
  colombia:  { acidity: 55, body: 55, sweet: 65, bitter: 35, name: 'balanced & sweet',
               notes: 'red apple, brown sugar, cocoa' },
  sumatra:   { acidity: 25, body: 80, sweet: 50, bitter: 50, name: 'earthy & full',
               notes: 'cedar, dark chocolate, tobacco' }
};

// Roast modifiers
const roastMods = {
  light:  { acidity: +10, body: -10, sweet: 0,  bitter: -10 },
  medium: { acidity: 0,   body: 0,   sweet: +5, bitter: 0 },
  dark:   { acidity: -20, body: +15, sweet: -5, bitter: +25 }
};

// Method modifiers
const methodMods = {
  espresso:    { acidity: +5,  body: +20, sweet: 0,   bitter: +15 },
  pourover:    { acidity: +10, body: -15, sweet: +5,  bitter: -5 },
  frenchpress: { acidity: 0,   body: +20, sweet: 0,   bitter: +5 },
  aeropress:   { acidity: +5,  body: 0,   sweet: +5,  bitter: -5 }
};

// Grind/method compatibility — gives a hint when mismatched
const grindFit = {
  espresso: 'fine',
  pourover: 'medium',
  frenchpress: 'coarse',
  aeropress: 'medium'
};

function clamp(n) { return Math.max(5, Math.min(95, n)); }

function updateLab() {
  const origin = originProfiles[labState.origin];
  const roast = roastMods[labState.roast];
  const method = methodMods[labState.method];

  const acidity = clamp(origin.acidity + roast.acidity + method.acidity);
  const body    = clamp(origin.body    + roast.body    + method.body);
  const sweet   = clamp(origin.sweet   + roast.sweet   + method.sweet);
  const bitter  = clamp(origin.bitter  + roast.bitter  + method.bitter);

  document.getElementById('bar-acidity').style.width = `${acidity}%`;
  document.getElementById('bar-body').style.width    = `${body}%`;
  document.getElementById('bar-sweet').style.width   = `${sweet}%`;
  document.getElementById('bar-bitter').style.width  = `${bitter}%`;

  // Title
  let title = origin.name.charAt(0).toUpperCase() + origin.name.slice(1);
  if (labState.roast === 'dark') title = 'Bold & roasty';
  if (labState.method === 'espresso') title += ', concentrated';

  document.getElementById('resultTitle').textContent = title;

  // Description
  const grindMatch = grindFit[labState.method];
  const grindWarn = labState.grind !== grindMatch
    ? ` Heads up — ${grindMatch} grind tends to work best for ${labState.method}; your current grind may over- or under-extract.`
    : '';

  const desc = `A ${labState.roast}-roasted ${capitalize(labState.origin)} brewed as ${formatMethod(labState.method)}. Expect notes of ${origin.notes}.${grindWarn}`;

  document.getElementById('resultDesc').textContent = desc;
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function formatMethod(m) {
  return { espresso: 'espresso', pourover: 'a pour-over', frenchpress: 'a French press', aeropress: 'an AeroPress' }[m];
}

document.querySelectorAll('.chip-group').forEach((group) => {
  const control = group.dataset.control;
  group.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      group.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      labState[control] = chip.dataset.value;
      updateLab();
    });
  });
});

// Initial
updateLab();

// ==========================================
// TASTING MATCH GAME (Screen 7)
// ==========================================
const matchPairs = [
  { term: 'Acidity',    desc: 'Bright, lively, tongue-tingling — like biting into an apple' },
  { term: 'Body',       desc: 'How heavy or thin the coffee feels in your mouth' },
  { term: 'Sweetness',  desc: 'Natural sugar character — caramel, fruit, honey' },
  { term: 'Bitterness', desc: 'Sharp, often from over-extraction or dark roasts' }
];

const matchGrid = document.getElementById('matchGrid');
const matchFeedback = document.getElementById('matchFeedback');

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function renderMatchGame() {
  matchGrid.innerHTML = '';
  matchFeedback.textContent = '';

  const terms = shuffle(matchPairs.map((p) => ({ type: 'term', value: p.term })));
  const descs = shuffle(matchPairs.map((p) => ({ type: 'desc', value: p.desc, term: p.term })));

  // Interleave into the grid: term, desc, term, desc...
  // For variety, just put all terms in left col, descs right col
  const items = [];
  for (let i = 0; i < matchPairs.length; i++) {
    items.push(terms[i]);
    items.push(descs[i]);
  }

  items.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = 'match-item' + (item.type === 'term' ? ' term' : '');
    btn.textContent = item.value;
    btn.dataset.type = item.type;
    btn.dataset.value = item.type === 'term' ? item.value : item.term;
    btn.addEventListener('click', () => handleMatchClick(btn));
    matchGrid.appendChild(btn);
  });
}

let selectedMatch = null;
let matchedCount = 0;

function handleMatchClick(btn) {
  if (btn.classList.contains('matched')) return;

  if (!selectedMatch) {
    selectedMatch = btn;
    btn.classList.add('selected');
    return;
  }

  if (selectedMatch === btn) {
    btn.classList.remove('selected');
    selectedMatch = null;
    return;
  }

  // Need one term + one desc, both pointing to same value
  const a = selectedMatch;
  const b = btn;
  const isPair = a.dataset.type !== b.dataset.type && a.dataset.value === b.dataset.value;

  if (isPair) {
    a.classList.remove('selected');
    a.classList.add('matched');
    b.classList.add('matched');
    matchedCount++;
    selectedMatch = null;
    if (matchedCount === matchPairs.length) {
      matchFeedback.textContent = 'You\'ve got the vocabulary down. Now go drink something good.';
    } else {
      matchFeedback.textContent = `${matchedCount} of ${matchPairs.length} matched.`;
    }
  } else {
    // Wrong — flash and reset
    a.classList.remove('selected');
    b.classList.add('selected');
    setTimeout(() => {
      b.classList.remove('selected');
    }, 400);
    selectedMatch = null;
    matchFeedback.textContent = 'Not quite — try another pairing.';
  }
}

renderMatchGame();

// Restart button
document.getElementById('restartButton')?.addEventListener('click', () => {
  // Reset game state
  document.querySelectorAll('.option').forEach((o) => {
    o.disabled = false;
    o.classList.remove('correct', 'incorrect');
  });
  document.querySelectorAll('.check-feedback').forEach((f) => f.textContent = '');
  matchedCount = 0;
  renderMatchGame();
  showScreen(1);
});
