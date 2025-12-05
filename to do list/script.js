/* Smooth Pro To-Do
   - localStorage based
   - drag & drop reorder
   - swipe-to-delete (touch + mouse)
   - confetti + sound on complete
   - dark/light mode
   - categories & filters
*/

const $ = id => document.getElementById(id);

const taskListEl = $('taskList');
const inputEl = $('taskInput');
const addBtn = $('addBtn');
const priorityEl = $('priority');
const categoryEl = $('category');
const viewFilterEl = $('viewFilter');
const categoryFilterEl = $('categoryFilter');
const clearCompletedBtn = $('clearCompleted');
const clearAllBtn = $('clearAll');
const themeToggle = $('themeToggle');
const confettiCanvas = document.getElementById('confettiCanvas');

let tasks = []; // array of task objects {id, text, category, priority, time, completed}
let dragSrcId = null;
let touchData = new Map(); // for swipe handling

/* ---------- Initialization ---------- */
document.addEventListener('DOMContentLoaded', init);
addBtn.addEventListener('click', onAdd);
inputEl.addEventListener('keydown', e => { if(e.key === 'Enter') onAdd(); });
viewFilterEl.addEventListener('change', render);
categoryFilterEl.addEventListener('change', render);
clearCompletedBtn.addEventListener('click', clearCompleted);
clearAllBtn.addEventListener('click', clearAll);
themeToggle.addEventListener('click', toggleTheme);
window.addEventListener('resize', resizeCanvas);

function init(){
  loadState();
  applyTheme();
  render();
  resizeCanvas();
}

/* ---------- Storage ---------- */
function saveState(){ localStorage.setItem('todo_tasks_v1', JSON.stringify(tasks)); }
function loadState(){ tasks = JSON.parse(localStorage.getItem('todo_tasks_v1')) || []; }

/* ---------- Add ---------- */
function onAdd(){
  const text = inputEl.value.trim();
  if(!text) { inputEl.focus(); pulse(inputEl); return; }
  const t = {
    id: Date.now(),
    text,
    category: categoryEl.value,
    priority: priorityEl.value,
    time: new Date().toLocaleString(),
    completed: false
  };
  tasks.unshift(t); // newest on top
  saveState();
  inputEl.value = '';
  render();
}

/* ---------- Render ---------- */
function render(){
  taskListEl.innerHTML = '';
  const view = viewFilterEl.value;
  const cat = categoryFilterEl.value;

  let visible = tasks.filter(t => {
    if(view === 'pending' && t.completed) return false;
    if(view === 'completed' && !t.completed) return false;
    if(cat !== 'all' && t.category !== cat) return false;
    return true;
  });

  // preserve order in tasks array (already stored)
  visible.forEach(task => {
    taskListEl.appendChild(createTaskElement(task));
  });
}

/* ---------- Element Creation ---------- */
function createTaskElement(task){
  const li = document.createElement('li');
  li.className = 'task';
  li.setAttribute('draggable', 'true');
  li.dataset.id = task.id;

  // left: checkbox + content
  const left = document.createElement('div'); left.className = 'task-left';
  const checkbox = document.createElement('button'); checkbox.className='checkbox'; checkbox.setAttribute('aria-label','Toggle complete');

  checkbox.innerHTML = task.completed ? checkedSVG() : uncheckedSVG();
  checkbox.addEventListener('click', (e) => {
    e.stopPropagation();
    smoothComplete(task.id, li);
  });

  const content = document.createElement('div'); content.className='task-content';
  const title = document.createElement('div'); title.className='task-title'; title.textContent = task.text;
  const meta = document.createElement('div'); meta.className='task-meta';
  const time = document.createElement('span'); time.textContent = task.time;
  const cat = document.createElement('span'); cat.className='pill'; cat.textContent = task.category;
  const pr = document.createElement('span'); pr.className='pill ' + (task.priority==='Low' ? 'p-low' : task.priority==='Medium' ? 'p-medium' : 'p-high'); pr.textContent = task.priority;

  meta.appendChild(time); meta.appendChild(cat); meta.appendChild(pr);
  content.appendChild(title); content.appendChild(meta);

  left.appendChild(checkbox); left.appendChild(content);

  // actions
  const actions = document.createElement('div'); actions.className='actions';
  const editBtn = iconBtn('✎', ()=> editTask(task.id));
  const deleteBtn = iconBtn('✖', ()=> smoothDelete(task.id, li));
  actions.appendChild(editBtn); actions.appendChild(deleteBtn);

  if(task.completed) li.classList.add('completed');

  li.appendChild(left); li.appendChild(actions);

  /* drag events */
  li.addEventListener('dragstart', onDragStart);
  li.addEventListener('dragover', onDragOver);
  li.addEventListener('drop', onDrop);
  li.addEventListener('dragend', onDragEnd);

  /* swipe (touch) */
  li.addEventListener('touchstart', onTouchStart, {passive:true});
  li.addEventListener('touchmove', onTouchMove, {passive:true});
  li.addEventListener('touchend', onTouchEnd);

  /* mouse swipe (click+drag horizontally) - optional */
  li.addEventListener('pointerdown', onPointerDown);
  li.addEventListener('pointerup', onPointerUp);
  li.addEventListener('pointermove', onPointerMove);

  /* nice entrance */
  li.animate([{opacity:0, transform:'translateY(12px)'},{opacity:1, transform:'translateY(0)'}], {duration:260, easing:'cubic-bezier(.2,.9,.2,1)'});

  return li;
}

/* ---------- Buttons helpers ---------- */
function iconBtn(label, cb){
  const b = document.createElement('button');
  b.className='icon-btn';
  b.setAttribute('aria-label', label);
  b.innerText = label;
  b.addEventListener('click', (e)=>{ e.stopPropagation(); cb(); });
  return b;
}

/* ---------- Edit ---------- */
function editTask(id){
  const t = tasks.find(x=>x.id===id);
  if(!t) return;
  const val = prompt('Edit task', t.text);
  if(val != null && val.trim()!==''){ t.text = val.trim(); saveState(); render(); }
}

/* ---------- Smooth Complete (confetti + sound) ---------- */
function smoothComplete(id, li){
  // small glow animation before toggling
  li.classList.add('completed');
  li.animate([{boxShadow:'0 0 0 rgba(0,0,0,0)'},{boxShadow:`0 0 20px rgba(100,255,180,0.12)`}], {duration: 320, fill:'forwards'});
  playSound('complete');
  fireConfetti();
  setTimeout(()=>{ toggleComplete(id); }, 280);
}
function toggleComplete(id){
  tasks = tasks.map(t => t.id===id ? {...t, completed: !t.completed} : t);
  saveState(); render();
}

/* ---------- Smooth Delete (swipe) ---------- */
function smoothDelete(id, li){
  // animate slide out
  li.classList.add('delete-anim');
  playSound('delete');
  setTimeout(()=>{ deleteTask(id); }, 380);
}
function deleteTask(id){
  tasks = tasks.filter(t => t.id !== id);
  saveState(); render();
}

/* ---------- Clear helpers ---------- */
function clearCompleted(){
  tasks = tasks.filter(t => !t.completed); saveState(); render();
}
function clearAll(){
  if(!confirm('Clear all tasks?')) return;
  tasks = []; saveState(); render();
}

/* ---------- Drag & Drop ---------- */
function onDragStart(e){
  const id = e.currentTarget.dataset.id;
  dragSrcId = id;
  e.dataTransfer?.setData('text/plain', id);
  e.currentTarget.classList.add('dragging');
}
function onDragOver(e){
  e.preventDefault();
  const over = e.currentTarget;
  const overId = over.dataset.id;
  if(!dragSrcId || dragSrcId === overId) return;
  // show placeholder by swapping visually
  const srcIndex = tasks.findIndex(t => t.id == dragSrcId);
  const overIndex = tasks.findIndex(t => t.id == overId);
  if(srcIndex < 0 || overIndex < 0) return;
  // move item in array
  const tmp = tasks.splice(srcIndex,1)[0];
  tasks.splice(overIndex, 0, tmp);
  saveState();
  render(); // re-render to reflect position
}
function onDrop(e){
  e.preventDefault();
  dragSrcId = null;
}
function onDragEnd(e){
  e.currentTarget.classList.remove('dragging');
  dragSrcId = null;
}

/* ---------- Swipe (touch) handling ---------- */
function onTouchStart(e){
  const el = e.currentTarget;
  const id = el.dataset.id;
  const t = e.touches[0];
  touchData.set(id, {startX: t.clientX, curX: t.clientX});
}
function onTouchMove(e){
  const el = e.currentTarget;
  const id = el.dataset.id;
  const data = touchData.get(id);
  if(!data) return;
  const t = e.touches[0];
  data.curX = t.clientX;
  const dx = data.curX - data.startX;
  // only horizontal
  el.style.transform = `translateX(${dx}px)`;
  el.style.transition = 'transform 0s';
}
function onTouchEnd(e){
  const el = e.currentTarget;
  const id = el.dataset.id;
  const data = touchData.get(id);
  if(!data) return;
  const dx = data.curX - data.startX;
  el.style.transition = 'transform .28s cubic-bezier(.2,.9,.2,1)';
  if(Math.abs(dx) > 100){
    // swipe detected -> delete if swiped right or left
    el.style.transform = `translateX(${dx>0? 500 : -500}px)`;
    smoothDelete(Number(id), el);
  } else {
    el.style.transform = 'translateX(0)';
  }
  touchData.delete(id);
}

/* Pointer fallback for desktop "swipe" */
let pointer = {};
function onPointerDown(e){
  const el = e.currentTarget;
  el.setPointerCapture?.(e.pointerId);
  pointer[el.dataset.id] = {down:true, startX: e.clientX, curX: e.clientX};
}
function onPointerMove(e){
  const el = e.currentTarget;
  const p = pointer[el.dataset.id];
  if(!p || !p.down) return;
  p.curX = e.clientX;
  const dx = p.curX - p.startX;
  if(Math.abs(dx) > 6){
    el.style.transform = `translateX(${dx}px)`;
    el.style.transition = 'transform 0s';
  }
}
function onPointerUp(e){
  const el = e.currentTarget;
  const p = pointer[el.dataset.id];
  if(!p) return;
  const dx = p.curX - p.startX;
  el.style.transition = 'transform .28s cubic-bezier(.2,.9,.2,1)';
  if(Math.abs(dx) > 160){
    el.style.transform = `translateX(${dx>0? 500 : -500}px)`;
    smoothDelete(Number(el.dataset.id), el);
  } else {
    el.style.transform = 'translateX(0)';
  }
  delete pointer[el.dataset.id];
}

/* ---------- Confetti (canvas particles) ---------- */
let confettiCtx, confettiW, confettiH, confettiPieces=[];
function resizeCanvas(){
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiW = confettiCanvas.width; confettiH = confettiCanvas.height;
  confettiCtx = confettiCanvas.getContext('2d');
}
function fireConfetti(){
  // create 40 pieces
  for(let i=0;i<40;i++){
    confettiPieces.push({
      x: Math.random()*confettiW,
      y: -10 - Math.random()*200,
      vx: (Math.random()-0.5)*4,
      vy: 2 + Math.random()*4,
      size: 6 + Math.random()*8,
      rot: Math.random()*360,
      color: `hsl(${Math.floor(Math.random()*360)}, 85%, 60%)`,
      ttl: 160 + Math.random()*120
    });
  }
  if(!confettiLoop) confettiLoop = requestAnimationFrame(confettiFrame);
}
let confettiLoop = null;
function confettiFrame(){
  confettiCtx.clearRect(0,0,confettiW,confettiH);
  for(let i=confettiPieces.length-1;i>=0;i--){
    const p = confettiPieces[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.rot += 8;
    p.ttl--;
    confettiCtx.save();
    confettiCtx.translate(p.x,p.y);
    confettiCtx.rotate(p.rot * Math.PI/180);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
    confettiCtx.restore();
    if(p.y > confettiH + 40 || p.ttl <=0) confettiPieces.splice(i,1);
  }
  if(confettiPieces.length>0){
    confettiLoop = requestAnimationFrame(confettiFrame);
  } else {
    cancelAnimationFrame(confettiLoop);
    confettiLoop = null;
    confettiCtx.clearRect(0,0,confettiW,confettiH);
  }
}

/* ---------- Sounds (WebAudio) ---------- */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const aCtx = new AudioCtx();
function playSound(type){
  const now = aCtx.currentTime;
  const o = aCtx.createOscillator();
  const g = aCtx.createGain();
  o.connect(g); g.connect(aCtx.destination);
  if(type === 'complete'){
    o.type='sine'; o.frequency.setValueAtTime(880, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.08, now+0.02);
    o.start(now); o.stop(now+0.12);
  } else if(type === 'delete'){
    o.type='triangle'; o.frequency.setValueAtTime(320, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.06, now+0.02);
    o.start(now); o.stop(now+0.14);
  } else {
    o.type='sine'; o.frequency.setValueAtTime(440, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.05, now+0.02);
    o.start(now); o.stop(now+0.08);
  }
}

/* ---------- Theme ---------- */
function applyTheme(){
  const theme = localStorage.getItem('todo_theme') || 'dark';
  if(theme === 'light'){ document.documentElement.classList.add('light'); themeToggle.textContent = '🌙'; }
  else { document.documentElement.classList.remove('light'); themeToggle.textContent = '🌞'; }
}
function toggleTheme(){
  const isLight = document.documentElement.classList.toggle('light');
  localStorage.setItem('todo_theme', isLight ? 'light' : 'dark');
  applyTheme();
}

/* ---------- Helpers ---------- */
function pulse(el){
  el.animate([{transform:'scale(1)'},{transform:'scale(1.03)'},{transform:'scale(1)'}], {duration:260, easing:'ease-out'});
}

/* ---------- Utility: checked SVGs ---------- */
function checkedSVG(){ return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="#65e08a" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
function uncheckedSVG(){ return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="rgba(255,255,255,0.6)" stroke-width="1.6"/></svg>`; }

/* ---------- Kick off when page loaded ---------- */
init();

