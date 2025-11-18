/* professional app.js */
const INVOICE_EVERY_N = 5;
const state = { currentCategory:null, pool:[], index:0, score:0, sciCount:0, invoices: JSON.parse(localStorage.getItem('ab_invoices')||'[]'), recent:[] };

function $id(id){ return document.getElementById(id); }

function init(){
  if(typeof questions === 'undefined'){ console.error('questions.js missing'); $id('categories').innerHTML='<div class="card">سوالات بارگذاری نشده‌اند.</div>'; return; }
  renderCategories();
  document.getElementById('startBtn').addEventListener('click', ()=> $id('categories').scrollIntoView({behavior:'smooth'}));
  document.getElementById('closeModal').addEventListener('click', ()=> { $id('invoiceModal').classList.remove('show'); $id('invoiceModal').setAttribute('aria-hidden','true'); });
  setupConfetti();
  renderInvoices();
}

function renderCategories(){
  const cats = Object.keys(questions);
  const el = $id('categories'); el.innerHTML='';
  cats.forEach(c=>{ const d=document.createElement('div'); d.className='cat'; d.textContent = c + ' (' + (questions[c] ? questions[c].length : 0) + ')'; d.onclick = ()=> startCategory(c); el.appendChild(d); });
}

function startCategory(cat){
  state.currentCategory = cat; state.pool = questions[cat] ? [...questions[cat]] : []; shuffle(state.pool); state.index=0; $id('quizSection').hidden=false; renderQuestion();
}

function renderQuestion(){
  const q = state.pool[state.index]; if(!q){ endCategory(); return; }
  $id('catLabel').textContent = state.currentCategory;
  $id('questionText').textContent = q.q;
  const answers = $id('answers'); answers.innerHTML='';
  q.options.forEach((opt,i)=>{ const b=document.createElement('button'); b.className='answer'; b.textContent=opt; b.onclick = ()=> handleAnswer(i, q.answer); answers.appendChild(b); });
  $id('qIndex').textContent = (state.index+1) + ' / ' + state.pool.length;
  updateProgress();
}

function handleAnswer(sel, correct){
  const buttons = Array.from($id('answers').children); buttons.forEach((b,i)=>{ b.disabled=true; if(i===correct) b.classList.add('correct'); if(i===sel && i!==correct) b.classList.add('wrong'); });
  const ok = sel===correct; state.recent.push(ok); if(state.recent.length>5) state.recent.shift(); if(ok) state.score+=10; if(state.currentCategory==='science') state.sciCount+=1;
  if(state.sciCount>0 && state.sciCount % INVOICE_EVERY_N === 0) createInvoice();
  if(state.recent.length===5 && state.recent.every(x=>x===true)) fireConfetti();
  setTimeout(()=>{ state.index+=1; if(state.index>=state.pool.length){ endCategory(); } else renderQuestion(); updateStats(); }, 800);
}

function updateProgress(){ const pct = Math.round((state.index / Math.max(1,state.pool.length))*100); $id('progressBar').style.width = pct+'%'; }

function endCategory(){ $id('quizSection').hidden=true; alert('پایان دسته — امتیاز: ' + state.score); }

function createInvoice(){ const code = 'A' + Math.floor(100000 + Math.random()*900000); state.invoices.push({code,ts:Date.now()}); localStorage.setItem('ab_invoices', JSON.stringify(state.invoices)); $id('invoiceCode').textContent = code; $id('invoiceModal').classList.add('show'); $id('invoiceModal').setAttribute('aria-hidden','false'); renderInvoices(); }

function renderInvoices(){ const el=$id('invoicesList'); el.innerHTML=''; state.invoices.slice().reverse().forEach(inv=>{ const d=document.createElement('div'); d.className='invoice-item'; d.textContent = inv.code + ' — ' + new Date(inv.ts).toLocaleDateString('fa-IR'); el.appendChild(d); }); $id('score').textContent = state.score; $id('sciCount').textContent = state.sciCount; }

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }

// Confetti (efficient)
let confCanvas, confCtx, particles=[];
function setupConfetti(){ confCanvas = document.getElementById('confetti'); if(!confCanvas) return; confCtx = confCanvas.getContext('2d'); resizeCanvas(); window.addEventListener('resize', resizeCanvas); requestAnimationFrame(confettiLoop); }
function resizeCanvas(){ if(!confCanvas) return; confCanvas.width = window.innerWidth; confCanvas.height = window.innerHeight; }
function spawnConfetti(n, colors, dur){ const end = Date.now() + dur; for(let i=0;i<n;i++){ particles.push({ x: Math.random()*confCanvas.width, y: -Math.random()*200, vx:(Math.random()-0.5)*2, vy:2+Math.random()*3, size:6+Math.random()*8, color: colors[Math.floor(Math.random()*colors.length)], rot:Math.random()*360, end }); } }
function confettiLoop(){ if(!confCtx) return requestAnimationFrame(confettiLoop); confCtx.clearRect(0,0,confCanvas.width,confCanvas.height); const now=Date.now(); particles = particles.filter(p=> now < p.end && p.y < confCanvas.height+100); particles.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.03; p.rot+=6; confCtx.save(); confCtx.translate(p.x,p.y); confCtx.rotate(p.rot*Math.PI/180); confCtx.fillStyle = p.color; confCtx.fillRect(-p.size/2,-p.size/2,p.size,p.size); confCtx.restore(); }); requestAnimationFrame(confettiLoop); }
function fireConfetti(){ spawnConfetti(140, ['#00ff9d','#ffd400','#ff3b3b','#00e5ff'], 9000); }

document.addEventListener('DOMContentLoaded', init);