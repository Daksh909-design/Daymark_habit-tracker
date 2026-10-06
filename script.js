// This app saves habits in the browser using localStorage.
const STORAGE_KEY = 'daymark-habits-v1';
const HISTORY_KEY = 'daymark-daily-history-v1';
const THEME_KEY = 'daymark-theme-v1';
const THEMES = ['sunrise', 'midnight', 'lavender', 'forest'];
let today = startOfDay(new Date());
let selectedDate = new Date(today);
let weekOffset = 0;
let editingId = null;
let toastTimer;
let habits = loadHabits();
let dailyHistory = loadDailyHistory();

const $ = (selector) => document.querySelector(selector);
const habitList = $('#habit-list');
const dateList = $('#date-list');
const dialog = $('#habit-dialog');
const form = $('#habit-form');

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function uid() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sampleHabits() {
  const examples = [
    { name: 'Morning routine', icon: '☀', color: 'peach', steps: ['Drink water', 'Make my bed', 'Plan my day'] },
    { name: 'Reading', icon: '📚', color: 'purple', steps: ['Read 10 pages', 'Write one note'] },
    { name: 'Exercise', icon: '🏃', color: 'mint', steps: ['Stretch', 'Go for a walk'] }
  ];
  return examples.map(example => {
    const checkpoints = example.steps.map(label => ({ id: uid(), label }));
    return { id: uid(), name: example.name, icon: example.icon, color: example.color, checkpoints, history: {} };
  });
}

function loadHabits() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return sampleHabits();
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : sampleHabits();
  } catch {
    return sampleHabits();
  }
}

function saveHabits() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  } catch {
    showToast('Could not save. Check browser storage settings.');
  }
}

function loadDailyHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveDailyHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(dailyHistory));
  } catch {
    showToast('Could not save. Check browser storage settings.');
  }
}

function completedFor(habit, date) {
  const saved = habit.history[dateKey(date)];
  return Array.isArray(saved) ? saved.filter(id => habit.checkpoints.some(step => step.id === id)) : [];
}

function currentProgressFor(date) {
  const total = habits.reduce((sum, habit) => sum + habit.checkpoints.length, 0);
  const done = habits.reduce((sum, habit) => sum + completedFor(habit, date).length, 0);
  return { total, done, percent: total ? Math.round(done / total * 100) : 0 };
}

function snapshotDay(date) {
  const key = dateKey(date);
  if (Object.hasOwn(dailyHistory, key)) return false;
  dailyHistory[key] = {};
  habits.forEach(habit => {
    dailyHistory[key][habit.id] = {
      total: habit.checkpoints.length,
      done: completedFor(habit, date).length
    };
  });
  return true;
}

function freezePastProgress() {
  const dates = new Set();
  for (let daysAgo = 1; daysAgo <= 6; daysAgo++) dates.add(dateKey(addDays(today, -daysAgo)));
  habits.forEach(habit => {
    Object.keys(habit.history).forEach(key => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key) && key < dateKey(today)) dates.add(key);
    });
  });
  let changed = false;
  dates.forEach(key => {
    const [year, month, day] = key.split('-').map(Number);
    if (snapshotDay(new Date(year, month - 1, day))) changed = true;
  });
  if (changed) saveDailyHistory();
}

function progressFor(date) {
  const key = dateKey(date);
  if (key < dateKey(today) && Object.hasOwn(dailyHistory, key)) {
    const values = Object.values(dailyHistory[key]);
    const total = values.reduce((sum, value) => sum + value.total, 0);
    const done = values.reduce((sum, value) => sum + value.done, 0);
    return { total, done, percent: total ? Math.round(done / total * 100) : 0 };
  }
  return currentProgressFor(date);
}

function habitProgressFor(habit, date) {
  const key = dateKey(date);
  if (key < dateKey(today) && dailyHistory[key]?.[habit.id]) return dailyHistory[key][habit.id];
  return { total: habit.checkpoints.length, done: completedFor(habit, date).length };
}

function activeStreak(habit) {
  if (!habit.checkpoints.length) return 0;
  let day = new Date(today);
  // An unfinished day does not break yesterday's streak yet.
  let progress = habitProgressFor(habit, day);
  if (progress.done !== progress.total) day = addDays(day, -1);
  let streak = 0;
  while ((progress = habitProgressFor(habit, day)).total > 0 && progress.done === progress.total) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

function renderStats() {
  const { total, done, percent } = progressFor(today);
  $('#today-percent').textContent = `${percent}%`;
  $('#today-meter').style.width = `${percent}%`;
  $('#done-count').textContent = `${done}/${total}`;
  $('#best-streak').textContent = Math.max(0, ...habits.map(activeStreak));
  $('#habit-total').textContent = habits.length;
}

function mondayOf(date) {
  const monday = new Date(date);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  return monday;
}

function weekOffsetFor(date) {
  const selectedMonday = mondayOf(date);
  const currentMonday = mondayOf(today);
  const utcDay = day => Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
  return Math.round((utcDay(selectedMonday) - utcDay(currentMonday)) / (7 * 24 * 60 * 60 * 1000));
}

function syncToday() {
  const current = startOfDay(new Date());
  if (dateKey(current) === dateKey(today)) return false;
  const wasViewingToday = dateKey(selectedDate) === dateKey(today);
  if (current > today && snapshotDay(today)) saveDailyHistory();
  today = current;
  if (wasViewingToday) selectedDate = new Date(today);
  weekOffset = weekOffsetFor(selectedDate);
  $('#header-date').textContent = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  freezePastProgress();
  return true;
}

function refreshDateIfNeeded() {
  if (syncToday()) render();
}

function renderDates() {
  dateList.replaceChildren();
  const monday = addDays(mondayOf(today), weekOffset * 7);
  for (let i = 0; i < 7; i++) {
    const date = addDays(monday, i);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `date-day${dateKey(date) === dateKey(selectedDate) ? ' selected' : ''}`;
    button.disabled = date > today;
    button.setAttribute('aria-label', date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    button.setAttribute('aria-pressed', String(dateKey(date) === dateKey(selectedDate)));
    const weekday = document.createElement('span');
    weekday.className = 'weekday';
    weekday.textContent = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const number = document.createElement('span');
    number.className = 'daynum';
    number.textContent = date.getDate();
    button.append(weekday, number);
    button.addEventListener('click', () => { syncToday(); selectedDate = date; weekOffset = weekOffsetFor(date); render(); });
    dateList.append(button);
  }
  $('#next-week').disabled = weekOffset >= 0;
  $('#viewing-date').textContent = dateKey(selectedDate) === dateKey(today)
    ? 'Viewing today'
    : `Viewing ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
}

function renderHabits() {
  habitList.replaceChildren();
  if (!habits.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<h3>No habits yet</h3><p>Click the button below to add one.</p>';
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'primary-button'; button.textContent = 'Add habit';
    button.addEventListener('click', () => openDialog());
    empty.append(button); habitList.append(empty); return;
  }
  habits.forEach(habit => {
    const doneIds = completedFor(habit, selectedDate);
    const percent = habit.checkpoints.length ? Math.round(doneIds.length / habit.checkpoints.length * 100) : 0;
    const card = document.createElement('article'); card.className = 'habit-card';
    const top = document.createElement('div'); top.className = 'habit-top';
    const icon = document.createElement('div'); icon.className = `habit-icon ${habit.color}`; icon.textContent = habit.icon;
    const title = document.createElement('div'); title.className = 'habit-title';
    const heading = document.createElement('h3'); heading.textContent = habit.name;
    const sub = document.createElement('p'); sub.textContent = `${habit.checkpoints.length} checkpoints · ${activeStreak(habit)} day streak`;
    title.append(heading, sub);
    const progress = document.createElement('div'); progress.className = 'habit-progress';
    const fraction = document.createElement('strong'); fraction.textContent = `${doneIds.length}/${habit.checkpoints.length}`;
    const progressLabel = document.createElement('small'); progressLabel.textContent = 'done'; progress.append(fraction, progressLabel);
    const menu = document.createElement('div'); menu.className = 'card-menu';
    const menuButton = document.createElement('button'); menuButton.className = 'menu-button'; menuButton.type = 'button'; menuButton.setAttribute('aria-label', `Options for ${habit.name}`); menuButton.textContent = '⋯';
    menuButton.addEventListener('click', () => {
      const existing = menu.querySelector('.menu-popup');
      document.querySelectorAll('.menu-popup').forEach(item => item.remove());
      if (existing) return;
      const popup = document.createElement('div'); popup.className = 'menu-popup';
      const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Edit habit'; edit.addEventListener('click', () => openDialog(habit.id));
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Delete habit'; remove.className = 'delete-button';
      remove.addEventListener('click', () => {
        if (confirm(`Delete ${habit.name}? Previous chart totals will stay saved.`)) {
          syncToday();
          freezePastProgress();
          habits = habits.filter(item => item.id !== habit.id); saveHabits(); render(); showToast('Habit deleted');
        }
      });
      popup.append(edit, remove); menu.append(popup);
    });
    menu.append(menuButton); top.append(icon, title, progress, menu);
    const steps = document.createElement('div'); steps.className = 'checkpoint-list';
    habit.checkpoints.forEach(step => {
      const isDone = doneIds.includes(step.id);
      const button = document.createElement('button'); button.type = 'button'; button.className = `checkpoint-button${isDone ? ' done' : ''}`;
      button.setAttribute('aria-pressed', String(isDone));
      button.setAttribute('aria-label', `${step.label}: ${isDone ? 'completed' : 'not completed'}`);
      const box = document.createElement('span'); box.className = 'check-square'; box.textContent = isDone ? '✓' : '';
      const label = document.createElement('span'); label.textContent = step.label;
      button.append(box, label);
      button.addEventListener('click', () => toggleCheckpoint(habit.id, step.id));
      steps.append(button);
    });
    const bottom = document.createElement('div'); bottom.className = 'card-bottom';
    const track = document.createElement('div'); track.className = 'card-track';
    const fill = document.createElement('span'); fill.style.width = `${percent}%`; track.append(fill);
    const percentLabel = document.createElement('span'); percentLabel.textContent = `${percent}%`;
    bottom.append(track, percentLabel); card.append(top, steps, bottom); habitList.append(card);
  });
}

function toggleCheckpoint(habitId, stepId) {
  if (syncToday()) { render(); return; }
  const habit = habits.find(item => item.id === habitId);
  if (!habit) return;
  const key = dateKey(selectedDate);
  const isPastDay = key < dateKey(today);
  if (isPastDay) snapshotDay(selectedDate);
  const done = completedFor(habit, selectedDate);
  habit.history[key] = done.includes(stepId) ? done.filter(id => id !== stepId) : [...done, stepId];
  if (isPastDay) {
    dailyHistory[key][habit.id] = {
      total: habit.checkpoints.length,
      done: completedFor(habit, selectedDate).length
    };
    saveDailyHistory();
  }
  saveHabits(); render();
  if (habit.history[key].length === habit.checkpoints.length) showToast('All checkpoints complete');
}

function renderChart() {
  const chart = $('#week-chart'); chart.replaceChildren();
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const day = addDays(today, -daysAgo);
    const percent = progressFor(day).percent;
    const column = document.createElement('div'); column.className = `chart-column${daysAgo === 0 ? ' today' : ''}`;
    const value = document.createElement('span'); value.className = 'chart-value'; value.textContent = `${percent}%`;
    const wrap = document.createElement('div'); wrap.className = 'chart-bar-wrap';
    const bar = document.createElement('div'); bar.className = 'chart-bar'; bar.style.height = `${percent}%`; wrap.append(bar);
    const label = document.createElement('span'); label.className = 'chart-label';
    label.textContent = daysAgo === 0 ? 'TODAY' : day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    column.append(value, wrap, label); chart.append(column);
  }
}

function render() {
  syncToday();
  renderStats(); renderDates(); renderHabits(); renderChart();
}

function addCheckpointInput(value = '', stepId = '') {
  const container = $('#checkpoint-inputs');
  if (container.children.length >= 5) return;
  const row = document.createElement('div'); row.className = 'checkpoint-input-row';
  const input = document.createElement('input'); input.type = 'text'; input.maxLength = 45; input.required = true;
  input.placeholder = `Step ${container.children.length + 1}`; input.value = value;
  input.dataset.stepId = stepId;
  input.setAttribute('aria-label', `Checkpoint ${container.children.length + 1}`);
  const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-step'; remove.textContent = '×'; remove.setAttribute('aria-label', 'Remove checkpoint');
  remove.addEventListener('click', () => { row.remove(); updateCheckpointInputs(); });
  row.append(input, remove); container.append(row); updateCheckpointInputs();
}

function updateCheckpointInputs() {
  const rows = [...$('#checkpoint-inputs').children];
  rows.forEach((row, index) => {
    row.querySelector('input').placeholder = `Step ${index + 1}`;
    row.querySelector('input').setAttribute('aria-label', `Checkpoint ${index + 1}`);
    row.querySelector('button').hidden = rows.length === 1;
  });
  $('#add-checkpoint').disabled = rows.length >= 5;
}

function openDialog(id = null) {
  if (syncToday()) render();
  editingId = id;
  form.reset(); $('#form-error').hidden = true; $('#checkpoint-inputs').replaceChildren();
  const habit = habits.find(item => item.id === id);
  $('#dialog-title').textContent = habit ? 'Edit habit' : 'New habit';
  $('#save-habit').textContent = habit ? 'Save changes' : 'Create habit';
  if (habit) {
    $('#habit-name').value = habit.name; $('#habit-icon').value = habit.icon; $('#habit-color').value = habit.color;
    habit.checkpoints.forEach(step => addCheckpointInput(step.label, step.id));
  } else {
    addCheckpointInput(); addCheckpointInput();
  }
  dialog.showModal(); $('#habit-name').focus();
}

function showToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
}

function applyTheme(theme) {
  const selected = THEMES.includes(theme) ? theme : 'sunrise';
  document.documentElement.dataset.theme = selected;
  $('#theme-select').value = selected;
  $('#theme-color').content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  try {
    localStorage.setItem(THEME_KEY, selected);
  } catch {
    // The theme still works for this visit when browser storage is unavailable.
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  syncToday();
  const name = $('#habit-name').value.trim();
  const inputs = [...document.querySelectorAll('#checkpoint-inputs input')];
  const labels = inputs.map(input => input.value.trim());
  if (!name || labels.length === 0 || labels.some(label => !label)) {
    $('#form-error').textContent = 'Add a habit name and fill in every checkpoint.';
    $('#form-error').hidden = false; return;
  }
  freezePastProgress();
  if (editingId) {
    const habit = habits.find(item => item.id === editingId);
    if (!habit) return;
    habit.name = name; habit.icon = $('#habit-icon').value; habit.color = $('#habit-color').value;
    // Keep checkpoint IDs when labels are edited so completed history remains linked.
    habit.checkpoints = inputs.map(input => ({ id: input.dataset.stepId || uid(), label: input.value.trim() }));
    showToast('Habit updated');
  } else {
    habits.push({ id: uid(), name, icon: $('#habit-icon').value, color: $('#habit-color').value,
      checkpoints: labels.map(label => ({ id: uid(), label })), history: {} });
    showToast('New habit added');
  }
  saveHabits(); dialog.close(); render();
});

$('#add-habit-top').addEventListener('click', () => openDialog());
$('#add-habit-inline').addEventListener('click', () => openDialog());
$('#close-dialog').addEventListener('click', () => dialog.close());
$('#cancel-dialog').addEventListener('click', () => dialog.close());
$('#add-checkpoint').addEventListener('click', () => addCheckpointInput());
$('#theme-select').addEventListener('change', event => applyTheme(event.target.value));
$('#previous-week').addEventListener('click', () => { syncToday(); weekOffset--; selectedDate = addDays(mondayOf(today), weekOffset * 7); render(); });
$('#next-week').addEventListener('click', () => { syncToday(); if (weekOffset < 0) { weekOffset++; selectedDate = weekOffset === 0 ? new Date(today) : addDays(mondayOf(today), weekOffset * 7); render(); } });
document.addEventListener('click', event => {
  if (!event.target.closest('.card-menu')) document.querySelectorAll('.menu-popup').forEach(item => item.remove());
});
$('#header-date').textContent = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
applyTheme(document.documentElement.dataset.theme);
freezePastProgress();
saveHabits();
render();
window.addEventListener('focus', refreshDateIfNeeded);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDateIfNeeded(); });
setInterval(refreshDateIfNeeded, 30 * 1000);
