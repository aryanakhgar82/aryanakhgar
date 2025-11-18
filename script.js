const loginSection = document.getElementById('loginSection');
const heroSection = document.getElementById('heroSection');
const game = document.getElementById('game');
const result = document.getElementById('result');

const phoneInput = document.getElementById('phoneInput');
const loginBtn = document.getElementById('loginBtn');
const loginMsg = document.getElementById('loginMsg');

const startBtn = document.getElementById('startBtn');
const qTitle = document.getElementById('q-title');
const answers = document.getElementById('answers');
const timerBox = document.getElementById('timer');
const resultTitle = document.getElementById('resultTitle');
const factorCode = document.getElementById('factorCode');
const restartBtn = document.getElementById('restartBtn');

let currentUser = null;
let timer=null;
let timeLeft=15;
let questions=[];
let currentSet=[];
let currentIndex=0;
let correctCount=0;

fetch("questions.json")
  .then(r=>r.json())
  .then(d=>{ questions = d.questions; });

loginBtn.onclick = ()=>{
  const phone = phoneInput.value.trim();
  if(!/^09\d{9}$/.test(phone)){
    loginMsg.textContent="شماره معتبر نیست.";
    return;
  }
  currentUser = phone;

  const users = JSON.parse(localStorage.getItem("users")||"{}");
  if(!users[currentUser]) users[currentUser]={ played:false };
  localStorage.setItem("users", JSON.stringify(users));

  loginSection.classList.add("hidden");
  heroSection.classList.remove("hidden");

  if(users[currentUser].played){
    startBtn.disabled=true;
    startBtn.textContent="یک بار شرکت کردید";
  }
};

startBtn.onclick = ()=>{
  const users = JSON.parse(localStorage.getItem("users")||"{}");
  if(users[currentUser].played) return;

  heroSection.classList.add("hidden");
  game.classList.remove("hidden");

  currentSet = questions.sort(()=>Math.random()-0.5).slice(0,5);
  currentIndex=0;
  correctCount=0;

  renderQuestion();
};

function renderQuestion(){
  const q = currentSet[currentIndex];
  qTitle.textContent = q.q;
  answers.innerHTML="";

  q.a.forEach((ans,i)=>{
    const li=document.createElement("li");
    li.textContent=ans;
    li.onclick=()=>select(i);
    answers.appendChild(li);
  });

  startTimer();
}

function startTimer(){
  if(timer) clearInterval(timer);
  timeLeft=15;
  timerBox.textContent="زمان: "+timeLeft;
  timer=setInterval(()=>{
    timeLeft--;
    timerBox.textContent="زمان: "+timeLeft;
    if(timeLeft<=0){
      clearInterval(timer);
      next(false);
    }
  },1000);
}

function select(i){
  clearInterval(timer);
  const q=currentSet[currentIndex];
  next(i===q.c);
}

function next(ok){
  if(ok) correctCount++;
  currentIndex++;
  if(currentIndex<5) renderQuestion();
  else endRound();
}

function endRound(){
  clearInterval(timer);

  const users = JSON.parse(localStorage.getItem("users")||"{}");
  if(users[currentUser]){ users[currentUser].played=true; }
  localStorage.setItem("users", JSON.stringify(users));

  game.classList.add("hidden");
  result.classList.remove("hidden");

  if(correctCount===5){
    resultTitle.textContent="🎉 تبریک! برنده شدید!";
    factorCode.textContent="کد فاکتور شما: "+(Math.random().toString(36).substring(2,10)).toUpperCase();
  } else {
    resultTitle.textContent="❌ متأسفیم! برنده نشدید.";
    factorCode.textContent="";
  }
}

restartBtn.onclick=()=>{
  result.classList.add("hidden");
  heroSection.classList.remove("hidden");
};
