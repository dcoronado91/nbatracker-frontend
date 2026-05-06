const API_URL = "http://localhost:8080";

export async function getTeams() {
    const res = await fetch(`${API_URL}/teams`);
    return res.json();
}
