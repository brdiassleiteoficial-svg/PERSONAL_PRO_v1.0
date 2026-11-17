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
  // Mapeia mantendo o índice original do array global 'exercises'
  const list = exercises.map((ex, index) => ({ ...ex, originalIndex: index }))
    .filter(ex => category === "Todos" || ex.muscle === category);

  $("trainingExercises").innerHTML = list.map(ex => exerciseCard(ex, ex.originalIndex)).join("") || '<p class="muted">Nenhum exercício encontrado.</p>';
}
