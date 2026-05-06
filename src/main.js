import "./style.css";
import { getPlayers, createPlayer, deletePlayer, updatePlayer } from "./api/players";

let editingId = null;

const app         = document.getElementById("app");
const form        = document.getElementById("player-form");
const formCard    = document.getElementById("form-card");
const formTitle   = document.getElementById("form-title");
const submitBtn   = document.getElementById("submit-btn");
const cancelBtn   = document.getElementById("cancel-btn");
const playerCount = document.getElementById("player-count");

async function loadPlayers() {
  app.innerHTML = `
    <div class="players-grid">
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando jugadores...</p>
      </div>
    </div>
  `;

  const players = await getPlayers();
  renderPlayers(players);
}

function renderPlayers(players) {
  playerCount.textContent = players.length;

  if (players.length === 0) {
    app.innerHTML = `
      <div class="players-grid">
        <div class="empty-state">
          <span class="empty-icon">NO DATA</span>
          <p>No hay jugadores registrados aún.</p>
          <p>Agrega el primero usando el formulario.</p>
        </div>
      </div>
    `;
    return;
  }

  app.innerHTML = `
    <div class="players-grid">
      ${players.map(cardTemplate).join("")}
    </div>
  `;

  addDeleteEvents();
  addEditEvents(players);
}

function cardTemplate(p) {
  return `
    <div class="player-card">
      <div class="player-card-header">
        <h3 class="player-name">${p.name}</h3>
        <span class="player-team">${p.team}</span>
      </div>
      <div class="player-stats">
        <div class="stat">
          <span class="stat-value">${p.championships}</span>
          <span class="stat-label">Campeonatos</span>
        </div>
        <div class="stat">
          <span class="stat-value">${p.mvp}</span>
          <span class="stat-label">MVPs</span>
        </div>
      </div>
      <div class="player-actions">
        <button class="btn btn-edit edit-btn" data-id="${p.id}">Editar</button>
        <button class="btn btn-danger delete-btn" data-id="${p.id}">Eliminar</button>
      </div>
    </div>
  `;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const player = {
    name:          document.getElementById("name").value.trim(),
    team:          document.getElementById("team").value.trim(),
    image_url:     "",
    championships: parseInt(document.getElementById("championships").value) || 0,
    mvp:           parseInt(document.getElementById("mvp").value) || 0,
    finals_mvp:    0,
    dpoy:          0,
    roty:          0,
  };

  if (editingId) {
    await updatePlayer(editingId, player);
    exitEditMode();
  } else {
    await createPlayer(player);
  }

  form.reset();
  loadPlayers();
});

cancelBtn.addEventListener("click", () => {
  exitEditMode();
  form.reset();
});

function validateForm() {
  let ok = true;

  if (!document.getElementById("name").value.trim()) {
    setFieldError("name", "El nombre es requerido");
    ok = false;
  } else {
    clearFieldError("name");
  }

  if (!document.getElementById("team").value.trim()) {
    setFieldError("team", "El equipo es requerido");
    ok = false;
  } else {
    clearFieldError("team");
  }

  return ok;
}

function setFieldError(id, msg) {
  document.getElementById(id).classList.add("invalid");
  const el = document.getElementById(`${id}-error`);
  if (el) el.textContent = msg;
}

function clearFieldError(id) {
  document.getElementById(id).classList.remove("invalid");
  const el = document.getElementById(`${id}-error`);
  if (el) el.textContent = "";
}

function enterEditMode(player) {
  editingId = player.id;

  document.getElementById("name").value          = player.name;
  document.getElementById("team").value          = player.team;
  document.getElementById("championships").value = player.championships;
  document.getElementById("mvp").value           = player.mvp;

  formTitle.textContent   = "Editar jugador";
  submitBtn.textContent   = "Guardar cambios";
  cancelBtn.style.display = "block";
  formCard.classList.add("editing");

  formCard.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("name").focus();
}

function exitEditMode() {
  editingId               = null;
  formTitle.textContent   = "Agregar jugador";
  submitBtn.textContent   = "Crear jugador";
  cancelBtn.style.display = "none";
  formCard.classList.remove("editing");
  clearFieldError("name");
  clearFieldError("team");
}

function addDeleteEvents() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await deletePlayer(btn.dataset.id);
      loadPlayers();
    });
  });
}

function addEditEvents(players) {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const player = players.find(p => p.id == btn.dataset.id);
      enterEditMode(player);
    });
  });
}

loadPlayers();
