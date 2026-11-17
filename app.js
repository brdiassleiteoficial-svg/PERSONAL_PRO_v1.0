
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
}

function populateExerciseSelect() {
  $("exerciseSelect").innerHTML = exercises.map((ex,index) =>
    `<option value="${index}">${ex.name} — ${ex.muscle}</option>`
  ).join("");
}

function exerciseCard(ex,index) {
  return `
    <article class="exercise-card">
      <img src="${ex.image}" alt="" loading="lazy">
      <div>
        <span class="eyebrow">${ex.muscle}</span>
        <h3>${ex.name}</h3>
        <p>${ex.equipment} • ${ex.sets} séries • ${ex.reps} repetições</p>
        <button class="btn-small" onclick="exerciseDetails(${index})">VER DETALHES</button>
      </div>
    </article>
  `;
}

function filterExercises(category) {
  currentFilter = category;
  const list = exercises.map((ex,index)=>({...ex,index}))
    .filter(ex => category === "Todos" || ex.muscle === category);

  $("trainingExercises").innerHTML = list.map(ex => exerciseCard(ex,ex.index)).join("") || "Nenhum exercício encontrado.";
}

function renderExercises() {
  const search = ($("exerciseSearch").value || "").toLowerCase();

  const list = exercises.map((ex,index)=>({...ex,index}))
    .filter(ex =>
      ex.name.toLowerCase().includes(search) ||
      ex.muscle.toLowerCase().includes(search)
    );

  $("exerciseLibrary").innerHTML = list.map(ex => exerciseCard(ex,ex.index)).join("");
}

function exerciseDetails(index) {
  const ex = exercises[index];
  if (!ex) return;

  alert(
    ex.name + "\n\n" +
    "Grupo muscular: " + ex.muscle + "\n" +
    "Equipamento: " + ex.equipment + "\n" +
    "Séries: " + ex.sets + "\n" +
    "Repetições: " + ex.reps + "\n" +
    "Descanso: " + ex.rest + " segundos\n\n" +
    "Execução:\n" + ex.description +
    "\n\nRespeite seus limites e interrompa o exercício se sentir dor."
  );
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
    name:workout.name,
    exercises:workout.exercises.map(ex=>({...ex,completed:0})),
    current:0,
    started:Date.now()
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
        <p>Série ${ex.completed+1} de ${ex.sets}</p>
        <p>${ex.reps} repetições • ${ex.load} kg</p>
        <p>${ex.rest} segundos de descanso</p>
        <p>Exercício ${session.current+1} de ${session.exercises.length}</p>
      </div>
    </div>
  `;

  $("completeSet").disabled = false;
  $("completeSet").textContent = "CONCLUIR SÉRIE";
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

function renderEvolution() {
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
<script>
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .catch(error => console.error("Erro PWA:", error));
  });
}
</script>

function init() {
  loadProfile();
  populateExerciseSelect();
  renderBuilder();
  renderExercises();
  renderEvolution();
  renderCalendar();
  updateDashboard();
}

init();
