const API_URL = "http://localhost:8080";

async function loadPlayers() {
  try {
    const res = await fetch(`${API_URL}/players`);
    const players = await res.json();

    console.log(players);

    renderPlayers(players);
  } catch (error) {
    console.error("Error:", error);
  }
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