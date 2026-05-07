import "./style.css";
import { getPlayers, createPlayer, deletePlayer, updatePlayer } from "./api/players";
import { getTeams } from "./api/teams.js";

// ─── State ────────────────────────────────────────────────────
let currentPage  = 1;
let totalPages   = 1;
let totalPlayers = 0;
let currentView  = "players";
let editingId    = null;

// ─── DOM refs ─────────────────────────────────────────────────
const mainLayout    = document.getElementById("main-layout");
const sidebar       = document.getElementById("sidebar");
const playersHeader = document.getElementById("players-header");
const app           = document.getElementById("app");
const pagination    = document.getElementById("pagination");
const form          = document.getElementById("player-form");
const formCard      = document.getElementById("form-card");
const formTitle     = document.getElementById("form-title");
const submitBtn     = document.getElementById("submit-btn");
const cancelBtn     = document.getElementById("cancel-btn");
const playerCount   = document.getElementById("player-count");

// ─── Navigation ───────────────────────────────────────────────
document.querySelectorAll(".nav-link").forEach(btn => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});

function switchView(view) {
  currentView = view;
  document.querySelectorAll(".nav-link").forEach(l =>
    l.classList.toggle("active", l.dataset.view === view)
  );

  if (view === "players") {
    mainLayout.classList.remove("teams-mode");
    sidebar.style.display       = "";
    playersHeader.style.display = "";
    loadPlayers(1);
  } else {
    mainLayout.classList.add("teams-mode");
    sidebar.style.display       = "none";
    playersHeader.style.display = "none";
    pagination.innerHTML        = "";
    loadTeams();
  }
}

// ─── Players ──────────────────────────────────────────────────
async function loadPlayers(page = 1) {
  currentPage = page;

  app.innerHTML = `
    <div class="players-grid">
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando jugadores...</p>
      </div>
    </div>
  `;
  pagination.innerHTML = "";

  const result = await getPlayers(page, 9);
  totalPlayers = result.total;
  totalPages   = result.pages;

  playerCount.textContent = totalPlayers;
  renderPlayers(result.data);
  renderPagination();
}

function renderPlayers(players) {
  if (!players || players.length === 0) {
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

// ─── Pagination ───────────────────────────────────────────────
function renderPagination() {
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  const pages = buildPageNumbers(currentPage, totalPages);

  pagination.innerHTML = `
    <div class="pagination-inner">
      <button class="page-btn" id="prev-btn" ${currentPage === 1 ? "disabled" : ""}>&#8592;</button>
      <div class="page-numbers">
        ${pages.map(p => p === "..."
          ? `<span class="page-ellipsis">…</span>`
          : `<button class="page-btn page-num ${p === currentPage ? "active" : ""}" data-page="${p}">${p}</button>`
        ).join("")}
      </div>
      <button class="page-btn" id="next-btn" ${currentPage === totalPages ? "disabled" : ""}>&#8594;</button>
      <span class="page-info">${currentPage} / ${totalPages}</span>
    </div>
  `;

  document.getElementById("prev-btn")
    .addEventListener("click", () => loadPlayers(currentPage - 1));
  document.getElementById("next-btn")
    .addEventListener("click", () => loadPlayers(currentPage + 1));
  document.querySelectorAll(".page-num").forEach(btn => {
    btn.addEventListener("click", () => loadPlayers(parseInt(btn.dataset.page)));
  });
}

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4)         return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total-4, total-3, total-2, total-1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

// ─── Teams ────────────────────────────────────────────────────
async function loadTeams() {
  app.innerHTML = `
    <div class="teams-section">
      <div class="content-header">
        <h2 class="content-title">Equipos <span class="badge" id="teams-loading">…</span></h2>
      </div>
      <div class="loading-state" style="padding:60px 0">
        <div class="spinner"></div>
        <p>Cargando equipos...</p>
      </div>
    </div>
  `;

  const teams = await getTeams();
  renderTeams(teams);
}

function renderTeams(teams) {
  app.innerHTML = `
    <div class="teams-section">
      <div class="content-header">
        <h2 class="content-title">
          Equipos
          <span class="badge">${teams.length}</span>
        </h2>
      </div>
      <div class="teams-grid">
        ${teams.map(teamCardTemplate).join("")}
      </div>
    </div>
  `;
}

function teamCardTemplate(t) {
  const initials   = t.abbreviation || t.name.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase();
  const champLabel = t.championships === 1 ? "campeonato" : "campeonatos";

  return `
    <div class="team-card">
      <div class="team-logo-wrap">
        <img
          src="${t.logo_url}"
          alt="${t.name}"
          class="team-logo"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        />
        <div class="team-initials" style="display:none">${initials}</div>
      </div>
      <span class="team-name">${t.name}</span>
      <div class="team-champs">
        <span class="team-champ-value">${t.championships}</span>
        <span class="team-champ-label">${champLabel}</span>
      </div>
    </div>
  `;
}

// ─── Player card ──────────────────────────────────────────────
function getInitials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function cardTemplate(p) {
  const hasImage  = p.image_url && p.image_url.trim() !== "";
  const initials  = getInitials(p.name);
  const avatarImg = hasImage
    ? `<img src="${p.image_url}" alt="${p.name}" class="player-img" onerror="this.classList.add('img-error')">`
    : "";

  return `
    <div class="player-card">
      <div class="player-avatar ${hasImage ? "has-image" : ""}">
        ${avatarImg}
        <div class="player-initials">${initials}</div>
      </div>
      <div class="player-card-body">
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
    </div>
  `;
}

// ─── Form ─────────────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const player = {
    name:          document.getElementById("name").value.trim(),
    team:          document.getElementById("team").value.trim(),
    image_url:     document.getElementById("image_url").value.trim(),
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
  loadPlayers(currentPage);
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
  document.getElementById("image_url").value     = player.image_url || "";
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
      const cardsNow = document.querySelectorAll(".player-card").length;
      await deletePlayer(btn.dataset.id);
      const goToPage = cardsNow === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      loadPlayers(goToPage);
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

// ─── CSV Export ───────────────────────────────────────────────
document.getElementById("export-csv-btn").addEventListener("click", exportCSV);

async function exportCSV() {
  const result = await getPlayers(1, 1000);
  const players = result.data;

  const headers = ["ID", "Nombre", "Equipo", "Campeonatos", "MVPs", "Finals MVP", "DPOY", "ROTY"];
  const rows = players.map(p => [
    p.id,
    `"${String(p.name).replace(/"/g, '""')}"`,
    `"${String(p.team).replace(/"/g, '""')}"`,
    p.championships,
    p.mvp,
    p.finals_mvp,
    p.dpoy,
    p.roty,
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "jugadores.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Init ─────────────────────────────────────────────────────
loadPlayers(1);
