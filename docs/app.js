const svg = document.getElementById('hour-chart');
const slider = document.getElementById('hour-slider');
const valueEl = document.getElementById('selected-value');
const hourEl = document.getElementById('selected-hour');
const insightTitle = document.getElementById('insight-title');
const insightCopy = document.getElementById('insight-copy');
const buttons = [...document.querySelectorAll('[data-day]')];
const NS = 'http://www.w3.org/2000/svg';
let selectedDay = 'Weekday';
let selectedHour = 16;
let hourly = [];

function node(name, attrs = {}) {
  const el = document.createElementNS(NS, name);
  for (const [key, val] of Object.entries(attrs)) el.setAttribute(key, String(val));
  return el;
}

function pointX(hour) { return 30 + (hour / 23) * 940; }
function pointY(volume) { return 285 - (volume / 7000) * 250; }
function formatNumber(number) { return Math.round(number).toLocaleString('en-US'); }

function updateSelected() {
  const row = hourly.find(item => item.day_type === selectedDay && Number(item.hour) === selectedHour);
  if (!row) return;
  valueEl.textContent = formatNumber(row.mean_vehicles);
  hourEl.textContent = `${String(selectedHour).padStart(2, '0')}:00`;
  slider.value = String(selectedHour);
  slider.setAttribute('aria-valuetext', `${hourEl.textContent}, ${valueEl.textContent} mean vehicles per observed hour`);
  insightTitle.textContent = `${hourEl.textContent} on ${selectedDay.toLowerCase()}s`;
  insightCopy.textContent = `This observed hour averages ${valueEl.textContent} vehicles in the historical dataset.`;
  const marker = svg.querySelector('.selection-line');
  if (marker) marker.setAttribute('x1', pointX(selectedHour));
  if (marker) marker.setAttribute('x2', pointX(selectedHour));
  const halo = svg.querySelector('.selection-halo');
  if (halo) { halo.setAttribute('cx', pointX(selectedHour)); halo.setAttribute('cy', pointY(row.mean_vehicles)); }
  const dot = svg.querySelector('.selection-dot');
  if (dot) { dot.setAttribute('cx', pointX(selectedHour)); dot.setAttribute('cy', pointY(row.mean_vehicles)); }
}

function renderHourly() {
  const rows = hourly.filter(item => item.day_type === selectedDay).sort((a, b) => a.hour - b.hour);
  svg.replaceChildren();
  [0, 2000, 4000, 6000].forEach(volume => {
    const y = pointY(volume);
    svg.append(node('line', {x1: 30, x2: 970, y1: y, y2: y, stroke: '#536167', 'stroke-width': 1, opacity: .5}));
    const label = node('text', {x: 28, y: y - 7, fill: '#93a4a5', 'font-size': 15, 'font-family': 'monospace'});
    label.textContent = volume === 0 ? '0' : `${volume / 1000}k`;
    svg.append(label);
  });
  const coords = rows.map(row => [pointX(Number(row.hour)), pointY(Number(row.mean_vehicles))]);
  const line = coords.map(([x, y], index) => `${index ? 'L' : 'M'} ${x} ${y}`).join(' ');
  svg.append(node('path', {d: `${line} L 970 285 L 30 285 Z`, fill: selectedDay === 'Weekday' ? '#fa5b31' : '#d5e2df', opacity: .13}));
  svg.append(node('path', {d: line, fill: 'none', stroke: selectedDay === 'Weekday' ? '#fa5b31' : '#d5e2df', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke'}));
  rows.forEach(row => {
    const hit = node('circle', {cx: pointX(row.hour), cy: pointY(row.mean_vehicles), r: 16, fill: 'transparent', tabindex: 0, role: 'button', 'aria-label': `${String(row.hour).padStart(2, '0')}:00, ${formatNumber(row.mean_vehicles)} mean vehicles`});
    hit.addEventListener('click', () => { selectedHour = Number(row.hour); updateSelected(); });
    hit.addEventListener('mouseenter', () => { selectedHour = Number(row.hour); updateSelected(); });
    hit.addEventListener('focus', () => { selectedHour = Number(row.hour); updateSelected(); });
    hit.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectedHour = Number(row.hour); updateSelected(); } });
    svg.append(hit);
  });
  svg.append(node('line', {class: 'selection-line', x1: 0, x2: 0, y1: 35, y2: 285, stroke: '#e3e7d9', 'stroke-width': 1, 'stroke-dasharray': '5 6', opacity: .7}));
  svg.append(node('circle', {class: 'selection-halo', cx: 0, cy: 0, r: 12, fill: selectedDay === 'Weekday' ? '#fa5b31' : '#d5e2df', opacity: .24}));
  svg.append(node('circle', {class: 'selection-dot', cx: 0, cy: 0, r: 5, fill: selectedDay === 'Weekday' ? '#fa5b31' : '#d5e2df'}));
  updateSelected();
}

function renderMonthly(monthly) {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const container = document.getElementById('month-chart');
  monthly.sort((a, b) => a.month - b.month).forEach(row => {
    const item = document.createElement('div');
    item.className = `month-item${row.month === 8 ? ' peak' : ''}${row.month === 12 ? ' low' : ''}`;
    item.setAttribute('title', `${labels[row.month - 1]}: ${formatNumber(row.mean_vehicles)} mean vehicles per observed hour`);
    const amount = document.createElement('strong'); amount.textContent = formatNumber(row.mean_vehicles);
    const bar = document.createElement('div'); bar.className = 'month-bar';
    bar.style.height = `${(row.mean_vehicles / 3700) * 76}%`;
    const label = document.createElement('span'); label.textContent = labels[row.month - 1];
    item.append(amount, bar, label); container.append(item);
  });
}

buttons.forEach(button => button.addEventListener('click', () => {
  selectedDay = button.dataset.day;
  selectedHour = selectedDay === 'Weekday' ? 16 : 13;
  buttons.forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  renderHourly();
}));
slider.addEventListener('input', () => { selectedHour = Number(slider.value); updateSelected(); });

fetch('data.json').then(response => {
  if (!response.ok) throw new Error('Could not load chart data');
  return response.json();
}).then(data => {
  hourly = data.hourly;
  renderHourly();
  renderMonthly(data.monthly);
}).catch(() => {
  document.querySelector('.chart-wrap').textContent = 'Chart data could not be loaded. Please refresh the page.';
  document.getElementById('month-chart').textContent = 'Monthly data could not be loaded.';
});
