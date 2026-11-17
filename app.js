const $ = id => document.getElementById(id);

const defaultExercises = [
  {name:"Supino reto",muscle:"Peito",equipment:"Barra",image:"https://images.unsplash.com/photo-1534368270820-9de3d8053204?w=600",description:"Deite no banco, mantenha os pés apoiados e empurre a barra verticalmente. Desça com controle.",sets:3,reps:12,rest:90},
  {name:"Supino inclinado",muscle:"Peito",equipment:"Halteres",image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600",description:"Execute o movimento em banco inclinado, controlando a descida dos halteres.",sets:3,reps:10,rest:90},
  {name:"Crucifixo",muscle:"Peito",equipment:"Halteres",image:"https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=600",description:"Abra os braços lateralmente com leve flexão dos cotovelos e retorne controladamente.",sets:3,reps:12,rest:60},
  {name:"Puxada frontal",muscle:"Costas",equipment:"Polia",image:"https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600",description:"Puxe a barra em direção à parte superior do peito, mantendo o tronco estável.",sets:3,reps:12,rest:75},
  {name:"Remada",muscle:"Costas",equipment:"Máquina",image:"https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=600",description:"Puxe os cotovelos para trás, aproximando as escápulas sem balançar o corpo.",sets:3,reps:12,rest:75},
  {name:"Agachamento",muscle:"Pernas",equipment:"Barra",image:"https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600",description:"Desça flexionando quadris e joelhos, mantendo os pés firmes e a coluna estável.",sets:3,reps:10,rest:120},
  {name:"Leg press",muscle:"Pernas",equipment:"Máquina",image:"https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=600",description:"Empurre a plataforma sem travar os joelhos e controle a volta.",sets:3,reps:12,rest:90},
  {name:"Cadeira extensora",muscle:"Pernas",equipment:"Máquina",image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600",description:"Estenda os joelhos de forma controlada e retorne sem deixar o peso despencar.",sets:3,reps:12,rest:60},
  {name:"Desenvolvimento",muscle:"Ombros",equipment:"Halteres",image:"https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600",description:"Empurre os halteres acima da cabeça, sem arquear excessivamente a lombar.",sets:3,reps:10,rest:75},
  {name:"Elevação lateral",muscle:"Ombros",equipment:"Halteres",image:"https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=600",description:"Eleve os braços lateralmente até uma altura confortável, sem impulso.",sets:3,reps:12,rest:60},
  {name:"Rosca direta",muscle:"Bíceps",equipment:"Barra",image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600",description:"Flexione os cotovelos mantendo os braços próximos ao tronco.",sets:3,reps:12,rest:60},
  {name:"Tríceps na polia",muscle:"Tríceps",equipment:"Polia",image:"https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600",description:"Estenda os cotovelos mantendo-os próximos ao corpo.",sets:3,reps:12,rest:60},
  {name:"Prancha",muscle:"Abdômen",equipment:"Peso corporal",image:"https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600",description:"Mantenha o corpo alinhado, contraia o abdômen e respire normalmente.",sets:3,reps:30,rest:45},
  {name:"Abdominal tradicional",muscle:"Abdômen",equipment:"Colchonete",image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600",description:"Eleve o tronco utilizando a musculatura abdominal sem puxar o pescoço.",sets:3,reps:15,rest:45},
  {name:"Bicicleta ergométrica",muscle:"Cardio",equipment:"Bicicleta",image:"https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600",description:"Pedale em ritmo adequado ao seu condicionamento e aumente a intensidade gradualmente.",sets:1,reps:15,rest:0}
];

function readData(key, fallback) {
  try {
    const value = localStorage.getItem("pp_" + key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem("pp_" + key, JSON.stringify(value));
}

let profile = readData("profile", {});
let exercises = readData("exercises", defaultExercises);
let builder = [];
let workouts = readData("workouts", []);
let history = readData("history", []);
let weights = readData("weights", []);
let session = null;
let timerInterval = null;
let remaining = 0;
let currentFilter = "Todos";
let weightChartInstance = null;

// --- TEMA CLARO / ESCURO ---
function applyTheme() {
  const isLight = readData("theme", "dark") === "light";
  document.body.classList.toggle("light-theme", isLight);
  const btn = $("themeBtn");
  if (btn) btn.textContent = isLight ? "☾" : "☀";
}

function toggleTheme() {
  const current = readData("theme", "dark");
  const next = current === "dark" ? "light" : "dark";
  saveData("theme", next);
  applyTheme();
  if ($("evolucao").classList.contains("active")) renderWeightChart();
}

// --- ALERTA SONORO E VIBRAÇÃO ---
function notifyRestFinished() {
  if ("vibrate" in navigator) {
    navigator.vibrate([300, 150, 300]);
  }
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Fallback silencioso se o navegador bloquear áudio automático
  }
}

function showPage(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));

  const target = $(page);
  if (!target) return;

  target.classList.add("active");

  const button = document.querySelector(`[data-page="${page}"]`);
  if (button) button.classList.add("active");

  const titles = {
    inicio:"Visão geral",
    treinos:"Meus treinos",
    montar:"Montar meu treino",
    exercicios:"Biblioteca de exercícios",
    evolucao:"Minha evolução",
    calendario:"Calendário",
    perfil:"Meu perfil"
  };

  $("pageTitle").textContent = titles[page] || page;
  window.scrollTo({top:0,behavior:"smooth"});

  if (page === "inicio") updateDashboard();
  if (page === "treinos") filterExercises(currentFilter);
  if (page === "montar") renderBuilder();
  if (page === "exercicios") renderExercises();
  if (page === "evolucao") renderEvolution();
  if (page === "calendario") renderCalendar();
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

function saveProfile() {
  profile = {
    name:$("profileName").value.trim(),
    age:$("age").value,
    height:$("height").value,
    weight:$("profileWeight").value,
    target:$("targetWeight").value,
    goal:$("profileGoal").value,
    level:$("level").value,
    location:$("location").value,
    limitations:$("limitations").value
  };

  if (!profile.name) {
    alert("Informe seu nome.");
    return;
  }

  saveData("profile",profile);

  if (profile.weight && !weights.length) {
    weights.push({
      weight:Number(profile.weight),
      date:new Date().toLocaleDateString("pt-BR")
    });
    saveData("weights",weights);
  }

  updateDashboard();
  alert("Perfil salvo com sucesso!");
}

function loadProfile() {
  $("profileName").value = profile.name || "";
  $("age").value = profile.age || "";
  $("height").value = profile.height || "";
  $("profileWeight").value = profile.weight || "";
  $("targetWeight").value = profile.target || "";
  $("profileGoal").value = profile.goal || "Hipertrofia";
  $("level").value = profile.level || "Iniciante";
  $("location").value = profile.location || "Academia";
  $("limitations").value = profile.limitations || "";
}

function setGoal(goal) {
  profile.goal = goal;
  $("profileGoal").value = goal;
  saveData("profile",profile);
  $("sideGoal").textContent = goal;
  alert("Seu objetivo foi atualizado para " + goal + ".");
}

function renderBadges(weeklyCount) {
  const badges = [
    { icon: "🔥", title: "Primeiro Passo", desc: "Conclua seu 1º treino", unlocked: history.length >= 1 },
    { icon: "⚡", title: "Semana Imbatível", desc: "Faça 4 treinos na semana", unlocked: weeklyCount >= 4 },
    { icon: "🏆", title: "Consistência Pro", desc: "Complete 10 treinos totais", unlocked: history.length >= 10 },
    { icon: "⚖️", title: "Foco na Meta", desc: "Registre seu peso 2+ vezes", unlocked: weights.length >= 2 }
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;
  $("badgeCount").textContent = `${unlockedCount}/${badges.length} DESBLOQUEADAS`;

  $("badgesList").innerHTML = badges.map(b => `
    <div class="badge-card ${b.unlocked ? 'unlocked' : ''}">
      <span class="badge-icon">${b.icon}</span>
      <strong>${b.title}</strong>
      <small>${b.desc}</small>
    </div>
  `).join("");
}

function updateDashboard() {
  const name = profile.name || "Aluno";

  $("headerName").textContent = name;
  $("avatar").textContent = name.charAt(0).toUpperCase();
  $("weightStat").textContent = profile.weight || "--";
  $("goalStat").textContent = profile.target || "--";
  $("sideGoal").textContent = profile.goal || "Defina seu objetivo";

  $("workoutStat").textContent = history.length;

  const minutes = history.reduce((total,item) => total + (item.minutes || 0),0);
  $("timeStat").textContent = minutes;

  const monday = new Date();
  monday.setHours(0,0,0,0);
  monday.setDate(monday.getDate() - ((monday.getDay()+6)%7));

  const weekly = history.filter(item => new Date(item.timestamp) >= monday).length;
  const percentage = Math.min(100,Math.round(weekly/4*100));

  $("weeklyProgress").textContent = percentage + "%";
  $("weeklyBar").style.width = percentage + "%";

  renderBadges(weekly);
}

function populateExerciseSelect() {
  $("exerciseSelect").innerHTML = exercises.map((ex,index) =>
    `<option value="${index}">${ex.name} — ${ex.muscle}</option>`
  ).join("");
}

function exerciseCard(ex, globalIndex) {
  return `
    <article class="exercise-card">
      <img src="${ex.image}" alt="" loading="lazy">
      <div>
        <span class="eyebrow">${ex.muscle}</span>
        <h3>${ex.name}</h3>
        <p>${ex.equipment} • ${ex.sets} séries • ${ex.reps} repetições</p>
        <button class="btn-small" onclick="exerciseDetails(${globalIndex})">VER DETALHES</button>
      </div>
    </article>
  `;
}

function filterExercises(category) {
  currentFilter = category;
  const list = exercises.map((ex, index) => ({ ...ex, originalIndex: index }))
    .filter(ex => category === "Todos" || ex.muscle === category);

  $("trainingExercises").innerHTML = list.map(ex => exerciseCard(ex, ex.originalIndex)).join("") || '<p class="muted">Nenhum exercício encontrado.</p>';
}

function renderExercises() {
  const search = ($("exerciseSearch").value || "").toLowerCase();

  const list = exercises.map((ex, index) => ({ ...ex, originalIndex: index }))
    .filter(ex =>
      ex.name.toLowerCase().includes(search) ||
      ex.muscle.toLowerCase().includes(search)
    );

  $("exerciseLibrary").innerHTML = list.map(ex => exerciseCard(ex, ex.originalIndex)).join("");
}

function exerciseDetails(index) {
  const ex = exercises[index];
  if (!ex) return;

  $("detailImg").src = ex.image;
  $("detailMuscle").textContent = ex.muscle.toUpperCase();
  $("detailEquipment").textContent = ex.equipment;
  $("detailName").textContent = ex.name;
  $("detailSets").textContent = ex.sets;
  $("detailReps").textContent = ex.reps;
  $("detailRest").textContent = ex.rest + "s";
  $("detailDescription").textContent = ex.description;

  $("detailsModal").classList.add("show");
}

function closeDetails() {
  $("detailsModal").classList.remove("show");
}

function addExercise() {
  const index = Number($("exerciseSelect").value);
  const ex = exercises[index];

  if (!ex) return;

  builder.push({
    name:ex.name,
    muscle:ex.muscle,
    image:ex.image,
    sets:Math.max(1,Number($("sets").value)),
    reps:Math.max(1,Number($("reps").value)),
    load:Math.max(0,Number($("load").value)),
    rest:Math.max(0,Number($("rest").value))
  });

  renderBuilder();
}

function removeExercise(index) {
  builder.splice(index,1);
  renderBuilder();
}

function renderBuilder() {
  $("exerciseCount").textContent = builder.length + " exercícios";

  $("builderList").innerHTML = builder.map((ex,index)=>`
    <div class="exercise-row">
      <div>
        <strong>${index+1}. ${ex.name}</strong>
        <small>${ex.sets} séries × ${ex.reps} repetições | ${ex.load} kg | ${ex.rest}s descanso</small>
      </div>
      <button class="remove-btn" onclick="removeExercise(${index})">REMOVER</button>
    </div>
  `).join("") || '<p class="muted">Adicione exercícios para montar seu treino.</p>';

  $("savedWorkouts").innerHTML = workouts.map((workout,index)=>`
    <div class="saved-row">
      <strong>${workout.name}</strong>
      <div>
        <button onclick="startWorkout(${index})">INICIAR</button>
        <button class="remove-btn" onclick="deleteWorkout(${index})">EXCLUIR</button>
      </div>
    </div>
  `).join("") || '<p class="muted">Nenhum treino salvo.</p>';
}

function saveWorkout() {
  const name = $("trainingName").value.trim();

  if (!name || !builder.length) {
    alert("Informe o nome e adicione pelo menos um exercício.");
    return;
  }

  workouts.push({
    id:Date.now(),
    name,
    exercises:builder.map(ex=>({...ex}))
  });

  saveData("workouts",workouts);

  builder = [];
  $("trainingName").value = "";
  renderBuilder();

  alert("Treino salvo com sucesso!");
}

function deleteWorkout(index) {
  if (!confirm("Deseja excluir este treino?")) return;

  workouts.splice(index,1);
  saveData("workouts",workouts);
  renderBuilder();
}

function startWorkout(index) {
  const workout = workouts[index];

  if (!workout || !workout.exercises.length) return;

  session = {
    workoutIndex: index,
    name: workout.name,
    exercises: workout.exercises.map(ex => ({...ex, completed: 0})),
    current: 0,
    started: Date.now()
  };

  $("workoutModal").classList.add("show");
  $("sessionTitle").textContent = session.name;

  showSessionExercise();
}

function showSessionExercise() {
  if (!session) return;

  const ex = session.exercises[session.current];
  if (!ex) return;

  $("sessionExercise").innerHTML = `
    <div class="exercise-card">
      <img src="${ex.image}" alt="">
      <div>
        <span class="eyebrow">${ex.muscle}</span>
        <h3>${ex.name}</h3>
        <p>Série ${ex.completed+1} de ${ex.sets} • ${ex.reps} repetições</p>
        <p>${ex.rest}s descanso • Exercício ${session.current+1} de ${session.exercises.length}</p>
        <div class="session-load-box">
          <label for="activeLoadInput">CARGA ATUAL (KG)</label>
          <input type="number" id="activeLoadInput" value="${ex.load}" min="0" step="0.5" onchange="updateSessionLoad(this.value)">
        </div>
      </div>
    </div>
  `;

  $("completeSet").disabled = false;
  $("completeSet").textContent = "CONCLUIR SÉRIE";
}

function updateSessionLoad(newLoad) {
  if (!session) return;
  const val = Math.max(0, Number(newLoad) || 0);
  session.exercises[session.current].load = val;
  
  // Atualiza também no treino salvo para manter a sobrecarga progressiva na próxima sessão
  if (workouts[session.workoutIndex] && workouts[session.workoutIndex].exercises[session.current]) {
    workouts[session.workoutIndex].exercises[session.current].load = val;
    saveData("workouts", workouts);
    renderBuilder();
  }
}

function completeCurrentSet() {
  if (!session) return;

  const ex = session.exercises[session.current];
  ex.completed++;

  if (ex.completed >= ex.sets) {
    alert("Exercício concluído!");
    nextExercise();
    return;
  }

  showSessionExercise();
  startRest(ex.rest);
}

function startRest(seconds) {
  clearInterval(timerInterval);
  remaining = seconds;

  updateTimer();

  timerInterval = setInterval(() => {
    remaining--;
    updateTimer();

    if (remaining <= 0) {
      clearInterval(timerInterval);
      $("timer").textContent = "DESCANSO FINALIZADO";
      notifyRestFinished();
    }
  },1000);
}

function updateTimer() {
  const min = Math.floor(remaining/60);
  const sec = remaining%60;

  $("timer").textContent =
    String(min).padStart(2,"0") + ":" +
    String(sec).padStart(2,"0");
}

function nextExercise() {
  if (!session) return;

  clearInterval(timerInterval);
  session.current++;

  if (session.current >= session.exercises.length) {
    finishWorkout();
    return;
  }

  $("timer").textContent = "00:00";
  showSessionExercise();
}

function finishWorkout() {
  if (!session) return;

  clearInterval(timerInterval);

  const minutes = Math.max(1,Math.round((Date.now()-session.started)/60000));

  const calories = session.exercises.reduce((total,ex)=>{
    return total + ex.completed * ex.reps * 0.35;
  },0);

  history.push({
    name:session.name,
    minutes,
    calories:Math.round(calories),
    date:new Date().toLocaleDateString("pt-BR"),
    timestamp:Date.now()
  });

  saveData("history",history);

  alert(
    "TREINO FINALIZADO!\n\n" +
    "Treino: " + session.name + "\n" +
    "Tempo: " + minutes + " minutos\n" +
    "Exercícios: " + session.exercises.length + "\n\n" +
    "Parabéns pela dedicação!"
  );

  session = null;
  $("workoutModal").classList.remove("show");

  updateDashboard();
  renderBuilder();
  renderEvolution();
}

function closeWorkout() {
  if (!session) {
    $("workoutModal").classList.remove("show");
    return;
  }

  if (!confirm("Deseja interromper o treino? O registro desta sessão não será salvo.")) return;

  clearInterval(timerInterval);
  session = null;
  $("workoutModal").classList.remove("show");
}

function recordProgress() {
  const weight = Number($("newWeight").value);
  const waist = Number($("newWaist").value);

  if (!weight || weight <= 0) {
    alert("Informe um peso válido.");
    return;
  }

  weights.push({
    weight,
    waist:waist || null,
    date:new Date().toLocaleDateString("pt-BR"),
    timestamp:Date.now()
  });

  profile.weight = weight;
  $("profileWeight").value = weight;

  saveData("weights",weights);
  saveData("profile",profile);

  $("newWeight").value = "";
  $("newWaist").value = "";

  updateDashboard();
  renderEvolution();

  alert("Evolução registrada!");
}

// --- GRÁFICO CHART.JS ---
function renderWeightChart() {
  const canvas = $("weightChart");
  if (!canvas || typeof Chart === "undefined") return;

  if (weightChartInstance) {
    weightChartInstance.destroy();
  }

  const isLight = document.body.classList.contains("light-theme");
  const lineColor = isLight ? "#58a600" : "#b6ff36";
  const textColor = isLight ? "#5a665c" : "#9aa49b";
  const gridColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";

  const labels = weights.length ? weights.map(w => w.date) : ["Sem dados"];
  const dataPoints = weights.length ? weights.map(w => w.weight) : [0];

  weightChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Peso (kg)",
        data: dataPoints,
        borderColor: lineColor,
        backgroundColor: isLight ? "rgba(88, 166, 0, 0.12)" : "rgba(182, 255, 54, 0.12)",
        borderWidth: 3,
        pointBackgroundColor: lineColor,
        pointRadius: 5,
        fill: true,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { size: 11 } },
          grid: { color: gridColor }
        },
        y: {
          ticks: { color: textColor, font: { size: 11 } },
          grid: { color: gridColor }
        }
      }
    }
  });
}

function renderEvolution() {
  renderWeightChart();

  $("weightHistory").innerHTML = weights.slice().reverse().map(item=>`
    <div class="history-row">
      <div>
        <strong>${item.weight} kg</strong>
        <small>${item.date}${item.waist ? " • Cintura: "+item.waist+" cm" : ""}</small>
      </div>
    </div>
  `).join("") || '<p class="muted">Nenhum peso registrado ainda.</p>';

  $("workoutHistory").innerHTML = history.slice().reverse().map(item=>`
    <div class="history-row">
      <div>
        <strong>${item.name}</strong>
        <small>${item.date} • ${item.minutes} minutos</small>
      </div>
    </div>
  `).join("") || '<p class="muted">Nenhum treino concluído ainda.</p>';
}

function renderCalendar() {
  $("calendarHistory").innerHTML = history.slice().reverse().map(item=>`
    <div class="history-row">
      <div>
        <strong>● ${item.date}</strong>
        <small>${item.name} • ${item.minutes} minutos</small>
      </div>
      <span class="tag-green">CONCLUÍDO</span>
    </div>
  `).join("") || '<p class="muted">Seu calendário aparecerá aqui conforme você concluir os treinos.</p>';
}

// --- BACKUP E RESTAURAÇÃO ---
function exportBackup() {
  const backupData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    profile,
    workouts,
    history,
    weights
  };
  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `personal-pro-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.profile) { profile = data.profile; saveData("profile", profile); }
      if (Array.isArray(data.workouts)) { workouts = data.workouts; saveData("workouts", workouts); }
      if (Array.isArray(data.history)) { history = data.history; saveData("history", history); }
      if (Array.isArray(data.weights)) { weights = data.weights; saveData("weights", weights); }
      
      init();
      alert("Backup restaurado com sucesso!");
    } catch {
      alert("Arquivo de backup inválido ou corrompido.");
    }
    event.target.value = "";
  };
  reader.readAsText(file);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .catch(error => console.error("Erro PWA:", error));
  });
}

function init() {
  applyTheme();
  loadProfile();
  populateExerciseSelect();
  renderBuilder();
  renderExercises();
  renderEvolution();
  renderCalendar();
  updateDashboard();
}

init();
