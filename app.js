const TIMER_DURATION = 30;
const STORAGE_KEY = 'quiz_leaderboard';
const LETTERS = ['A', 'B', 'C', 'D'];

const DEFAULT_QUESTIONS = [
  {
    "question": "Quelle est la capitale de la France ?",
    "choices": ["Paris", "Lyon", "Marseille", "Nice"],
    "correct": 0
  },
  {
    "question": "Combien de continents y a-t-il sur Terre ?",
    "choices": ["5", "6", "7", "8"],
    "correct": 2
  },
  {
    "question": "Quel est le plus grand océan du monde ?",
    "choices": ["Atlantique", "Indien", "Arctique", "Pacifique"],
    "correct": 3
  },
  {
    "question": "En quelle année a eu lieu la Révolution française ?",
    "choices": ["1776", "1789", "1799", "1804"],
    "correct": 1
  },
  {
    "question": "Quel élément chimique est représenté par le symbole 'O' ?",
    "choices": ["Or", "Oxygène", "Osmium", "Oganesson"],
    "correct": 1
  },
  {
    "question": "Qui a écrit 'Les Misérables' ?",
    "choices": ["Émile Zola", "Victor Hugo", "Gustave Flaubert", "Molière"],
    "correct": 1
  },
  {
    "question": "Quel est le plus long fleuve du monde ?",
    "choices": ["Amazon", "Nil", "Mississippi", "Yangtsé"],
    "correct": 1
  },
  {
    "question": "Combien de jours compte une année bissextile ?",
    "choices": ["364", "365", "366", "367"],
    "correct": 2
  },
  {
    "question": "Quel pays a la plus grande superficie ?",
    "choices": ["États-Unis", "Chine", "Canada", "Russie"],
    "correct": 3
  },
  {
    "question": "Quel est le langage de programmation le plus ancien parmi ces choix ?",
    "choices": ["Python", "JavaScript", "Fortran", "C++"],
    "correct": 2
  },
  {
    "question": "Combien de joueurs composent une équipe de football ?",
    "choices": ["9", "10", "11", "12"],
    "correct": 2
  },
  {
    "question": "Quel est le symbole chimique de l'eau ?",
    "choices": ["H2O", "CO2", "NaCl", "O2"],
    "correct": 0
  }
];

const state = {
  questions: [],
  currentIndex: 0,
  score: 0,
  timer: TIMER_DURATION,
  timerId: null,
  isAnswering: false,
  isCustom: false,
  quizInProgress: false,
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const quizStart = $('#quizStart');
const quizActive = $('#quizActive');
const quizResult = $('#quizResult');
const questionText = $('#questionText');
const choicesEl = $('#choices');
const currentQ = $('#currentQ');
const totalQ = $('#totalQ');
const scoreDisplay = $('#scoreDisplay');
const timerEl = $('#timerText');
const timerBar = $('#timerBar');
const btnStart = $('#btnStart');
const btnNext = $('#btnNext');
const btnRestart = $('#btnRestart');
const finalScore = $('#finalScore');
const finalTotal = $('#finalTotal');
const resultPercent = $('#resultPercent');
const leaderboardList = $('#leaderboardList');
const btnClearScores = $('#btnClearScores');
const btnStartCustom = $('#btnStartCustom');
const jsonUpload = $('#jsonUpload');
const creatorTextarea = $('#creatorTextarea');
const btnSaveScore = $('#btnSaveScore');
const playerNameInput = $('#playerNameInput');
const nameForm = $('#nameForm');

const views = {
  quiz: $('#viewQuiz'),
  leaderboard: $('#viewLeaderboard'),
  creator: $('#viewCreator'),
};

const navBtns = $$('.nav-btn');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (state.quizInProgress && btn.dataset.view !== 'quiz') return;
    const view = btn.dataset.view;
    showView(view);
  });
});

function showView(name) {
  Object.values(views).forEach(v => {
    v.classList.remove('active');
    v.classList.add('hidden');
  });
  navBtns.forEach(b => b.classList.remove('active'));
  views[name].classList.remove('hidden');
  views[name].classList.add('active');
  document.querySelector(`[data-view="${name}"]`).classList.add('active');
  if (name === 'leaderboard') renderLeaderboard();
}

btnStart.addEventListener('click', () => startQuiz(null));
btnRestart.addEventListener('click', () => {
  showView('quiz');
  resetQuiz();
});
btnNext.addEventListener('click', nextQuestion);
btnSaveScore.addEventListener('click', savePlayerScore);
playerNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') savePlayerScore();
});
btnClearScores.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  renderLeaderboard();
});

jsonUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    creatorTextarea.value = ev.target.result;
  };
  reader.readAsText(file);
});

btnStartCustom.addEventListener('click', () => {
  try {
    const data = JSON.parse(creatorTextarea.value);
    if (!Array.isArray(data) || data.length === 0) {
      alert('Le JSON doit contenir un tableau non vide de questions.');
      return;
    }
    startQuiz(data);
  } catch {
      alert("Erreur de syntaxe JSON. Veuillez vérifier le format.");
  }
});

function setNavDisabled(disabled) {
  navBtns.forEach(btn => {
    if (btn.dataset.view !== 'quiz') {
      btn.disabled = disabled;
      btn.classList.toggle('disabled', disabled);
    }
  });
}

function resetQuiz() {
  clearInterval(state.timerId);
  state.currentIndex = 0;
  state.score = 0;
  state.timer = TIMER_DURATION;
  state.isAnswering = false;
  state.questions = [];
  state.isCustom = false;
  state.quizInProgress = false;
  setNavDisabled(false);
  quizStart.classList.remove('hidden');
  quizActive.classList.add('hidden');
  quizResult.classList.add('hidden');
  btnNext.classList.add('hidden');
}

async function startQuiz(customQuestions) {
  if (customQuestions) {
    state.questions = customQuestions;
    state.isCustom = true;
  } else {
    try {
      const res = await fetch('questions.json');
      if (!res.ok) throw new Error('Fichier non trouvé');
      state.questions = await res.json();
      state.isCustom = false;
    } catch {
      state.questions = DEFAULT_QUESTIONS;
      state.isCustom = false;
    }
  }

  if (!state.questions || state.questions.length === 0) {
    alert('Aucune question disponible.');
    return;
  }

  state.currentIndex = 0;
  state.score = 0;
  state.quizInProgress = true;
  setNavDisabled(true);
  quizStart.classList.add('hidden');
  quizActive.classList.remove('hidden');
  quizResult.classList.add('hidden');
  showQuestion();
}

function showQuestion() {
  const q = state.questions[state.currentIndex];
  if (!q) return endQuiz();

  state.isAnswering = true;
  state.timer = TIMER_DURATION;
  timerEl.textContent = state.timer;
  timerBar.style.width = '100%';
  timerBar.className = 'timer-bar';
  currentQ.textContent = state.currentIndex + 1;
  totalQ.textContent = state.questions.length;
  scoreDisplay.textContent = state.score;
  btnNext.classList.add('hidden');

  questionText.textContent = q.question;
  choicesEl.innerHTML = '';

  q.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `<span class="choice-letter">${LETTERS[i]}</span>${choice}`;
    btn.dataset.index = i;
    btn.addEventListener('click', () => selectAnswer(i));
    choicesEl.appendChild(btn);
  });

  startTimer();
}

function selectAnswer(index) {
  if (!state.isAnswering) return;
  state.isAnswering = false;
  clearInterval(state.timerId);

  const q = state.questions[state.currentIndex];
  const btns = $$('.choice-btn');
  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
    if (i === index && index !== q.correct) btn.classList.add('incorrect');
  });

  if (index === q.correct) {
    state.score++;
    scoreDisplay.textContent = state.score;
  }

  btnNext.classList.remove('hidden');
}

function nextQuestion() {
  state.currentIndex++;
  if (state.currentIndex >= state.questions.length) {
    endQuiz();
  } else {
    showQuestion();
  }
}

function endQuiz() {
  clearInterval(state.timerId);
  state.quizInProgress = false;
  setNavDisabled(false);
  quizActive.classList.add('hidden');
  quizResult.classList.remove('hidden');
  nameForm.classList.remove('hidden');
  finalScore.textContent = state.score;
  finalTotal.textContent = state.questions.length;
  const pct = Math.round((state.score / state.questions.length) * 100);
  resultPercent.textContent = `${pct}%`;
  playerNameInput.value = '';
  playerNameInput.focus();
}

function startTimer() {
  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    state.timer--;
    timerEl.textContent = state.timer;
    timerBar.style.width = `${(state.timer / TIMER_DURATION) * 100}%`;
    if (state.timer <= 5) timerBar.className = 'timer-bar danger';
    else if (state.timer <= 10) timerBar.className = 'timer-bar warning';
    else timerBar.className = 'timer-bar';

    if (state.timer <= 0) {
      clearInterval(state.timerId);
      state.isAnswering = false;
      const btns = $$('.choice-btn');
      btns.forEach((btn, i) => {
        btn.disabled = true;
        if (i === state.questions[state.currentIndex].correct) btn.classList.add('correct');
      });
      btnNext.classList.remove('hidden');
    }
  }, 1000);
}

function saveScore(name, score, total) {
  const entries = getScores();
  entries.push({
    name,
    score,
    total,
    pct: Math.round((score / total) * 100),
    date: new Date().toISOString(),
  });
  entries.sort((a, b) => b.pct - a.pct || new Date(b.date) - new Date(a.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function savePlayerScore() {
  const name = playerNameInput.value.trim();
  if (!name) {
    playerNameInput.focus();
    return;
  }
  saveScore(name, state.score, state.questions.length);
  nameForm.classList.add('hidden');
  renderLeaderboard();
}

function getScores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function renderLeaderboard() {
  const entries = getScores();
  if (entries.length === 0) {
    leaderboardList.innerHTML = '<p class="empty-state">Aucun score enregistré.</p>';
    return;
  }
  leaderboardList.innerHTML = entries.slice(0, 20).map((entry, i) => `
    <div class="leaderboard-item">
      <span class="leaderboard-rank">#${i + 1}</span>
      <span class="leaderboard-name">${escapeHtml(entry.name)}</span>
      <span class="leaderboard-score">${entry.score}/${entry.total} (${entry.pct}%)</span>
      <span class="leaderboard-date">${new Date(entry.date).toLocaleDateString('fr-FR')}</span>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
