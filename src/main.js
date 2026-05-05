const API_URL = "http://localhost:8080";

import { getPlayers } from "./api/players";
import { createPlayer } from "./api/players";
import { deletePlayer } from "./api/players";

async function loadPlayers() {
  const players = await getPlayers();
  renderPlayers(players);
}

function renderPlayers(players) {
  const app = document.getElementById("app");

  app.innerHTML = "<h1>Jugadores NBA</h1>";

  players.forEach(player => {
    const div = document.createElement("div");

    div.innerHTML = `
      <h3>${player.name}</h3>
      <p>Equipo: ${player.team}</p>
      <p>🏆 Campeonatos: ${player.championships}</p>
      <button data-id="${player.id}" class="delete-btn">Eliminar Jugador</button>
      <hr/>
    `;

    app.appendChild(div);
  });

  addDeleteEvents();
}

// formulario de agregar jugaador
const form = document.getElementById("player-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPlayer = {
    name: document.getElementById("name").value,
    team: document.getElementById("team").value,
    image_url: "",
    championships: parseInt(document.getElementById("championships").value) || 0,
    mvp: parseInt(document.getElementById("mvp").value) || 0,
    finals_mvp: 0,
    dpoy: 0,
    roty: 0
  };

  await createPlayer(newPlayer);

  form.reset();      // limpiar form
  loadPlayers();     // recargar lista
});

function addDeleteEvents() {
  const buttons = document.querySelectorAll(".delete-btn");

  buttons.forEach(button => {
    button.addEventListener("click", async () => {
      const id = button.getAttribute("data-id");

      await deletePlayer(id);
      loadPlayers(); // recargar lista
    });
  });
}

// ejecutar al cargar
loadPlayers();