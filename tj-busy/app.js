// ── Config ─────────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID  = 'YOUR_GOOGLE_CLIENT_ID';
const ALLOWED_DOMAIN    = 'ed.ac.uk';
const OWNER_EMAIL       = 'tugrulcanelmas@gmail.com';
const OWNER_PIN_HASH    = 'REDACTED_PIN_HASH';
const STORAGE_KEY       = 'tj-busy-tasks';
const OWNER_SESSION_KEY = 'tj-busy-owner';

// ── Constants ───────────────────────────────────────────────────────────────
const URGENCY_LABELS  = { 0: 'Future', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
const URGENCY_WEIGHTS = { 1: 5, 2: 15, 3: 30, 4: 60 };
const ARC_LENGTH      = Math.PI * 60;

const LEVELS = [
  { min: 0,  max: 10,       key: 'free',     label: 'Free',            header: 'IS TJ BUSY?' },
  { min: 10, max: 30,       key: 'light',    label: 'A Little Busy',   header: 'IS TJ BUSY?' },
  { min: 30, max: 60,       key: 'moderate', label: 'Moderately Busy', header: 'IS TJ BUSY?' },
  { min: 60, max: 90,       key: 'busy',     label: 'Busy',            header: 'IS TJ BUSY?' },
  { min: 90, max: Infinity, key: 'very',     label: 'Very Busy',       header: 'VERY BUSY'   },
];

// ── Date helpers ────────────────────────────────────────────────────────────
const MONTHS = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11,
  january:0,february:1,march:2,april:3,june:5,july:6,august:7,september:8,october:9,november:10,december:11 };
const DAYS   = { sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6,
  sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6 };

function parseDeadline(raw) {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim().toLowerCase();
  const today = new Date(); today.setHours(0,0,0,0);

  // ISO / date picker: 2026-05-15
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // "today" / "tomorrow"
  if (s === 'today') return isoDate(today);
  if (s === 'tomorrow') { const d = new Date(today); d.setDate(d.getDate()+1); return isoDate(d); }

  // "in N days/weeks"
  const inMatch = s.match(/^in\s+(\d+)\s+(day|days|week|weeks)$/);
  if (inMatch) {
    const n = parseInt(inMatch[1]);
    const d = new Date(today);
    d.setDate(d.getDate() + (inMatch[2].startsWith('week') ? n*7 : n));
    return isoDate(d);
  }

  // "next friday" / "friday"
  const dayMatch = s.match(/^(?:next\s+)?(\w+)$/);
  if (dayMatch && DAYS[dayMatch[1]] !== undefined) {
    const target = DAYS[dayMatch[1]];
    const d = new Date(today);
    const diff = (target - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return isoDate(d);
  }

  // "May 15" / "15 May" / "May 15 2026"
  const mdy = s.match(/^(\w+)\s+(\d{1,2})(?:\s+(\d{4}))?$/);
  if (mdy && MONTHS[mdy[1]] !== undefined) {
    const yr = mdy[3] ? parseInt(mdy[3]) : new Date().getFullYear();
    const dt = new Date(yr, MONTHS[mdy[1]], parseInt(mdy[2]));
    if (dt < today && !mdy[3]) dt.setFullYear(dt.getFullYear()+1);
    return isoDate(dt);
  }
  const dmy = s.match(/^(\d{1,2})\s+(\w+)(?:\s+(\d{4}))?$/);
  if (dmy && MONTHS[dmy[2]] !== undefined) {
    const yr = dmy[3] ? parseInt(dmy[3]) : new Date().getFullYear();
    const dt = new Date(yr, MONTHS[dmy[2]], parseInt(dmy[1]));
    if (dt < today && !dmy[3]) dt.setFullYear(dt.getFullYear()+1);
    return isoDate(dt);
  }

  return null; // unparseable
}

function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDeadline(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const deadline = new Date(y, m-1, d);
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((deadline - today) / 86400000);

  const exact = deadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  let rel, overdue = false;
  if (diff < 0)      { rel = `${Math.abs(diff)}d overdue`; overdue = true; }
  else if (diff === 0) rel = 'today';
  else if (diff === 1) rel = 'tomorrow';
  else if (diff <= 6)  rel = `in ${diff}d`;
  else                 rel = `in ${Math.round(diff/7)}w`;

  return { exact, rel, overdue };
}

// ── Auth helpers ────────────────────────────────────────────────────────────
function canAdd(email)   { return email && (email.toLowerCase().endsWith('@' + ALLOWED_DOMAIN) || email.toLowerCase() === OWNER_EMAIL); }
function isOwnerEmail(email) { return email && email.toLowerCase() === OWNER_EMAIL; }

// ── State ───────────────────────────────────────────────────────────────────
let tasks       = loadTasks();
let currentUser = null; // { name, email }
let isOwner     = sessionStorage.getItem(OWNER_SESSION_KEY) === 'true';

// ── DOM refs ────────────────────────────────────────────────────────────────
const signinWrap      = document.getElementById('signin-wrap');
const signinFooter    = document.getElementById('signin-footer');
const userBar         = document.getElementById('user-bar');
const userNameEl      = document.getElementById('user-name');
const ownerBtn        = document.getElementById('owner-btn');
const signoutBtn      = document.getElementById('signout-btn');
const addTaskSection  = document.getElementById('add-task-section');
const busyHeader      = document.getElementById('busy-header');
const busyScore       = document.getElementById('busy-score');
const busyLevel       = document.getElementById('busy-level');
const gaugeFill       = document.getElementById('gauge-fill');
const taskInput       = document.getElementById('task-input');
const urgencySelect   = document.getElementById('urgency-select');
const deadlineText    = document.getElementById('deadline-text');
const deadlinePicker  = document.getElementById('deadline-picker');
const addBtn          = document.getElementById('add-btn');
const tasksList       = document.getElementById('tasks');
const taskCount       = document.getElementById('task-count');
const emptyMsg        = document.getElementById('empty-msg');
const clearDoneBtn    = document.getElementById('clear-done-btn');
const pinModal        = document.getElementById('pin-modal');
const pinInput        = document.getElementById('pin-input');
const pinError        = document.getElementById('pin-error');
const pinCancelBtn    = document.getElementById('pin-cancel-btn');
const pinSubmitBtn    = document.getElementById('pin-submit-btn');

// ── Google Sign-In ──────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  if (typeof google === 'undefined') return;
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback:  handleCredentialResponse,
    // No hd restriction — we accept gmail.com too, checked in callback
  });
  google.accounts.id.renderButton(signinWrap, {
    theme:          'filled_black',
    size:           'large',
    shape:          'pill',
    text:           'signin_with',
    logo_alignment: 'left',
  });
  render(); // show tasks immediately for guests
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

  if (!canAdd(email)) {
    alert(`Only @${ALLOWED_DOMAIN} or the site owner can add tasks.`);
    return;
  }

  currentUser = { name, email };

  // Owner email gets owner mode automatically — no PIN needed
  if (isOwnerEmail(email)) {
    isOwner = true;
    sessionStorage.setItem(OWNER_SESSION_KEY, 'true');
  }

  updateAuthUI();
  render();
}

function signOut() {
  if (typeof google !== 'undefined') google.accounts.id.disableAutoSelect();
  currentUser = null;
  isOwner     = false;
  sessionStorage.removeItem(OWNER_SESSION_KEY);
  updateAuthUI();
  render();
}

function updateAuthUI() {
  const signedIn = !!currentUser;

  // Footer sign-in: visible to guests only
  signinFooter.classList.toggle('hidden', signedIn);
  // User bar: visible when signed in
  userBar.classList.toggle('hidden', !signedIn);
  addTaskSection.classList.toggle('hidden', !signedIn);

  if (signedIn) {
    userNameEl.textContent = currentUser.name;
    // Show PIN lock only for non-owner accounts
    ownerBtn.classList.toggle('hidden', isOwnerEmail(currentUser.email));
  } else {
    ownerBtn.classList.add('hidden');
  }

  updateOwnerBtn();
}

// ── Owner PIN ────────────────────────────────────────────────────────────────
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function updateOwnerBtn() {
  if (ownerBtn.classList.contains('hidden')) return;
  ownerBtn.textContent = isOwner ? '🔓' : '🔒';
  ownerBtn.title       = isOwner ? 'Owner mode active (click to lock)' : 'Unlock owner mode';
  ownerBtn.classList.toggle('owner-active', isOwner);
}

function openPinModal() {
  pinInput.value = '';
  pinError.classList.add('hidden');
  pinModal.classList.remove('hidden');
  pinInput.focus();
}

function closePinModal() { pinModal.classList.add('hidden'); }

async function submitPin() {
  const hash = await sha256(pinInput.value);
  if (hash === OWNER_PIN_HASH) {
    isOwner = true;
    sessionStorage.setItem(OWNER_SESSION_KEY, 'true');
    closePinModal();
    updateOwnerBtn();
    renderTasks();
  } else {
    pinError.classList.remove('hidden');
    pinInput.value = '';
    pinInput.focus();
  }
}

// ── Persistence ─────────────────────────────────────────────────────────────
function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

// ── Score ────────────────────────────────────────────────────────────────────
// Weighted by urgency. Calibrated so 10 High tasks = 100.
// Low=3, Medium=6, High=10, Critical=20
const SCORE_WEIGHTS = { 0: 0, 1: 3, 2: 6, 3: 10, 4: 20 };

function computeScore() {
  const pending = tasks.filter(t => !t.done);
  if (!pending.length) return 0;
  const raw = pending.reduce((sum, t) => sum + SCORE_WEIGHTS[t.urgency], 0);
  return Math.min(100, raw);
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

  busyLevel.textContent  = level.label;
  busyLevel.className    = `level-${level.key}`;
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
  // Only owner sees resolved tasks
  const visible = isOwner ? tasks : tasks.filter(t => !t.done);

  const sorted = [...visible].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    // Future (urgency 0) sinks below active tasks but above done
    const aFuture = !a.done && a.urgency === 0;
    const bFuture = !b.done && b.urgency === 0;
    if (aFuture !== bFuture) return aFuture ? 1 : -1;
    return b.urgency - a.urgency;
  });

  tasksList.innerHTML = '';
  emptyMsg.style.display = visible.length === 0 ? 'block' : 'none';
  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item urgency-border-${task.urgency}${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    // Resolve button: owner only
    const resolveBtn = isOwner
      ? `<button class="done-btn" title="${task.done ? 'Undo' : 'Resolve'}" data-id="${task.id}">${task.done ? '&#x21A9;' : '&#x2713;'}</button>`
      : '';

    // Delete button: owner only
    const deleteBtn = isOwner
      ? `<button class="delete-btn" title="Delete" data-id="${task.id}">&#x2715;</button>`
      : '';

    const dl = task.deadline ? formatDeadline(task.deadline) : null;
    const deadlineBadge = dl
      ? `<span class="deadline-badge${dl.overdue ? ' overdue' : ''}" title="${task.deadline}">${dl.exact} · ${dl.rel}</span>`
      : '';

    li.innerHTML = `
      <span class="urgency-badge urgency-${task.urgency}">${URGENCY_LABELS[task.urgency]}</span>
      <span class="task-name">${escapeHtml(task.name)}</span>
      ${deadlineBadge}
      ${resolveBtn}${deleteBtn}
    `;
    tasksList.appendChild(li);
  });

  taskCount.textContent = visible.length;

  const hasDone = tasks.some(t => t.done);
  clearDoneBtn.classList.toggle('hidden', !(hasDone && isOwner));
}

function render() {
  renderTasks();
  renderScore();
}

// ── Actions ──────────────────────────────────────────────────────────────────
function addTask() {
  if (!currentUser) return;
  const name = taskInput.value.trim();
  if (!name) return;

  // Deadline: prefer picker value, fall back to text field
  const rawDeadline = deadlinePicker.value || deadlineText.value;
  const deadline    = parseDeadline(rawDeadline);

  tasks.push({
    id:        Date.now().toString(),
    name,
    urgency:   parseInt(urgencySelect.value, 10),
    done:      false,
    createdAt: Date.now(),
    addedBy:   currentUser.email,
    deadline,
  });
  taskInput.value    = '';
  deadlineText.value = '';
  deadlinePicker.value = '';
  saveTasks();
  render();
}

function toggleDone(id) {
  if (!isOwner) return;
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
  if (btn.classList.contains('delete-btn')) deleteTask(id);
});

clearDoneBtn.addEventListener('click', clearDone);
signoutBtn.addEventListener('click', signOut);

// Sync date picker → text field
deadlinePicker.addEventListener('change', () => {
  if (deadlinePicker.value) deadlineText.value = deadlinePicker.value;
});
// Sync text field → picker (if parseable)
deadlineText.addEventListener('input', () => {
  const iso = parseDeadline(deadlineText.value);
  deadlinePicker.value = iso || '';
});

ownerBtn.addEventListener('click', () => {
  if (isOwner) {
    isOwner = false;
    sessionStorage.removeItem(OWNER_SESSION_KEY);
    updateOwnerBtn();
    renderTasks();
  } else {
    openPinModal();
  }
});

pinCancelBtn.addEventListener('click', closePinModal);
pinSubmitBtn.addEventListener('click', submitPin);
pinInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitPin(); });
pinModal.addEventListener('click', e => { if (e.target === pinModal) closePinModal(); });
