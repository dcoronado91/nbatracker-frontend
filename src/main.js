const API_URL = "http://localhost:8080";

import { getPlayers } from "./api/players";

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
      <hr/>
    `;

    app.appendChild(div);
  });
}

// ejecutar al cargar
loadPlayers();