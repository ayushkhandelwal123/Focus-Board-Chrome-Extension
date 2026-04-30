/**
 * FocusBoard — script.js
 * Phase 1: Foundation, Clock, Greeting, Daily Focus, Wallpaper
 */

/* =============================================
   STORAGE KEYS
   ============================================= */
const KEYS = {
  userName: 'fb_userName',
  wallpaperType: 'fb_wallpaperType',   // 'default' | 'custom'
  wallpaperData: 'fb_wallpaperData',   // base64 Data URL
  focusDate: 'fb_focusDate',           // YYYY-MM-DD
  focusText: 'fb_focusText',
};

/* =============================================
   UTILITY: chrome.storage.local wrappers
   ============================================= */

/**
 * Get multiple keys from chrome.storage.local.
 * Falls back to localStorage when running outside the extension context (dev preview).
 */
function storageGet(keys) {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(keys, (result) => resolve(result));
    } else {
      // Dev/browser fallback
      const result = {};
      keys.forEach((k) => {
        const val = localStorage.getItem(k);
        if (val !== null) result[k] = JSON.parse(val);
      });
      resolve(result);
    }
  });
}

/**
 * Set key/value pairs in chrome.storage.local.
 */
function storageSet(obj) {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set(obj, resolve);
    } else {
      Object.entries(obj).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
      resolve();
    }
  });
}

/* =============================================
   UTILITY: Date helpers
   ============================================= */

/** Returns today's date as YYYY-MM-DD (local time). */
function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Returns the time-of-day greeting string. */
function getGreeting(name) {
  const hour = new Date().getHours();
  let salutation;
  if (hour < 12)       salutation = 'Good morning';
  else if (hour < 17)  salutation = 'Good afternoon';
  else                 salutation = 'Good evening';

  return name ? `${salutation}, ${name}.` : `${salutation}.`;
}

/* =============================================
   UTILITY: Format clock
   ============================================= */
function formatTime(date) {
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/* =============================================
   CLOCK MODULE
   ============================================= */
const clockTimeEl = document.getElementById('clock-time');
const clockDateEl = document.getElementById('clock-date');

let _lastDateString = null;

function tickClock() {
  const now = new Date();
  clockTimeEl.textContent = formatTime(now);
  clockDateEl.textContent = formatDate(now);

  // Detect date change while tab is open (Task 1.6)
  const todayStr = getTodayDateString();
  if (_lastDateString && _lastDateString !== todayStr) {
    // The day rolled over while the tab was open → reset focus
    onDayChange();
  }
  _lastDateString = todayStr;
}

function startClock() {
  // Seed _lastDateString BEFORE first tick to avoid false day-change detection
  _lastDateString = getTodayDateString();
  tickClock();
  setInterval(tickClock, 1000);
}

/* =============================================
   GREETING MODULE
   ============================================= */
const greetingEl = document.getElementById('greeting-text');

function renderGreeting(name) {
  greetingEl.textContent = getGreeting(name);
}

/* =============================================
   WALLPAPER MODULE  (Tasks 1.2, 1.7)
   ============================================= */
const wallpaperEl = document.getElementById('wallpaper');
const wallpaperInput = document.getElementById('wallpaper-input');

function applyWallpaper(type, data) {
  if (type === 'custom' && data) {
    wallpaperEl.style.backgroundImage = `url('${data}')`;
  } else {
    wallpaperEl.style.backgroundImage = `url('assets/default_wallpaper.png')`;
  }
}

wallpaperInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (ev) => {
    const dataUrl = ev.target.result;
    await storageSet({ [KEYS.wallpaperType]: 'custom', [KEYS.wallpaperData]: dataUrl });
    applyWallpaper('custom', dataUrl);
  };
  reader.readAsDataURL(file);
});

/* =============================================
   ONBOARDING MODULE  (Task 1.4)
   ============================================= */
const onboardingModal = document.getElementById('onboarding-modal');
const dashboardEl = document.getElementById('dashboard');
const nameInput = document.getElementById('name-input');
const nameSaveBtn = document.getElementById('name-save-btn');

function showOnboarding() {
  onboardingModal.classList.remove('hidden');
  dashboardEl.classList.add('hidden');
  setTimeout(() => nameInput.focus(), 100);
}

function showDashboard() {
  onboardingModal.classList.add('hidden');
  dashboardEl.classList.remove('hidden');
}

async function saveName() {
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.style.borderColor = 'hsl(0, 80%, 60%)';
    setTimeout(() => (nameInput.style.borderColor = ''), 800);
    nameInput.focus();
    return;
  }
  await storageSet({ [KEYS.userName]: name });
  showDashboard();
  renderGreeting(name);
  // New user — no focus set yet, show the input prompt
  showFocusInput();
}

nameSaveBtn.addEventListener('click', saveName);
nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveName(); });

/* =============================================
   DAILY FOCUS MODULE  (Tasks 1.5, 1.6)
   ============================================= */
const focusInputState   = document.getElementById('focus-input-state');
const focusDisplayState = document.getElementById('focus-display-state');
const focusInput        = document.getElementById('focus-input');
const focusSaveBtn      = document.getElementById('focus-save-btn');
const focusDisplayText  = document.getElementById('focus-display-text');
const focusEditBtn      = document.getElementById('focus-edit-btn');

function showFocusInput() {
  focusInput.value = '';
  focusInputState.classList.remove('hidden');
  focusDisplayState.classList.add('hidden');
  setTimeout(() => focusInput.focus(), 80);
}

function showFocusDisplay(text) {
  focusDisplayText.textContent = text;
  focusDisplayState.classList.remove('hidden');
  focusInputState.classList.add('hidden');
}

async function saveAndDisplayFocus() {
  const text = focusInput.value.trim();
  if (!text) return;
  const today = getTodayDateString();
  await storageSet({ [KEYS.focusDate]: today, [KEYS.focusText]: text });
  showFocusDisplay(text);
}

/** Called when a new calendar day is detected while the tab is open. */
async function onDayChange() {
  await storageSet({ [KEYS.focusDate]: '', [KEYS.focusText]: '' });
  showFocusInput();
}

focusSaveBtn.addEventListener('click', saveAndDisplayFocus);
focusInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveAndDisplayFocus(); });
focusEditBtn.addEventListener('click', showFocusInput);

/* =============================================
   PHASE 2 — TASK LIST MODULE
   Tasks 2.1, 2.2, 2.3, 2.4
   ============================================= */

/* ---------- Storage key ---------- */
const TASK_KEY = 'fb_tasks';

/* ---------- DOM refs ---------- */
const taskInput         = document.getElementById('task-input');
const taskListEl        = document.getElementById('task-list');
const taskEmptyState    = document.getElementById('task-empty-state');
const taskCountBadge    = document.getElementById('task-count-badge');
const taskFooter        = document.getElementById('task-footer');
const taskCompletedLabel = document.getElementById('task-completed-label');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

/* ---------- In-memory task state ---------- */
let tasks = [];   // Array of task objects

/* ---------- Task object factory (Task 2.2) ---------- */
function createTask(text) {
  return {
    id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/* ---------- Persist helpers (Task 2.2) ---------- */
async function saveTasks() {
  await storageSet({ [TASK_KEY]: tasks });
}

async function loadTasks() {
  const data = await storageGet([TASK_KEY]);
  return Array.isArray(data[TASK_KEY]) ? data[TASK_KEY] : [];
}

/* ---------- UI helpers ---------- */
function updateTaskMeta() {
  const total     = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active    = total - completed;

  // Count badge — show active task count
  if (active > 0) {
    taskCountBadge.textContent = active;
    taskCountBadge.classList.remove('hidden');
  } else {
    taskCountBadge.classList.add('hidden');
  }

  // Empty state
  if (total === 0) {
    taskEmptyState.style.display = 'flex';
  } else {
    taskEmptyState.style.display = 'none';
  }

  // Footer — show only when there are completed tasks
  if (completed > 0) {
    taskCompletedLabel.textContent = `${completed} completed`;
    taskFooter.classList.remove('hidden');
  } else {
    taskFooter.classList.add('hidden');
  }
}

/* ---------- Render a single task item (Task 2.4) ---------- */
function createTaskEl(task) {
  const item = document.createElement('div');
  item.className = `task-item${task.completed ? ' completed' : ''}`;
  item.dataset.id = task.id;
  item.setAttribute('role', 'listitem');

  // Checkbox
  const checkbox = document.createElement('div');
  checkbox.className = `task-checkbox${task.completed ? ' checked' : ''}`;
  checkbox.setAttribute('role', 'checkbox');
  checkbox.setAttribute('aria-checked', String(task.completed));
  checkbox.setAttribute('tabindex', '0');
  checkbox.title = task.completed ? 'Mark as active' : 'Mark as done';

  // Text
  const textEl = document.createElement('span');
  textEl.className = 'task-text';
  textEl.textContent = task.text;

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.className = 'task-delete-btn';
  delBtn.setAttribute('aria-label', 'Delete task');
  delBtn.title = 'Delete';
  delBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  // --- Events ---

  // Toggle completion (Task 2.4)
  const toggle = async () => {
    task.completed = !task.completed;
    task.updatedAt = new Date().toISOString();
    item.classList.toggle('completed', task.completed);
    checkbox.classList.toggle('checked', task.completed);
    checkbox.setAttribute('aria-checked', String(task.completed));
    checkbox.title = task.completed ? 'Mark as active' : 'Mark as done';
    await saveTasks();
    updateTaskMeta();
  };
  checkbox.addEventListener('click', toggle);
  checkbox.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') toggle(); });

  // Delete (Task 2.4)
  delBtn.addEventListener('click', async () => {
    // Animate out then remove
    item.style.animation = 'taskFadeOut 180ms ease forwards';
    item.addEventListener('animationend', async () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      item.remove();
      await saveTasks();
      updateTaskMeta();
    }, { once: true });
  });

  item.append(checkbox, textEl, delBtn);
  return item;
}

/* ---------- Render all tasks (Task 2.3) ---------- */
function renderTasks() {
  taskListEl.innerHTML = '';
  tasks.forEach((task) => taskListEl.appendChild(createTaskEl(task)));
  updateTaskMeta();
}

/* ---------- Add task (Task 2.3) ---------- */
async function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const task = createTask(text);
  tasks.unshift(task);             // Add to top
  taskInput.value = '';

  // Prepend DOM element without full re-render
  const el = createTaskEl(task);
  taskListEl.insertBefore(el, taskListEl.firstChild);

  await saveTasks();
  updateTaskMeta();
  taskInput.focus();
}

/* ---------- Clear completed (footer button) ---------- */
clearCompletedBtn.addEventListener('click', async () => {
  const completedEls = taskListEl.querySelectorAll('.task-item.completed');
  completedEls.forEach((el) => {
    el.style.animation = 'taskFadeOut 180ms ease forwards';
    el.addEventListener('animationend', () => el.remove(), { once: true });
  });
  tasks = tasks.filter((t) => !t.completed);
  await saveTasks();
  // Slight delay so animation runs before meta update
  setTimeout(updateTaskMeta, 200);
});

/* ---------- Enter key listener (Task 2.3) ---------- */
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

/* ---------- Init tasks (called from main init) ---------- */
async function initTasks() {
  tasks = await loadTasks();
  renderTasks();
}

/* =============================================
   PHASE 3 — FOCUS MODE  (Tasks 3.1, 3.2)
   ============================================= */

const FOCUS_MODE_KEY    = 'fb_focusModeEnabled';
const BLOCKED_DOMAINS_KEY = 'fb_blockedDomains';

const focusModeBtn = document.getElementById('focus-mode-btn');

/* Read current state and apply visual toggle */
async function initFocusMode() {
  const data = await storageGet([FOCUS_MODE_KEY]);
  const enabled = data[FOCUS_MODE_KEY] === true;
  applyFocusModeUI(enabled);
}

function applyFocusModeUI(enabled) {
  focusModeBtn.setAttribute('aria-pressed', String(enabled));
  focusModeBtn.classList.toggle('active', enabled);
  focusModeBtn.title = enabled ? 'Focus Mode ON – click to disable' : 'Click to enable Focus Mode';
}

focusModeBtn.addEventListener('click', async () => {
  const data = await storageGet([FOCUS_MODE_KEY]);
  const newState = !(data[FOCUS_MODE_KEY] === true);
  await storageSet({ [FOCUS_MODE_KEY]: newState });
  applyFocusModeUI(newState);
  showToast(newState ? '🔒 Focus Mode enabled' : '🔓 Focus Mode disabled');
});

/* =============================================
   PHASE 4 — SETTINGS PANEL  (Tasks 4.1–4.5)
   ============================================= */

/* ---------- DOM refs ---------- */
const settingsBtn         = document.getElementById('settings-btn');
const settingsOverlay     = document.getElementById('settings-overlay');
const settingsCloseBtn    = document.getElementById('settings-close-btn');
const settingsNameInput   = document.getElementById('settings-name-input');
const settingsNameSave    = document.getElementById('settings-name-save');
const settingsWpInput     = document.getElementById('settings-wallpaper-input');
const settingsWpReset     = document.getElementById('settings-wallpaper-reset');
const settingsDomainInput = document.getElementById('settings-domain-input');
const settingsDomainAdd   = document.getElementById('settings-domain-add');
const settingsDomainList  = document.getElementById('settings-domain-list');
const settingsResetAll    = document.getElementById('settings-reset-all');

/* ---------- Toast (Task 4.5) ---------- */
let _toastTimer = null;
function showToast(msg) {
  let toast = document.getElementById('fb-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'fb-toast';
    toast.className = 'settings-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ---------- Open / Close ---------- */
function openSettings() {
  settingsOverlay.classList.remove('hidden');
  // Pre-fill name
  storageGet([KEYS.userName]).then((d) => {
    settingsNameInput.value = d[KEYS.userName] || '';
  });
  // Render domain list
  renderDomainList();
  setTimeout(() => settingsNameInput.focus(), 200);
}

function closeSettings() {
  settingsOverlay.classList.add('hidden');
}

settingsBtn.addEventListener('click', openSettings);
settingsCloseBtn.addEventListener('click', closeSettings);
settingsOverlay.addEventListener('click', (e) => {
  if (e.target === settingsOverlay) closeSettings();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSettings();
});

/* ---------- Task 4.2: Save name from settings ---------- */
async function saveSettingsName() {
  const name = settingsNameInput.value.trim();
  if (!name) return;
  await storageSet({ [KEYS.userName]: name });
  renderGreeting(name);
  showToast('✓ Name updated');
}

settingsNameSave.addEventListener('click', saveSettingsName);
settingsNameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveSettingsName(); });

/* ---------- Task 4.2: Wallpaper from settings ---------- */
settingsWpInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    const dataUrl = ev.target.result;
    await storageSet({ [KEYS.wallpaperType]: 'custom', [KEYS.wallpaperData]: dataUrl });
    applyWallpaper('custom', dataUrl);
    showToast('✓ Wallpaper updated');
  };
  reader.readAsDataURL(file);
});

settingsWpReset.addEventListener('click', async () => {
  await storageSet({ [KEYS.wallpaperType]: 'default', [KEYS.wallpaperData]: '' });
  applyWallpaper('default', null);
  showToast('✓ Default wallpaper restored');
});

/* ---------- Task 4.3: Block List Editor ---------- */
let _domains = [];

async function loadDomains() {
  const data = await storageGet([BLOCKED_DOMAINS_KEY]);
  _domains = Array.isArray(data[BLOCKED_DOMAINS_KEY]) ? data[BLOCKED_DOMAINS_KEY] : [];
}

async function saveDomains() {
  await storageSet({ [BLOCKED_DOMAINS_KEY]: _domains });
}

function renderDomainList() {
  loadDomains().then(() => {
    settingsDomainList.innerHTML = '';
    if (_domains.length === 0) {
      settingsDomainList.innerHTML = `<p class="empty-domain-msg">No sites blocked yet.</p>`;
      return;
    }
    _domains.forEach((domain, idx) => {
      const chip = document.createElement('div');
      chip.className = 'domain-chip';
      chip.setAttribute('role', 'listitem');

      const text = document.createElement('span');
      text.className = 'domain-chip-text';
      text.textContent = domain;

      const delBtn = document.createElement('button');
      delBtn.className = 'domain-chip-delete';
      delBtn.setAttribute('aria-label', `Remove ${domain}`);
      delBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

      delBtn.addEventListener('click', async () => {
        _domains.splice(idx, 1);
        await saveDomains();
        renderDomainList();
        showToast(`✓ Removed ${domain}`);
      });

      chip.append(text, delBtn);
      settingsDomainList.appendChild(chip);
    });
  });
}

async function addDomain() {
  let raw = settingsDomainInput.value.trim().toLowerCase();
  if (!raw) return;
  // Strip protocol/www
  raw = raw.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  if (!raw || _domains.includes(raw)) {
    showToast('Domain already in list or invalid');
    return;
  }
  _domains.push(raw);
  await saveDomains();
  settingsDomainInput.value = '';
  renderDomainList();
  showToast(`✓ Added ${raw}`);
}

settingsDomainAdd.addEventListener('click', addDomain);
settingsDomainInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addDomain(); });

/* ---------- Task 4.4: Reset All Data ---------- */
settingsResetAll.addEventListener('click', async () => {
  const confirmed = confirm(
    'Reset all FocusBoard data?\n\nThis will clear your name, daily focus, tasks, wallpaper, and settings. This cannot be undone.'
  );
  if (!confirmed) return;

  if (typeof chrome !== 'undefined' && chrome.storage) {
    await chrome.storage.local.clear();
  } else {
    localStorage.clear();
  }
  location.reload();
});

/* =============================================
   APP INIT
   ============================================= */
async function init() {
  const data = await storageGet([
    KEYS.userName,
    KEYS.wallpaperType,
    KEYS.wallpaperData,
    KEYS.focusDate,
    KEYS.focusText,
    FOCUS_MODE_KEY,
  ]);

  // 1. Apply wallpaper
  applyWallpaper(data[KEYS.wallpaperType], data[KEYS.wallpaperData]);

  // 2. Start clock
  startClock();

  // 3. Check name
  const name = data[KEYS.userName];
  if (!name) {
    showOnboarding();
    return;
  }

  // 4. Show dashboard
  showDashboard();
  renderGreeting(name);

  // 5. Daily focus
  const savedDate = data[KEYS.focusDate];
  const savedText = data[KEYS.focusText];
  const today = getTodayDateString();
  _lastDateString = today;

  if (savedDate === today && savedText) {
    showFocusDisplay(savedText);
  } else {
    showFocusInput();
  }

  // 6. Initialize task list (Phase 2)
  await initTasks();

  // 7. Initialize Focus Mode UI (Phase 3)
  const focusEnabled = data[FOCUS_MODE_KEY] === true;
  applyFocusModeUI(focusEnabled);
}

// Kick off
document.addEventListener('DOMContentLoaded', init);
