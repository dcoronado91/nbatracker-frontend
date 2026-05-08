const API_URL = import.meta.env.VITE_API_URL || "https://nbatracker-backend-production.up.railway.app";

export async function getTeams() {
    const res = await fetch(`${API_URL}/teams`);
    return res.json();
}
