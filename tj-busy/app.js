// ── Config ─────────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = '581031450933-ui4hdl4ul3ucgqnf8mnu7ncmpc5dki1m.apps.googleusercontent.com';
const ALLOWED_DOMAIN   = 'ed.ac.uk';
const OWNER_PIN_HASH   = '5730e8a455c9b7bf1abeaf3b510152ebb477fe6465301e65250a08b986a5278a';
const STORAGE_KEY      = 'tj-busy-tasks';
const OWNER_SESSION_KEY = 'tj-busy-owner';

// ── Constants ───────────────────────────────────────────────────────────────
const URGENCY_LABELS  = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
const URGENCY_WEIGHTS = { 1: 5, 2: 15, 3: 30, 4: 60 };
const ARC_LENGTH      = Math.PI * 60; // ≈ 188.5

const LEVELS = [
  { min: 0,  max: 10,       key: 'free',     label: 'Free',            header: 'IS TJ BUSY?' },
  { min: 10, max: 30,       key: 'light',    label: 'A Little Busy',   header: 'IS TJ BUSY?' },
  { min: 30, max: 60,       key: 'moderate', label: 'Moderately Busy', header: 'IS TJ BUSY?' },
  { min: 60, max: 90,       key: 'busy',     label: 'Busy',            header: 'IS TJ BUSY?' },
  { min: 90, max: Infinity, key: 'very',     label: 'Very Busy',       header: 'VERY BUSY'   },
];

// ── State ───────────────────────────────────────────────────────────────────
let tasks       = loadTasks();
let currentUser = null; // { name, email }
let isOwner     = sessionStorage.getItem(OWNER_SESSION_KEY) === 'true';

// ── DOM refs ────────────────────────────────────────────────────────────────
const authOverlay   = document.getElementById('auth-overlay');
const mainApp       = document.getElementById('main-app');
const googleBtnWrap = document.getElementById('google-btn-wrap');
const authError     = document.getElementById('auth-error');
const userNameEl    = document.getElementById('user-name');
const ownerBtn      = document.getElementById('owner-btn');
const signoutBtn    = document.getElementById('signout-btn');
const busyHeader    = document.getElementById('busy-header');
const busyScore     = document.getElementById('busy-score');
const busyLevel     = document.getElementById('busy-level');
const gaugeFill     = document.getElementById('gauge-fill');
const taskInput     = document.getElementById('task-input');
const urgencySelect = document.getElementById('urgency-select');
const addBtn        = document.getElementById('add-btn');
const tasksList     = document.getElementById('tasks');
const taskCount     = document.getElementById('task-count');
const emptyMsg      = document.getElementById('empty-msg');
const clearDoneBtn  = document.getElementById('clear-done-btn');
const pinModal      = document.getElementById('pin-modal');
const pinInput      = document.getElementById('pin-input');
const pinError      = document.getElementById('pin-error');
const pinCancelBtn  = document.getElementById('pin-cancel-btn');
const pinSubmitBtn  = document.getElementById('pin-submit-btn');

// ── Google Sign-In ──────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  if (typeof google === 'undefined') {
    authError.textContent = 'Could not load Google Sign-In. Check your connection.';
    return;
  }
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback:  handleCredentialResponse,
    hd:        ALLOWED_DOMAIN,
  });
  google.accounts.id.renderButton(googleBtnWrap, {
    theme:          'filled_black',
    size:           'large',
    shape:          'pill',
    text:           'sign_in_with',
    logo_alignment: 'left',
  });
});

function parseJwt(token) {
  const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const pad  = b64 + '='.repeat((4 - b64.length % 4) % 4);
  return JSON.parse(atob(pad));
}

function handleCredentialResponse(response) {
  const payload = parseJwt(response.credential);
  const email   = payload.email || '';
  const name    = payload.given_name || payload.name || email;

  if (!email.toLowerCase().endsWith('@' + ALLOWED_DOMAIN)) {
    authError.textContent = `Only @${ALLOWED_DOMAIN} accounts are allowed.`;
    return;
  }

  currentUser = { name, email };
  authError.textContent = '';
  showApp();
}

function showApp() {
  authOverlay.classList.add('hidden');
  mainApp.classList.remove('hidden');
  userNameEl.textContent = currentUser.name;
  updateOwnerUI();
  render();
}

function signOut() {
  google.accounts.id.disableAutoSelect();
  currentUser = null;
  isOwner     = false;
  sessionStorage.removeItem(OWNER_SESSION_KEY);
  mainApp.classList.add('hidden');
  authOverlay.classList.remove('hidden');
}

// ── Owner PIN ────────────────────────────────────────────────────────────────
async function sha256(text) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function openPinModal() {
  pinInput.value = '';
  pinError.classList.add('hidden');
  pinModal.classList.remove('hidden');
  pinInput.focus();
}

function closePinModal() {
  pinModal.classList.add('hidden');
}

async function submitPin() {
  const hash = await sha256(pinInput.value);
  if (hash === OWNER_PIN_HASH) {
    isOwner = true;
    sessionStorage.setItem(OWNER_SESSION_KEY, 'true');
    closePinModal();
    updateOwnerUI();
    renderTasks();
  } else {
    pinError.classList.remove('hidden');
    pinInput.value = '';
    pinInput.focus();
  }
}

function updateOwnerUI() {
  if (isOwner) {
    ownerBtn.textContent = '🔓';
    ownerBtn.title = 'Owner mode active';
    ownerBtn.classList.add('owner-active');
  } else {
    ownerBtn.textContent = '🔒';
    ownerBtn.title = 'Unlock owner mode';
    ownerBtn.classList.remove('owner-active');
  }
}

// ── Persistence ─────────────────────────────────────────────────────────────
function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ── Score ────────────────────────────────────────────────────────────────────
function computeScore() {
  const pending = tasks.filter(t => !t.done);
  if (!pending.length) return 0;
  const sorted = [...pending].sort((a, b) => b.urgency - a.urgency);
  let raw = 0;
  sorted.forEach((t, i) => { raw += URGENCY_WEIGHTS[t.urgency] * (1 / (1 + i * 0.15)); });
  return Math.min(100, Math.round(raw));
}

function getLevel(score) {
  return LEVELS.find(l => score >= l.min && score < l.max) || LEVELS[LEVELS.length - 1];
}

// ── Render ───────────────────────────────────────────────────────────────────
function renderScore() {
  const score = computeScore();
  const level = getLevel(score);

  busyScore.textContent = score;
  busyScore.className   = `score-${level.key}`;

  const offset = ARC_LENGTH * (1 - score / 100);
  gaugeFill.style.strokeDashoffset = offset.toFixed(2);
  gaugeFill.style.stroke = getComputedStyle(busyScore).color;

  busyLevel.textContent = level.label;
  busyLevel.className   = `level-${level.key}`;
  busyHeader.textContent = level.header;

  if (level.key === 'very') {
    busyHeader.classList.add('very');
    document.body.classList.add('level-very-busy');
  } else {
    busyHeader.classList.remove('very');
    document.body.classList.remove('level-very-busy');
  }
}

function renderTasks() {
  const sorted = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return b.urgency - a.urgency;
  });

  tasksList.innerHTML = '';
  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item urgency-border-${task.urgency}${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    // Owner-only controls rendered only when isOwner
    const ownerControls = isOwner
      ? `<button class="delete-btn" title="Delete" data-id="${task.id}">&#x2715;</button>`
      : '';

    li.innerHTML = `
      <span class="urgency-badge urgency-${task.urgency}">${URGENCY_LABELS[task.urgency]}</span>
      <span class="task-name">${escapeHtml(task.name)}</span>
      <button class="done-btn" title="${task.done ? 'Undo' : 'Mark done'}" data-id="${task.id}">${task.done ? '&#x21A9;' : '&#x2713;'}</button>
      ${ownerControls}
    `;
    tasksList.appendChild(li);
  });

  taskCount.textContent = tasks.length;
  emptyMsg.style.display = tasks.length === 0 ? 'block' : 'none';

  const hasDone = tasks.some(t => t.done);
  if (hasDone && isOwner) {
    clearDoneBtn.classList.remove('hidden');
  } else {
    clearDoneBtn.classList.add('hidden');
  }
}

function render() {
  renderTasks();
  renderScore();
}

// ── Actions ──────────────────────────────────────────────────────────────────
function addTask() {
  const name = taskInput.value.trim();
  if (!name) return;
  tasks.push({
    id: Date.now().toString(),
    name,
    urgency:   parseInt(urgencySelect.value, 10),
    done:      false,
    createdAt: Date.now(),
    addedBy:   currentUser?.email || 'unknown',
  });
  taskInput.value = '';
  saveTasks();
  render();
}

function toggleDone(id) {
  const t = tasks.find(t => t.id === id);
  if (t) { t.done = !t.done; saveTasks(); render(); }
}

function deleteTask(id) {
  if (!isOwner) return;
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function clearDone() {
  if (!isOwner) return;
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  render();
}

// ── Utilities ────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Event listeners ──────────────────────────────────────────────────────────
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

tasksList.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.classList.contains('done-btn'))   toggleDone(id);
  if (btn.classList.contains('delete-btn') && isOwner) deleteTask(id);
});

clearDoneBtn.addEventListener('click', clearDone);
signoutBtn.addEventListener('click', signOut);

ownerBtn.addEventListener('click', () => {
  if (isOwner) {
    // Toggle off
    isOwner = false;
    sessionStorage.removeItem(OWNER_SESSION_KEY);
    updateOwnerUI();
    renderTasks();
  } else {
    openPinModal();
  }
});

pinCancelBtn.addEventListener('click', closePinModal);
pinSubmitBtn.addEventListener('click', submitPin);
pinInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitPin(); });
pinModal.addEventListener('click', e => { if (e.target === pinModal) closePinModal(); });
