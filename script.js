const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const STORAGE_KEY = "aventurasSaberProgressV1";
const initialState = { stars: 0, completed: [], badges: [] };
let state = loadState();
let currentGame = null;
let questionIndex = 0;
let correctInGame = 0;
let toastTimer;

const games = {
  letters: {
    title: "El bosque de las letras", kicker: "MISIÓN DE LECTURA",
    intro: "¡Ayuda a nuestros amigos a encontrar la respuesta correcta!",
    questions: [
      { emoji:"🐝", prompt:"¿Con qué letra empieza la palabra ABEJA?", answers:["A","M","S","P"], correct:"A" },
      { emoji:"🍎", prompt:"¿Qué palabra empieza con la letra M?", answers:["Sol","Mesa","Luna","Pato"], correct:"Mesa" },
      { emoji:"🐱", prompt:"Completa la palabra: GA__", answers:["TO","PA","NO","LA"], correct:"TO" }
    ]
  },
  numbers: {
    title: "La isla de los números", kicker: "MISIÓN DE MATEMÁTICAS",
    intro: "¡Cuenta con calma! Puedes intentarlo todas las veces que quieras.",
    questions: [
      { emoji:"🍓 🍓 🍓", prompt:"¿Cuántas fresas hay?", answers:["2","3","4","5"], correct:"3" },
      { emoji:"⭐ + ⭐", prompt:"¿Cuánto es 1 + 1?", answers:["1","2","3","4"], correct:"2" },
      { emoji:"🦋 🦋 🦋 🦋", prompt:"Hay 4 mariposas. Si llega 1 más, ¿cuántas hay?", answers:["4","5","6","3"], correct:"5" }
    ]
  },
  shapes: {
    title: "El valle de las formas", kicker: "MISIÓN DE OBSERVACIÓN",
    intro: "¡Las formas están escondidas por todas partes!",
    questions: [
      { emoji:"🔺", prompt:"¿Cómo se llama esta figura?", answers:["Círculo","Cuadrado","Triángulo","Estrella"], correct:"Triángulo" },
      { emoji:"🟦", prompt:"¿Cuál es el color de esta figura?", answers:["Azul","Rojo","Verde","Amarillo"], correct:"Azul" },
      { emoji:"⚽", prompt:"¿Qué forma se parece más a una pelota?", answers:["Triángulo","Círculo","Rectángulo","Cuadrado"], correct:"Círculo" }
    ]
  },
  nature: {
    title: "Guardianes del planeta", kicker: "MISIÓN DE NATURALEZA",
    intro: "Pequeñas acciones ayudan a cuidar nuestro hogar.",
    questions: [
      { emoji:"🌱", prompt:"¿Qué necesita una planta para crecer?", answers:["Agua y luz","Caramelos","Juguetes","Zapatos"], correct:"Agua y luz" },
      { emoji:"♻️", prompt:"¿Qué debemos hacer con los residuos reciclables?", answers:["Tirarlos al río","Separarlos para reciclar","Dejarlos en el parque","Quemarlos"], correct:"Separarlos para reciclar" },
      { emoji:"🐝🌼", prompt:"¿Qué ayudan a hacer las abejas?", answers:["Polinizar flores","Pintar casas","Hacer lluvia","Construir carreteras"], correct:"Polinizar flores" }
    ]
  },
  animals: {
    title: "El mundo animal", kicker: "MISIÓN DE ANIMALES",
    intro: "¡Descubre las pistas y aprende sobre los animales!",
    questions: [
      { emoji:"🐸", prompt:"¿Dónde vive gran parte de su vida una rana?", answers:["En el agua y en tierra","En el desierto solamente","En los árboles siempre","Bajo la nieve"], correct:"En el agua y en tierra" },
      { emoji:"🦒", prompt:"¿Qué animal tiene un cuello muy largo?", answers:["Tortuga","Jirafa","Ratón","Pingüino"], correct:"Jirafa" },
      { emoji:"🐟", prompt:"¿Con qué respiran los peces bajo el agua?", answers:["Pulmones como los humanos","Branquias","Alas","Patas"], correct:"Branquias" }
    ]
  },
  emotions: {
    title: "La ciudad de las emociones", kicker: "MISIÓN DEL CORAZÓN",
    intro: "Todas las emociones importan. Aprende a reconocerlas.",
    questions: [
      { emoji:"😊", prompt:"Si te sientes feliz, ¿qué puedes hacer?", answers:["Compartir tu alegría","Esconder todos los juguetes","Gritar a alguien","Romper cosas"], correct:"Compartir tu alegría" },
      { emoji:"😟", prompt:"Si algo te preocupa, ¿qué es bueno hacer?", answers:["Hablar con un adulto de confianza","Guardarlo siempre","Empujar a alguien","Dejar de pedir ayuda"], correct:"Hablar con un adulto de confianza" },
      { emoji:"😡", prompt:"Si estás muy enfadado, ¿qué puedes probar?", answers:["Respirar despacio","Golpear a un amigo","Lanzar objetos","Insultar"], correct:"Respirar despacio" }
    ]
  }
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...initialState, ...saved } : { ...initialState };
  } catch { return { ...initialState }; }
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function updateUI() {
  $("#starCount").textContent = state.stars;
  const completed = state.completed.length;
  const percent = Math.round(completed / 6 * 100);
  $("#progressLabel").textContent = completed ? "¡Cada vez sabes más!" : "¡Vamos a comenzar!";
  $("#progressPercent").textContent = `${percent}%`;
  $("#progressBar").style.width = `${percent}%`;
  $("#missionsDone").textContent = `${completed} de 6 misiones completadas`;
  $("#levelCounter").textContent = `Nivel ${Math.min(completed + 1, 6)} de 6`;
  $$(".level-card").forEach((card, i) => {
    const unlocked = i === 0 || state.completed.includes(i - 1);
    const done = state.completed.includes(i);
    card.classList.toggle("unlocked", unlocked);
    card.querySelector(".level-status").textContent = done ? "✅ ¡Completado!" : unlocked ? "✨ ¡Disponible!" : "🔒 Bloqueado";
  });
  const earned = [
    state.stars >= 1,
    state.completed.some(id => id === 0),
    state.completed.length >= 3,
    state.completed.length >= 6
  ];
  $$(".badge").forEach((badge, i) => badge.classList.toggle("locked", !earned[i]));
}
function openGame(topic) {
  currentGame = games[topic] || games.letters;
  questionIndex = 0;
  correctInGame = 0;
  $("#gameKicker").textContent = currentGame.kicker;
  renderQuestion(true);
  $("#gameDialog").showModal();
}
function renderQuestion(showIntro = false) {
  const q = currentGame.questions[questionIndex];
  $("#gameContent").innerHTML = `
    <h2 class="game-title">${currentGame.title}</h2>
    <p class="game-instruction">${showIntro ? currentGame.intro : `Pregunta ${questionIndex + 1} de ${currentGame.questions.length}. ¡Tú puedes!`}</p>
    <div class="question-card">
      <div class="question-emoji" aria-hidden="true">${q.emoji}</div>
      <div class="question-text">${q.prompt}</div>
    </div>
    <div class="answer-grid">${q.answers.map(a => `<button class="answer-option" type="button" data-answer="${escapeAttr(a)}">${a}</button>`).join("")}</div>
    <div class="feedback" id="feedback" aria-live="polite"></div>
    <button class="button button-green next-button" id="nextQuestion" hidden>${questionIndex === currentGame.questions.length - 1 ? "Ver resultado ⭐" : "Siguiente pregunta ➜"}</button>`;
  $$(".answer-option").forEach(button => button.addEventListener("click", () => chooseAnswer(button, q)));
  $("#nextQuestion").addEventListener("click", nextQuestion);
}
function escapeAttr(text) {
  return String(text).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
function chooseAnswer(button, question) {
  if ($$(".answer-option").some(b => b.disabled)) return;
  const feedback = $("#feedback");
  const correct = button.dataset.answer === question.correct;
  if (correct) {
    button.classList.add("correct");
    feedback.textContent = ["¡Excelente! 🌟","¡Lo lograste! 🎉","¡Respuesta brillante! ✨"][Math.floor(Math.random()*3)];
    feedback.className = "feedback good";
    correctInGame++;
  } else {
    button.classList.add("wrong");
    feedback.textContent = "¡Buen intento! Busca la respuesta y vuelve a probar. 💪";
    feedback.className = "feedback try";
    const correctButton = $$(".answer-option").find(b => b.dataset.answer === question.correct);
    if (correctButton) correctButton.classList.add("correct");
  }
  $$(".answer-option").forEach(b => b.disabled = true);
  $("#nextQuestion").hidden = false;
}
function nextQuestion() {
  if (questionIndex < currentGame.questions.length - 1) {
    questionIndex++;
    renderQuestion();
    return;
  }
  const topicKey = Object.keys(games).find(key => games[key] === currentGame);
  const levelIndex = Math.max(0, Object.keys(games).indexOf(topicKey));
  const wasCompleted = state.completed.includes(levelIndex);
  const earned = correctInGame * 5 + (correctInGame === currentGame.questions.length ? 5 : 0);
  if (!wasCompleted) state.completed.push(levelIndex);
  state.stars += earned;
  saveState();
  updateUI();
  $("#gameContent").innerHTML = `
    <div class="question-card">
      <div class="question-emoji">${correctInGame === currentGame.questions.length ? "🏆" : "🌈"}</div>
      <h2 class="game-title">${correctInGame === currentGame.questions.length ? "¡Misión perfecta!" : "¡Misión completada!"}</h2>
      <p class="game-instruction">Respondiste bien ${correctInGame} de ${currentGame.questions.length} preguntas.</p>
      <div class="question-text">¡Ganaste ⭐ ${earned} estrellas!</div>
      <p>Recuerda: aprender es practicar, preguntar y volver a intentarlo.</p>
    </div>
    <button class="button button-green next-button" id="finishGame">¡Seguir explorando!</button>`;
  $("#finishGame").addEventListener("click", () => {
    $("#gameDialog").close();
    showToast(wasCompleted ? "¡Buen trabajo! Has practicado otra vez. ⭐" : "¡Nueva misión completada! Mira tu progreso. 🏆");
    $("#niveles").scrollIntoView({ behavior:"smooth", block:"start" });
  });
}
$("#startAdventure").addEventListener("click", () => {
  document.querySelector("#juegos").scrollIntoView({ behavior:"smooth", block:"start" });
  showToast("¡Elige una misión y comienza a ganar estrellas! 🚀");
});
$("#closeDialog").addEventListener("click", () => $("#gameDialog").close());
$("#gameDialog").addEventListener("click", event => {
  if (event.target === $("#gameDialog")) $("#gameDialog").close();
});
$$(".subject-card").forEach(card => card.addEventListener("click", () => openGame(card.dataset.topic)));
$$(".level-card").forEach(card => card.addEventListener("click", () => {
  const level = Number(card.dataset.level);
  const unlocked = level === 0 || state.completed.includes(level - 1);
  if (!unlocked) {
    showToast("¡Completa el nivel anterior para desbloquear este! ⭐");
    return;
  }
  const topicForLevel = ["letters","numbers","shapes","animals","emotions","nature"][level];
  openGame(topicForLevel);
}));
$("#resetProgress").addEventListener("click", () => {
  if (confirm("¿Quieres reiniciar las estrellas y las misiones?")) {
    state = { ...initialState, completed: [], badges: [] };
    saveState();
    updateUI();
    showToast("¡Progreso reiniciado! Puedes empezar una nueva aventura.");
  }
});
updateUI();
