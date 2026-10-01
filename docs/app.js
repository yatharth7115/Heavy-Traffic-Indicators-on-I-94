const svg = document.getElementById('hour-chart');
const slider = document.getElementById('hour-slider');
const valueEl = document.getElementById('selected-value');
const hourEl = document.getElementById('selected-hour');
const dayLabel = document.getElementById('dial-day-label');
const insightTitle = document.getElementById('insight-title');
const insightCopy = document.getElementById('insight-copy');
const buttons = [...document.querySelectorAll('[data-day]')];
const NS = 'http://www.w3.org/2000/svg';
const fmt = number => Math.round(number).toLocaleString('en-US');
let selectedDay = 'Weekday';
let selectedHour = 16;
let hourly = [];
let spokes = [];

function svgNode(tag, attributes = {}) {
  const element = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
}

function radial(hour, radius) {
  const angle = ((hour * 15) - 90) * Math.PI / 180;
  return [300 + Math.cos(angle) * radius, 300 + Math.sin(angle) * radius];
}

function selectHour(hour) {
  selectedHour = hour;
  const row = hourly.find(item => item.day_type === selectedDay && Number(item.hour) === hour);
  if (!row) return;
  const time = `${String(hour).padStart(2, '0')}:00`;
  hourEl.textContent = time;
  dayLabel.textContent = selectedDay.toUpperCase();
  valueEl.textContent = fmt(row.mean_vehicles);
  insightTitle.textContent = `${time} on ${selectedDay.toLowerCase()}s`;
  insightCopy.textContent = `This observed hour averages ${fmt(row.mean_vehicles)} vehicles in the historical dataset.`;
  slider.value = String(hour);
  slider.setAttribute('aria-valuetext', `${time}, ${fmt(row.mean_vehicles)} mean vehicles per observed hour`);
  for (const {hour: spokeHour, line, tip} of spokes) {
    const active = spokeHour === hour;
    line.setAttribute('stroke', active ? '#bd4936' : '#748886');
    line.setAttribute('stroke-width', active ? '16' : '10');
    line.setAttribute('opacity', active ? '1' : '.78');
    tip.setAttribute('fill', active ? '#bd4936' : '#748886');
    tip.setAttribute('r', active ? '8' : '4');
  }
}

function drawDial() {
  svg.replaceChildren();
  spokes = [];
  [145, 190, 235].forEach(radius => svg.append(svgNode('circle', {cx: 300, cy: 300, r: radius, fill: 'none', stroke: '#c0ccca', 'stroke-width': 1})));
  for (let hour = 0; hour < 24; hour++) {
    const [x1, y1] = radial(hour, 247);
    const [x2, y2] = radial(hour, hour % 3 === 0 ? 260 : 254);
    svg.append(svgNode('line', {x1, y1, x2, y2, stroke: '#849593', 'stroke-width': hour % 3 === 0 ? 2 : 1}));
  }
  const rows = hourly.filter(row => row.day_type === selectedDay).sort((a, b) => a.hour - b.hour);
  for (const row of rows) {
    const hour = Number(row.hour);
    const endRadius = 150 + (Number(row.mean_vehicles) / 7000) * 88;
    const [x1, y1] = radial(hour, 153);
    const [x2, y2] = radial(hour, endRadius);
    const group = svgNode('g', {tabindex: 0, role: 'button', 'aria-label': `${String(hour).padStart(2, '0')}:00, ${fmt(row.mean_vehicles)} mean vehicles`});
    const line = svgNode('line', {x1, y1, x2, y2, stroke: '#748886', 'stroke-width': 10, 'stroke-linecap': 'round'});
    const tip = svgNode('circle', {cx: x2, cy: y2, r: 4, fill: '#748886'});
    const hit = svgNode('line', {x1, y1, x2, y2, stroke: 'transparent', 'stroke-width': 30, 'stroke-linecap': 'round', style: 'cursor:pointer'});
    group.append(line, tip, hit);
    group.addEventListener('mouseenter', () => selectHour(hour));
    group.addEventListener('focus', () => selectHour(hour));
    group.addEventListener('click', () => selectHour(hour));
    group.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectHour(hour); }
    });
    svg.append(group);
    spokes.push({hour, line, tip});
  }
  selectHour(selectedHour);
}

function drawMonths(monthly) {
  const names = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const grid = document.getElementById('month-chart');
  const descriptions = [];
  monthly.sort((a, b) => a.month - b.month).forEach((row, index) => {
    const cell = document.createElement('div');
    cell.className = `month-cell${row.month === 8 ? ' peak' : ''}${row.month === 12 ? ' low' : ''}`;
    cell.style.setProperty('--fill', `${Math.round(((row.mean_vehicles - 2800) / 800) * 100)}%`);
    cell.innerHTML = `<span class="month-label">${names[index]}</span><span class="month-index">${String(row.month).padStart(2, '0')} / 12</span><strong>${fmt(row.mean_vehicles)}</strong>`;
    cell.title = `${names[index]}: ${fmt(row.mean_vehicles)} mean vehicles per observed hour`;
    grid.append(cell);
    descriptions.push(`${names[index]} ${fmt(row.mean_vehicles)}`);
  });
  grid.setAttribute('aria-label', `Monthly mean traffic volume: ${descriptions.join(', ')} vehicles per observed hour`);
}

buttons.forEach(button => button.addEventListener('click', () => {
  selectedDay = button.dataset.day;
  selectedHour = selectedDay === 'Weekday' ? 16 : 13;
  buttons.forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  drawDial();
}));
slider.addEventListener('input', () => selectHour(Number(slider.value)));

fetch('data.json').then(response => {
  if (!response.ok) throw new Error('Chart data unavailable');
  return response.json();
}).then(data => {
  hourly = data.hourly;
  drawDial();
  drawMonths(data.monthly);
}).catch(() => {
  document.querySelector('.dial-stage').textContent = 'Traffic data could not be loaded. Please refresh the page.';
  document.getElementById('month-chart').textContent = 'Monthly data could not be loaded.';
});
