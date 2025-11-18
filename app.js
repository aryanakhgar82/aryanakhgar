// app.js
// Simple quiz flow: loads questions.json, breaks into groups of 5, tracks score, shows confetti on 5 correct answers.

const GROUP_SIZE = 5;
let questions = [];
let currentGroup = 0;
let currentIndexInGroup = 0;
let score = 0;
let groupCorrectCount = 0;
let timerInterval = null;
let timerSeconds = 15;
let timerMax = 15;
let neonOn = false;

const startBtn = document.getElementById('startBtn');
const quizArea = document.getElementById('quizArea');
const quizIntro = document.getElementById('quizIntro');
const questionText = document.getElementById('questionText');
const answersWrap = document.getElementById('answers');
const nextBtn = document.getElementById('nextBtn');
const scoreVal = document.getElementById('scoreVal');
const groupLabel = document.getElementById('groupLabel');
const timerText = document.getElementById('timerText');
const timerFg = document.querySelector('.timer-fg');
const finalArea = document.getElementById('finalArea');
const finalTitle = document.getElementById('finalTitle');
const finalText = document.getElementById('finalText');
const restartBtn = document.getElementById('restartBtn');
const neonBtn = document.getElementById('neonBtn');

function loadQuestions(){
  return fetch('questions.json').then(r=>r.json());
}

function startQuiz(){
  currentGroup = 0;
  score = 0;
  scoreVal.textContent = score;
  quizIntro.classList.add('hidden');
  quizArea.classList.remove('hidden');
  renderGroup();
}

function renderGroup(){
  const totalGroups = Math.ceil(questions.length / GROUP_SIZE);
  groupLabel.textContent = `دسته ${currentGroup+1} از ${totalGroups}`;
  currentIndexInGroup = 0;
  groupCorrectCount = 0;
  renderQuestion();
}

function renderQuestion(){
  const idx = currentGroup*GROUP_SIZE + currentIndexInGroup;
  if(idx >= questions.length){
    finishQuiz();
    return;
  }
  const q = questions[idx];
  questionText.textContent = q.q;
  answersWrap.innerHTML = '';
  q.options.forEach((opt, i)=>{
    const btn = document.createElement('button');
    btn.className = 'answerBtn';
    btn.textContent = opt;
    btn.onclick = ()=>selectAnswer(i, btn, q.answer);
    answersWrap.appendChild(btn);
  });
  nextBtn.classList.add('disabled');
  resetTimer();
  startTimer();
}

function selectAnswer(selectedIndex, btn, correctIndex){
  stopTimer();
  // mark answers
  Array.from(answersWrap.children).forEach((b, i)=>{
    b.classList.add(i===correctIndex ? 'correct' : (i===selectedIndex && i!==correctIndex ? 'wrong' : ''));
    b.disabled = true;
  });
  if(selectedIndex === correctIndex){
    score += 10;
    scoreVal.textContent = score;
    groupCorrectCount++;
    // If group reaches 5 correct answers (all correct in group), trigger confetti & special congrats
    if(groupCorrectCount === GROUP_SIZE){
      celebrateGroupSuccess();
    }
  }
  nextBtn.classList.remove('disabled');
}

function nextQuestion(){
  const idx = currentGroup*GROUP_SIZE + currentIndexInGroup;
  if(idx >= questions.length) { finishQuiz(); return; }
  currentIndexInGroup++;
  if(currentIndexInGroup >= GROUP_SIZE){
    currentGroup++;
    if(currentGroup*GROUP_SIZE >= questions.length){
      finishQuiz();
      return;
    }
    renderGroup();
  } else {
    renderQuestion();
  }
}

function finishQuiz(){
  quizArea.classList.add('hidden');
  finalArea.classList.remove('hidden');
  finalTitle.textContent = 'پایان مسابقه';
  finalText.textContent = `امتیاز نهایی شما: ${score} از ${questions.length*10}`;
}

function restartQuiz(){
  finalArea.classList.add('hidden');
  quizIntro.classList.remove('hidden');
}

function celebrateGroupSuccess(){
  // confetti burst
  confetti({
    particleCount: 180,
    spread: 120,
    origin: { y: 0.4 }
  });
  // modern congrat overlay
  const old = document.querySelector('.groupCongrats');
  if(old) old.remove();
  const c = document.createElement('div');
  c.className = 'groupCongrats';
  c.innerHTML = `<div class="glass promo"><h3>تبریک! گلریزون شد 🎉</h3><p>۵ پاسخ درست پشت سر هم — آفر ویژه!</p></div>`;
  document.body.appendChild(c);
  setTimeout(()=>c.remove(), 4200);
}

// timer functions
function resetTimer(){
  timerSeconds = timerMax;
  updateTimerUI();
}
function startTimer(){
  drawTimer(timerSeconds / timerMax);
  timerInterval = setInterval(()=>{
    timerSeconds--;
    if(timerSeconds <= 0){
      stopTimer();
      autoMarkWrong();
      nextBtn.classList.remove('disabled');
      return;
    }
    updateTimerUI();
  }, 1000);
}
function stopTimer(){ if(timerInterval) clearInterval(timerInterval); timerInterval = null; }

function updateTimerUI(){
  timerText.textContent = timerSeconds;
  const ratio = timerSeconds / timerMax;
  drawTimer(ratio);
}
function drawTimer(ratio){
  const circumference = 2*Math.PI*45;
  const offset = circumference * (1 - ratio);
  timerFg.style.strokeDashoffset = offset;
}

// if time runs out, mark as wrong (disable buttons)
function autoMarkWrong(){
  Array.from(answersWrap.children).forEach((b)=>{ b.classList.add('wrong'); b.disabled = true; });
}

// events
startBtn.onclick = ()=>startQuiz();
nextBtn.onclick = ()=>{ if(nextBtn.classList.contains('disabled')) return; nextQuestion(); };
restartBtn.onclick = ()=>restartQuiz();

// neon toggle
neonBtn.onclick = ()=>{
  neonOn = !neonOn;
  neonBtn.className = neonOn ? 'neon-on shake' : 'neon-off';
  // small UI hint: when neon is on, highlight primary button and open intro
  document.querySelectorAll('.primary').forEach(b=>{
    if(neonOn) b.style.boxShadow = '0 10px 40px rgba(0,255,122,0.12)';
    else b.style.boxShadow = '';
  });
};

// load questions on start
loadQuestions().then(data=>{
  questions = data;
  // ensure timerMax can be tuned per question set if needed
  document.getElementById('groupLabel').textContent = `دسته ۱ از ${Math.ceil(questions.length / GROUP_SIZE)}`;
}).catch(err=>{
  console.error('failed to load questions', err);
  alert('خطا در بارگذاری سوال‌ها — فایل questions.json باید در کنار index.html باشد.');
});
