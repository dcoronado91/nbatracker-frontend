const API_URL = "http://localhost:8080";

export async function getPlayers(page = 1, limit = 9) {
    const res = await fetch(`${API_URL}/players?page=${page}&limit=${limit}`);
    return res.json(); // { data, total, page, limit, pages }
}

export async function createPlayer(player) {
    const res = await fetch(`${API_URL}/players`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(player)
});

    return res.json();
}

export async function deletePlayer(id) {
    await fetch(`${API_URL}/players/${id}`, {
    method: "DELETE"
    });
}

export async function updatePlayer(id, player) {
    const res = await fetch(`${API_URL}/players/${id}`, {
    method: "PUT",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(player)
    });

    return res.json();
}