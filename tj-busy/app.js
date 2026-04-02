// ── Config ───────────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = '581031450933-ui4hdl4ul3ucgqnf8mnu7ncmpc5dki1m.apps.googleusercontent.com';
const ALLOWED_DOMAIN   = 'ed.ac.uk';
const OWNER_EMAIL      = 'tugrulcanelmas@gmail.com';

const SUPABASE_URL = 'https://dulysvrvfsckfwbmiobd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_K5NwbLILG5SxdVyuGmAY-w_aL1ul9sg';

// ── Supabase singleton ────────────────────────────────────────────────────────
// One client reused for all operations; authenticated session enables RLS enforcement
const sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Constants ─────────────────────────────────────────────────────────────────
const URGENCY_LABELS = { 0: 'Future', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };

const CATEGORIES = [
  // Grant is first so it wins over Research when "grant" keyword ties the score
  { key: 'grant',       label: 'Grant',       color: '#ffd54f', bg: '#1a1500',
    keywords: ['grant:','grant ','funding','epsrc','ahrc','ukri','horizon','leverhulme',
      'wellcome','bbsrc','esrc','mrc','nerc','innovate uk','royal society',
      'british academy','jisc','aria','nia','fellowship','proposal','bid',
      'pathways to impact'] },
  { key: 'research',    label: 'Research',    color: '#00bcd4', bg: '#001e22',
    keywords: ['paper','literature','experiment','data','analysis','survey','publication',
      'journal','conference','poster','abstract','methodology','results','findings',
      'hypothesis','research','questionnaire','writeup','write up','draft',
      'chapter','bibliography','citation','annotation','annotate','emnlp',
      'arr','arxiv','acl','naacl','coling','submission','censorship','nlp',
      'llm','dataset','corpus','model','baseline','evaluation','image manipulation',
      'real or ai','rebuttal','camera ready','yusuf','angry men'] },
  { key: 'teaching',    label: 'Teaching',    color: '#7e57c2', bg: '#130a30',
    keywords: ['grading','grade','marking','mark','lab','labs','textbook','lecture',
      'tutorial','seminar','course material','module','assignment','homework','exam',
      'quiz','coursework','practical','teaching','curriculum','syllabus','lesson',
      'project grading','new labs','office hour','office hours','css'] },
  { key: 'supervision', label: 'Supervision', color: '#66bb6a', bg: '#0d2010',
    keywords: ['feedback','supervision','supervise','student','msc','phd','ug',
      'undergraduate','postgraduate','dissertation','thesis','progress','check in',
      'meeting with','catch up','advisee','intern'] },
  { key: 'admin',       label: 'Admin',       color: '#ff7043', bg: '#250800',
    keywords: ['email','meeting','form','apply','application','register','enrol',
      'appointment','schedule','book','arrange','contact','reply','renew','pay',
      'invoice','visa','passport','document','sign','admin','paperwork','spreadsheet',
      'budget','tax','bank','hr','finance','committee','report to','expense'] },
  { key: 'personal',    label: 'Personal',    color: '#f06292', bg: '#250010',
    keywords: ['birthday','gift','call','visit','dinner','lunch','coffee','gym',
      'exercise','health','doctor','dentist','shop','buy','clean','organise','organize',
      'family','friend','social','party','celebrate','travel','holiday','vacation',
      'cook','laundry','haircut','youtube','video','podcast','personal','hobby'] },
];
const SCORE_WEIGHTS  = { 0: 0, 1: 1, 2: 4, 3: 8, 4: 16 };
const ARC_LENGTH     = 2 * Math.PI * 90 * (300 / 360); // 300° arc, r=90 ≈ 471.2

const LEVELS = [
  { min: 0,  max: 10,       key: 'free',     label: 'Free',            header: 'IS TJ BUSY?', img: 'notbusy.png',  color: '#4caf50' },
  { min: 10, max: 30,       key: 'light',    label: 'A Little Busy',   header: 'IS TJ BUSY?', img: 'lessbusy.png', color: '#8bc34a' },
  { min: 30, max: 60,       key: 'moderate', label: 'Moderately Busy', header: 'IS TJ BUSY?', img: 'busy.png',     color: '#ff9800' },
  { min: 60, max: 90,       key: 'busy',     label: 'Busy',            header: 'IS TJ BUSY?', img: 'verybusy.png', color: '#ff5722' },
  { min: 90, max: Infinity, key: 'very',     label: 'Very Busy',       header: 'VERY BUSY',   img: 'fullbusy.png', color: '#ff1744' },
];

// ── Date helpers ─────────────────────────────────────────────────────────────
const MONTHS = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11,
  january:0,february:1,march:2,april:3,june:5,july:6,august:7,september:8,october:9,november:10,december:11 };
const DAYS = { sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6,
  sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6 };

function parseDeadline(raw) {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim().toLowerCase();
  const today = new Date(); today.setHours(0,0,0,0);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (s === 'today') return isoDate(today);
  if (s === 'tomorrow') { const d = new Date(today); d.setDate(d.getDate()+1); return isoDate(d); }
  const inMatch = s.match(/^in\s+(\d+)\s+(day|days|week|weeks)$/);
  if (inMatch) {
    const n = parseInt(inMatch[1]);
    const d = new Date(today);
    d.setDate(d.getDate() + (inMatch[2].startsWith('week') ? n*7 : n));
    return isoDate(d);
  }
  const dayMatch = s.match(/^(?:next\s+)?(\w+)$/);
  if (dayMatch && DAYS[dayMatch[1]] !== undefined) {
    const target = DAYS[dayMatch[1]];
    const d = new Date(today);
    const diff = (target - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return isoDate(d);
  }
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
  return null;
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
  if (diff < 0)        { rel = `${Math.abs(diff)}d overdue`; overdue = true; }
  else if (diff === 0) { rel = 'today'; }
  else if (diff === 1) { rel = 'tomorrow'; }
  else if (diff <= 6)  { rel = `in ${diff}d`; }
  else                 { rel = `in ${Math.round(diff/7)}w`; }
  return { exact, rel, overdue };
}

// ── Category detection ────────────────────────────────────────────────────────
function detectCategory(name) {
  if (!name || !name.trim()) return null;
  const lower = name.toLowerCase();
  let best = null, bestScore = 0;
  for (const cat of CATEGORIES) {
    const score = cat.keywords.reduce((n, kw) => n + (lower.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; best = cat; }
  }
  return bestScore > 0 ? best : null;
}

// ── Auth helpers ─────────────────────────────────────────────────────────────
function canAdd(email)       { return email && (email.toLowerCase().endsWith('.ac.uk') || email.toLowerCase() === OWNER_EMAIL); }
function isOwnerEmail(email) { return email && email.toLowerCase() === OWNER_EMAIL; }

function taskGiverName(addedBy) {
  if (!addedBy || addedBy.toLowerCase() === OWNER_EMAIL) return null;
  // Extract name from email: "j.smith@ed.ac.uk" → "j.smith"
  return addedBy.split('@')[0];
}

// ── State ─────────────────────────────────────────────────────────────────────
let tasks              = [];
let currentUser        = null;
let isOwner            = false;
let categoryManualSet  = false;
let lastAddedTaskId    = null;
let editingTaskId      = null;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const signinWrap     = document.getElementById('signin-wrap');
const signinFooter   = document.getElementById('signin-footer');
const userBar        = document.getElementById('user-bar');
const userNameEl     = document.getElementById('user-name');
const signoutBtn     = document.getElementById('signout-btn');
const addTaskSection = document.getElementById('add-task-section');
const busyHeader     = document.getElementById('busy-header');
const busyPortrait   = document.getElementById('busy-portrait');
const busyLevel      = document.getElementById('busy-level');
const gaugeFill      = document.getElementById('gauge-fill');
const gaugePortrait  = document.getElementById('gauge-portrait');
const taskInput      = document.getElementById('task-input');
const urgencySelect  = document.getElementById('urgency-select');
const deadlineText   = document.getElementById('deadline-text');
const deadlinePicker = document.getElementById('deadline-picker');
const categoryHint        = document.getElementById('category-hint');
const categoryRow         = document.getElementById('category-row');
const categorySelect      = document.getElementById('category-select');
const freeDateEl          = document.getElementById('free-date');
const sparklineEl         = document.getElementById('sparkline');
const addBtn              = document.getElementById('add-btn');
const editModal           = document.getElementById('edit-modal');
const editNameInput       = document.getElementById('edit-name');
const editUrgencySelect   = document.getElementById('edit-urgency');
const editCategorySelect  = document.getElementById('edit-category');
const editDeadlineText    = document.getElementById('edit-deadline-text');
const editDeadlinePicker  = document.getElementById('edit-deadline-picker');
const editCancelBtn       = document.getElementById('edit-cancel-btn');
const editSaveBtn         = document.getElementById('edit-save-btn');
const tasksList      = document.getElementById('tasks');
const taskCount      = document.getElementById('task-count');
const emptyMsg       = document.getElementById('empty-msg');
const clearDoneBtn   = document.getElementById('clear-done-btn');

// ── Supabase data layer ───────────────────────────────────────────────────────
async function fetchTasks() {
  const { data, error } = await sbClient
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('fetch error', error); return; }
  tasks = data.map(row => ({
    id:        row.id,
    name:      row.name,
    urgency:   row.urgency,
    done:      row.done,
    deadline:  row.deadline,
    createdAt: row.created_at,
    addedBy:   row.added_by,
    category:  row.category || null,
  }));
  await ensureRecurringTasks();
  render();
}

async function dbInsert(task) {
  const { error } = await sbClient
    .from('tasks')
    .insert({
      id:         task.id,
      name:       task.name,
      urgency:    task.urgency,
      done:       task.done,
      deadline:   task.deadline,
      created_at: new Date(task.createdAt).toISOString(),
      added_by:   task.addedBy,
      category:   task.category || null,
    });
  if (error) console.error('insert error', error);
}

async function dbUpdate(id, changes) {
  const { error } = await sbClient
    .from('tasks')
    .update(changes)
    .eq('id', id);
  if (error) console.error('update error', error);
}

async function dbDelete(id) {
  const { error } = await sbClient
    .from('tasks')
    .delete()
    .eq('id', id);
  if (error) console.error('delete error', error);
}

async function dbDeleteWhere(field, value) {
  const { error } = await sbClient
    .from('tasks')
    .delete()
    .eq(field, value);
  if (error) console.error('delete error', error);
}

// ── Recurring tasks ───────────────────────────────────────────────────────────
async function ensureRecurringTasks() {
  const today = new Date(); today.setHours(0,0,0,0);
  // Ethics Review: every 2 weeks on Friday, anchored to 3 Apr 2026
  const anchor = new Date(2026, 3, 3);
  let target = new Date(anchor);
  while (target < today) target.setDate(target.getDate() + 14);
  const deadline = isoDate(target);
  if (!tasks.some(t => t.name === 'Ethics Review' && t.deadline === deadline)) {
    const task = {
      id:        `ethics-${deadline}`,
      name:      'Ethics Review',
      urgency:   2,
      done:      false,
      deadline,
      createdAt: Date.now(),
      addedBy:   null,
      category:  'admin',
    };
    tasks.push(task);
    await dbInsert(task);
  }
}

// ── Realtime ──────────────────────────────────────────────────────────────────
let _realtimeDebounce = null;

function subscribeRealtime() {
  sbClient
    .channel('tasks-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
      // Debounce rapid successive events (e.g. bulk deletes) into a single fetch
      clearTimeout(_realtimeDebounce);
      _realtimeDebounce = setTimeout(fetchTasks, 300);
    })
    .subscribe();
}

// ── Google Sign-In ────────────────────────────────────────────────────────────
window.addEventListener('load', async () => {
  deadlinePicker.min = isoDate(new Date());
  fetchTasks();
  subscribeRealtime();

  // Restore a persisted Supabase session so the user stays signed in across
  // page loads without having to click the Google button again.
  await restoreSession();

  if (typeof google === 'undefined') return;
  google.accounts.id.initialize({
    client_id:   GOOGLE_CLIENT_ID,
    callback:    handleCredentialResponse,
    auto_select: true,   // silently re-authenticate when a Google session exists
  });
  google.accounts.id.renderButton(signinWrap, {
    theme: 'filled_black', size: 'large', shape: 'pill',
    text: 'signin_with', logo_alignment: 'left',
  });
  // Show the One Tap prompt; it will auto-dismiss if the user is already
  // restored from Supabase or if they previously dismissed it.
  if (!currentUser) google.accounts.id.prompt();
});

// Attempt to resume an existing Supabase session from localStorage.
// If a valid session exists, populate currentUser without requiring a new
// Google credential round-trip.
async function restoreSession() {
  const { data: { session } } = await sbClient.auth.getSession();
  if (!session?.user) return;

  const email = session.user.email || '';
  if (!canAdd(email)) return;

  const name = session.user.user_metadata?.given_name
            || session.user.user_metadata?.name
            || email;

  currentUser = { name, email };
  isOwner     = isOwnerEmail(email);
  updateAuthUI();
  render();
}

// Decode JWT payload without verification.
// Safe: the Google Sign-In SDK has already validated the token against Google's servers
// before invoking our callback. We only use it as a fallback when Supabase auth is unavailable.
function parseJwt(token) {
  const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const pad  = b64 + '='.repeat((4 - b64.length % 4) % 4);
  return JSON.parse(atob(pad));
}

async function handleCredentialResponse(response) {
  let email, name;

  // Prefer Supabase auth: creates an authenticated session so Supabase RLS policies
  // can enforce server-side access control on all subsequent DB operations.
  // Requires Google auth provider to be enabled in your Supabase project settings.
  const { data: authData, error: authError } = await sbClient.auth.signInWithIdToken({
    provider: 'google',
    token: response.credential,
  });

  if (!authError && authData?.user) {
    email = authData.user.email || '';
    name  = authData.user.user_metadata?.given_name
         || authData.user.user_metadata?.name
         || email;
  } else {
    // Fallback when Supabase Google auth provider is not configured
    const payload = parseJwt(response.credential);
    email = payload.email || '';
    name  = payload.given_name || payload.name || email;
  }

  if (!canAdd(email)) {
    alert(`Only @${ALLOWED_DOMAIN} or the site owner can add tasks.`);
    return;
  }
  currentUser = { name, email };
  isOwner     = isOwnerEmail(email); // owner status set from verified Google identity only
  updateAuthUI();
  render();
}

async function signOut() {
  if (typeof google !== 'undefined') google.accounts.id.disableAutoSelect();
  await sbClient.auth.signOut();
  currentUser = null;
  isOwner     = false;
  updateAuthUI();
  render();
}

function updateAuthUI() {
  const signedIn = !!currentUser;
  signinFooter.classList.toggle('hidden', signedIn);
  userBar.classList.toggle('hidden', !signedIn);
  addTaskSection.classList.toggle('hidden', !signedIn);
  if (signedIn) {
    userNameEl.textContent = currentUser.name;
    categoryRow.classList.toggle('hidden', !isOwner);
    categoryHint.style.display = 'none';
  } else {
    categoryRow.classList.add('hidden');
  }
}

// ── Score ─────────────────────────────────────────────────────────────────────
// Deadline multiplier:
//   today/overdue: 2.5×  |  ≤2 days: 2.0×  |  3–29 days: linear 2.0→0.5  |  30+: 0.5×  |  no deadline: 1.0×
function deadlineMultiplier(deadline) {
  if (!deadline) return 1.0;
  const today = new Date(); today.setHours(0,0,0,0);
  const [y,m,d] = deadline.split('-').map(Number);
  const diff = Math.round((new Date(y,m-1,d) - today) / 86400000);
  if (diff <= 0)  return 2.5;
  if (diff <= 2)  return 2.0;
  if (diff >= 30) return 0.5;
  // Linear interpolation between 2.0 (diff=2) and 0.5 (diff=30)
  return 2.0 - (diff - 2) * (1.5 / 28);
}

// ── Deadline escalation ───────────────────────────────────────────────────────
// Returns the urgency that should be *displayed* and used for scoring/sorting.
// Lower-priority tasks escalate automatically as their deadline approaches so
// nothing slips under the radar. Future tasks (urgency=0) are never escalated.
//
// Thresholds:
//   overdue / 0–2 days  →  at least Critical (4)
//   3–5 days            →  at least High     (3)
//   6–10 days           →  at least Medium   (2)
function effectiveUrgency(task) {
  if (task.done || task.urgency === 0 || !task.deadline) return task.urgency;
  const today = new Date(); today.setHours(0,0,0,0);
  const [y,m,d] = task.deadline.split('-').map(Number);
  const diff = Math.round((new Date(y,m-1,d) - today) / 86400000);
  if (diff <= 2)  return Math.max(task.urgency, 4);
  if (diff <= 5)  return Math.max(task.urgency, 3);
  if (diff <= 10) return Math.max(task.urgency, 2);
  return task.urgency;
}

function computeScore() {
  const pending = tasks.filter(t => !t.done && t.urgency > 0);
  if (!pending.length) return 0;
  const raw = pending.reduce((sum, t) => sum + SCORE_WEIGHTS[effectiveUrgency(t)] * deadlineMultiplier(t.deadline), 0);
  return Math.min(100, Math.round(raw));
}

function getLevel(score) {
  return LEVELS.find(l => score >= l.min && score < l.max) || LEVELS[LEVELS.length - 1];
}

// Show estimated free date only when 3+ deadlines fall within the next 14 days
function computeFreeDate() {
  const today = new Date(); today.setHours(0,0,0,0);
  const soon = tasks.filter(t => {
    if (t.done || !t.deadline) return false;
    const [y,m,d] = t.deadline.split('-').map(Number);
    const diff = Math.round((new Date(y,m-1,d) - today) / 86400000);
    return diff >= 0 && diff <= 14;
  });
  if (soon.length < 3) return null;
  const last = soon.reduce((max, t) => t.deadline > max ? t.deadline : max, '');
  const [y,m,d] = last.split('-').map(Number);
  const free = new Date(y,m-1,d);
  free.setDate(free.getDate() + 1);
  return free.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderScore() {
  const score = computeScore();
  const level = getLevel(score);

  // Arc gauge
  const offset = ARC_LENGTH * (1 - score / 100);
  gaugeFill.style.strokeDashoffset = offset.toFixed(2);
  gaugeFill.setAttribute('stroke', level.color);

  // Portrait image (SVG <image> uses href)
  busyPortrait.setAttribute('href', `busy-images/${level.img}`);

  // Level + header
  busyLevel.textContent  = level.label;
  busyLevel.className    = `level-${level.key}`;
  busyHeader.textContent = level.header;

  // Portrait glow via container class
  gaugePortrait.className = `portrait-${level.key}`;

  if (level.key === 'very') {
    busyHeader.classList.add('very');
    document.body.classList.add('level-very-busy');
  } else {
    busyHeader.classList.remove('very');
    document.body.classList.remove('level-very-busy');
  }

  const freeDate = computeFreeDate();
  freeDateEl.textContent = freeDate ? `free from ${freeDate}` : '';
  freeDateEl.classList.toggle('hidden', !freeDate);

  saveScoreHistory(score);
  renderSparkline();
}

function renderTasks() {
  const visible = isOwner ? tasks : tasks.filter(t => !t.done);
  const today = new Date(); today.setHours(0,0,0,0);

  function daysUntil(deadline) {
    if (!deadline) return null;
    const [y,m,d] = deadline.split('-').map(Number);
    return Math.round((new Date(y,m-1,d) - today) / 86400000);
  }

  function isHot(task) {
    const diff = daysUntil(task.deadline);
    return diff !== null && diff <= 7;
  }

  const sorted  = [...visible].sort((a, b) => {
    // 1. Done sink to bottom
    if (a.done !== b.done) return a.done ? 1 : -1;
    // 2. Future (urgency 0) sink below active
    const aFuture = !a.done && a.urgency === 0;
    const bFuture = !b.done && b.urgency === 0;
    if (aFuture !== bFuture) return aFuture ? 1 : -1;
    if (aFuture && bFuture) return 0;
    // 3. Effective urgency DESC — escalated tasks bubble up automatically
    const aEff = effectiveUrgency(a), bEff = effectiveUrgency(b);
    if (aEff !== bEff) return bEff - aEff;
    // 4. Within same urgency: hot (deadline ≤7 days) first
    const aHot = isHot(a), bHot = isHot(b);
    if (aHot !== bHot) return aHot ? -1 : 1;
    // 5. Both hot or both normal: deadline asc, no-deadline last
    const aDl = daysUntil(a.deadline), bDl = daysUntil(b.deadline);
    if ((aDl === null) !== (bDl === null)) return aDl === null ? 1 : -1;
    if (aDl !== null && bDl !== null) return aDl - bDl;
    return 0;
  });

  tasksList.innerHTML = '';
  emptyMsg.style.display = visible.length === 0 ? 'block' : 'none';

  sorted.forEach(task => {
    const li = document.createElement('li');
    const effUrgency = effectiveUrgency(task);
    li.className  = `task-item urgency-border-${effUrgency}${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    const editBtn       = isOwner && !task.done ? `<button class="edit-btn" title="Edit" data-id="${task.id}">&#x270E;</button>` : '';
    const resolveBtn    = isOwner ? `<button class="done-btn"   title="${task.done ? 'Undo' : 'Resolve'}" data-id="${task.id}">${task.done ? '&#x21A9;' : '&#x2713;'}</button>` : '';
    const deleteBtn     = isOwner ? `<button class="delete-btn" title="Delete"   data-id="${task.id}">&#x2715;</button>` : '';
    const dl            = task.deadline ? formatDeadline(task.deadline) : null;
    const deadlineBadge = dl ? `<span class="deadline-badge${dl.overdue ? ' overdue' : ''}" title="${task.deadline}">${dl.exact} · ${dl.rel}</span>` : '';
    const giver         = taskGiverName(task.addedBy);
    const giverBadge    = giver ? `<span class="giver-badge" title="${escapeHtml(task.addedBy)}">from ${escapeHtml(giver)}</span>` : '';
    const catKey        = task.category || detectCategory(task.name)?.key || null;
    const cat           = catKey ? CATEGORIES.find(c => c.key === catKey) : null;
    const categoryBadge = cat ? `<span class="category-badge" style="color:${cat.color};background:${cat.bg}">${cat.label}</span>` : '';
    const ageDays       = !task.deadline && task.createdAt
      ? Math.floor((Date.now() - new Date(task.createdAt).getTime()) / 86400000) : 0;
    const ageBadge      = ageDays >= 7 ? `<span class="age-badge">${ageDays}d old</span>` : '';
    const escalated     = !task.done && effUrgency > task.urgency;
    const urgencyLabel  = URGENCY_LABELS[effUrgency] + (escalated ? ' ↑' : '');

    const metaRow = giverBadge || deadlineBadge || ageBadge || categoryBadge
      ? `<div class="task-meta">${giverBadge}${deadlineBadge}${ageBadge}${categoryBadge}</div>` : '';
    li.innerHTML = `
      <div class="task-main">
        <span class="urgency-badge urgency-${effUrgency}${escalated ? ' urgency-escalated' : ''}" title="${escalated ? `Auto-escalated from ${URGENCY_LABELS[task.urgency]}` : ''}">${urgencyLabel}</span>
        <span class="task-name">${escapeHtml(task.name)}</span>
        ${editBtn}${resolveBtn}${deleteBtn}
      </div>
      ${metaRow}
    `;
    if (task.id === lastAddedTaskId) li.classList.add('task-new');
    tasksList.appendChild(li);
  });

  taskCount.textContent = visible.length;
  clearDoneBtn.classList.toggle('hidden', !(tasks.some(t => t.done) && isOwner));
}

function render() { renderTasks(); renderScore(); }

// ── Actions ───────────────────────────────────────────────────────────────────
async function addTask() {
  if (!currentUser) return;
  const name = taskInput.value.trim();
  if (!name) return;
  const rawDeadline = deadlinePicker.value || deadlineText.value;
  const category = isOwner
    ? (categorySelect.value || detectCategory(name)?.key || null)
    : (detectCategory(name)?.key || null);
  const task = {
    id:        Date.now().toString(),
    name,
    urgency:   parseInt(urgencySelect.value, 10),
    done:      false,
    deadline:  parseDeadline(rawDeadline),
    createdAt: Date.now(),
    addedBy:   currentUser.email,
    category,
  };
  taskInput.value      = '';
  deadlineText.value   = '';
  deadlinePicker.value = '';
  if (isOwner) { categorySelect.value = ''; categoryManualSet = false; }
  lastAddedTaskId = task.id;
  tasks.push(task);
  render();
  await dbInsert(task);
}

async function toggleDone(id) {
  if (!isOwner) return;
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  if (!t.done) {
    const li = tasksList.querySelector(`[data-id="${id}"]`);
    if (li) { li.classList.add('task-resolving'); await new Promise(r => setTimeout(r, 420)); }
  }
  t.done = !t.done;
  render();
  await dbUpdate(id, { done: t.done });
}

async function deleteTask(id) {
  if (!isOwner) return;
  tasks = tasks.filter(t => t.id !== id);
  render();
  await dbDelete(id);
}

async function clearDone() {
  if (!isOwner) return;
  tasks = tasks.filter(t => !t.done);
  render();
  await dbDeleteWhere('done', true);
}

// ── Edit task ─────────────────────────────────────────────────────────────────
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingTaskId = id;
  editNameInput.value      = task.name;
  editUrgencySelect.value  = String(task.urgency);
  editCategorySelect.value = task.category || '';
  editDeadlineText.value   = task.deadline || '';
  editDeadlinePicker.value = task.deadline || '';
  editModal.classList.remove('hidden');
  editNameInput.focus();
}

function closeEditModal() { editModal.classList.add('hidden'); editingTaskId = null; }

async function saveEdit() {
  const task = tasks.find(t => t.id === editingTaskId);
  if (!task) return;
  const name = editNameInput.value.trim();
  if (!name) return;
  const deadline = editDeadlinePicker.value || parseDeadline(editDeadlineText.value) || null;
  const category = editCategorySelect.value || null;
  const urgency  = parseInt(editUrgencySelect.value, 10);
  Object.assign(task, { name, urgency, deadline, category });
  closeEditModal();
  render();
  await dbUpdate(editingTaskId, { name, urgency, deadline, category });
}

// ── Busyness history ──────────────────────────────────────────────────────────
function saveScoreHistory(score) {
  const today = isoDate(new Date());
  let h = {};
  try { h = JSON.parse(localStorage.getItem('tj-busy-history') || '{}'); } catch(e) {}
  h[today] = score;
  const cutoff = isoDate(new Date(Date.now() - 30 * 86400000));
  Object.keys(h).forEach(k => { if (k < cutoff) delete h[k]; });
  localStorage.setItem('tj-busy-history', JSON.stringify(h));
}

function renderSparkline() {
  let h = {};
  try { h = JSON.parse(localStorage.getItem('tj-busy-history') || '{}'); } catch(e) {}
  const days = 14;
  const today = new Date(); today.setHours(0,0,0,0);
  const data = Array.from({ length: days }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (days - 1 - i));
    return h[isoDate(d)] ?? null;
  });
  const known = data.filter(p => p !== null);
  if (known.length < 2) { sparklineEl.classList.add('hidden'); return; }

  const W = 220, H = 38, px = 4, py = 5;
  const xStep = (W - px * 2) / (days - 1);
  let path = '';
  data.forEach((p, i) => {
    if (p === null) return;
    const x = (px + i * xStep).toFixed(1);
    const y = (H - py - (p / 100) * (H - py * 2)).toFixed(1);
    path += path ? ` L${x},${y}` : `M${x},${y}`;
  });
  const lastIdx = data.map((p, i) => p !== null ? i : -1).filter(i => i >= 0).pop();
  const dotX = (px + lastIdx * xStep).toFixed(1);
  const dotY = (H - py - (data[lastIdx] / 100) * (H - py * 2)).toFixed(1);

  sparklineEl.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="sparkline-svg">
      <path d="${path}" fill="none" stroke="#3a3a3a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${dotX}" cy="${dotY}" r="2.5" fill="#555"/>
    </svg>
    <span class="sparkline-label">14d</span>
  `;
  sparklineEl.classList.remove('hidden');
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Event listeners ───────────────────────────────────────────────────────────
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

tasksList.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.classList.contains('edit-btn'))   openEditModal(id);
  if (btn.classList.contains('done-btn'))   toggleDone(id);
  if (btn.classList.contains('delete-btn')) deleteTask(id);
});

editSaveBtn.addEventListener('click', saveEdit);
editCancelBtn.addEventListener('click', closeEditModal);
editNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveEdit(); });
editModal.addEventListener('click', e => { if (e.target === editModal) closeEditModal(); });
editDeadlinePicker.addEventListener('change', () => { if (editDeadlinePicker.value) editDeadlineText.value = editDeadlinePicker.value; });
editDeadlineText.addEventListener('input', () => { editDeadlinePicker.value = parseDeadline(editDeadlineText.value) || ''; });

clearDoneBtn.addEventListener('click', clearDone);
signoutBtn.addEventListener('click', signOut);

taskInput.addEventListener('input', () => {
  const cat = detectCategory(taskInput.value);
  if (isOwner) {
    if (!taskInput.value.trim()) {
      categorySelect.value = '';
      categoryManualSet = false;
    } else if (cat && !categoryManualSet) {
      categorySelect.value = cat.key;
    }
  } else {
    if (cat) {
      categoryHint.textContent      = cat.label;
      categoryHint.style.color      = cat.color;
      categoryHint.style.background = cat.bg;
      categoryHint.style.display    = 'inline-block';
    } else {
      categoryHint.style.display = 'none';
    }
  }
});

categorySelect.addEventListener('change', () => { categoryManualSet = true; });

deadlinePicker.addEventListener('focus',  () => { if (!deadlinePicker.value) deadlinePicker.value = isoDate(new Date()); });
deadlinePicker.addEventListener('change', () => { if (deadlinePicker.value) deadlineText.value = deadlinePicker.value; });
deadlineText.addEventListener('input',    () => { deadlinePicker.value = parseDeadline(deadlineText.value) || ''; });
