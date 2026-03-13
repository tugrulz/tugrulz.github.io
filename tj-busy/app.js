// ── Constants ──────────────────────────────────────────────────────────────
const URGENCY_LABELS  = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
const URGENCY_WEIGHTS = { 1: 5, 2: 15, 3: 30, 4: 60 };

const LEVELS = [
  { min: 0,  max: 10,       key: 'free',     label: 'Free',            header: 'IS TJ BUSY?' },
  { min: 10, max: 30,       key: 'light',    label: 'A Little Busy',   header: 'IS TJ BUSY?' },
  { min: 30, max: 60,       key: 'moderate', label: 'Moderately Busy', header: 'IS TJ BUSY?' },
  { min: 60, max: 90,       key: 'busy',     label: 'Busy',            header: 'IS TJ BUSY?' },
  { min: 90, max: Infinity, key: 'very',     label: 'Very Busy',       header: 'VERY BUSY' },
];

// Arc circumference for the gauge (r=60 half-circle)
const ARC_LENGTH = Math.PI * 60; // ≈ 188.5

const STORAGE_KEY = 'tj-busy-tasks';

// ── State ──────────────────────────────────────────────────────────────────
let tasks = loadTasks();

// ── DOM refs ───────────────────────────────────────────────────────────────
const taskInput     = document.getElementById('task-input');
const urgencySelect = document.getElementById('urgency-select');
const addBtn        = document.getElementById('add-btn');
const tasksList     = document.getElementById('tasks');
const taskCount     = document.getElementById('task-count');
const emptyMsg      = document.getElementById('empty-msg');
const busyHeader    = document.getElementById('busy-header');
const busyScore     = document.getElementById('busy-score');
const busyLevel     = document.getElementById('busy-level');
const gaugeFill     = document.getElementById('gauge-fill');
const clearDoneBtn  = document.getElementById('clear-done-btn');

// ── Persistence ────────────────────────────────────────────────────────────
function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ── Score computation ──────────────────────────────────────────────────────
function computeScore() {
  const pending = tasks.filter(t => !t.done);
  if (pending.length === 0) return 0;

  const sorted = [...pending].sort((a, b) => b.urgency - a.urgency);
  let raw = 0;
  sorted.forEach((t, i) => {
    raw += URGENCY_WEIGHTS[t.urgency] * (1 / (1 + i * 0.15));
  });
  return Math.min(100, Math.round(raw));
}

function getLevel(score) {
  return LEVELS.find(l => score >= l.min && score < l.max) || LEVELS[LEVELS.length - 1];
}

// ── Render ─────────────────────────────────────────────────────────────────
function renderScore() {
  const score = computeScore();
  const level = getLevel(score);

  // Number
  busyScore.textContent = score;
  busyScore.className = `score-${level.key}`;

  // Arc gauge: 0 score → full offset (hidden), 100 score → 0 offset (full)
  const offset = ARC_LENGTH * (1 - score / 100);
  gaugeFill.style.strokeDashoffset = offset.toFixed(2);
  gaugeFill.style.stroke = getComputedStyle(busyScore).color;

  // Level badge
  busyLevel.textContent = level.label;
  busyLevel.className = `level-${level.key}`;

  // Header
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

    li.innerHTML = `
      <span class="urgency-badge urgency-${task.urgency}">${URGENCY_LABELS[task.urgency]}</span>
      <span class="task-name">${escapeHtml(task.name)}</span>
      <button class="done-btn" title="${task.done ? 'Undo' : 'Mark done'}" data-id="${task.id}">${task.done ? '↩' : '✓'}</button>
      <button class="delete-btn" title="Delete" data-id="${task.id}">✕</button>
    `;
    tasksList.appendChild(li);
  });

  const total = tasks.length;
  const doneCount = tasks.filter(t => t.done).length;

  taskCount.textContent = total;
  emptyMsg.style.display = total === 0 ? 'block' : 'none';

  if (doneCount > 0) {
    clearDoneBtn.classList.add('visible');
  } else {
    clearDoneBtn.classList.remove('visible');
  }
}

function render() {
  renderTasks();
  renderScore();
}

// ── Actions ────────────────────────────────────────────────────────────────
function addTask() {
  const name = taskInput.value.trim();
  if (!name) return;

  tasks.push({
    id: Date.now().toString(),
    name,
    urgency: parseInt(urgencySelect.value, 10),
    done: false,
    createdAt: Date.now(),
  });

  taskInput.value = '';
  saveTasks();
  render();
}

function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (task) { task.done = !task.done; saveTasks(); render(); }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function clearDone() {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  render();
}

// ── Utilities ──────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Event listeners ────────────────────────────────────────────────────────
addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

tasksList.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.classList.contains('done-btn'))   toggleDone(id);
  if (btn.classList.contains('delete-btn')) deleteTask(id);
});

clearDoneBtn.addEventListener('click', clearDone);

// ── Init ───────────────────────────────────────────────────────────────────
render();
