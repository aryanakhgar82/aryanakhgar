
let scienceCorrect = 0;
let currentCategory = "";
let currentIndex = 0;
let activeQuestions = [];

function startGame() {
  document.getElementById("categories").classList.remove("hidden");
}

function startQuiz(cat) {
  currentCategory = cat;
  currentIndex = 0;
  activeQuestions = questions[cat];
  document.getElementById("categories").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");
  loadQuestion();
}

function loadQuestion() {
  const q = activeQuestions[currentIndex];
  document.getElementById("q-title").innerText = q.q;
  const opts = document.getElementById("q-opts");
  opts.innerHTML = "";
  q.options.forEach((o,i)=>{
    const b = document.createElement("button");
    b.innerText = o;
    b.onclick = ()=> checkAnswer(i === q.answer);
    opts.appendChild(b);
  });
  document.getElementById("progress").innerText = 
    (currentIndex+1) + " / " + activeQuestions.length;
}

function checkAnswer(ok) {
  if(ok && currentCategory === "science") {
    scienceCorrect++;
    if(scienceCorrect % 5 === 0) {
      makeFactor();
    }
  }
  currentIndex++;
  if(currentIndex >= activeQuestions.length) {
    alert("پایان دسته!");
    location.reload();
  } else {
    loadQuestion();
  }
}

function makeFactor() {
  const code = "F-" + Math.floor(Math.random()*999999);
  document.getElementById("factor-code").innerText = code;
  document.getElementById("factor-modal").classList.remove("hidden");
}

function closeFactor() {
  document.getElementById("factor-modal").classList.add("hidden");
}
