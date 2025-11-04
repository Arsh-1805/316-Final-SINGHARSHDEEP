const API_BASE = "http://localhost:4000/api";

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",            
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  return { status: res.status, data };
}

const apis = {
  getPlaylistPairs: () =>
    fetchJSON(`${API_BASE}/playlistpairs`, {
      method: "GET",
    }),

  getPlaylistById: (id) =>
    fetchJSON(`${API_BASE}/playlist/${id}`, {
      method: "GET",
    }),

  createPlaylist: (name, songs, ownerEmail) =>
    fetchJSON(`${API_BASE}/playlist`, {
      method: "POST",
      body: JSON.stringify({
        name,
        songs,
        ownerEmail,
      }),
    }),

  updatePlaylistById: (id, playlist) =>
    fetchJSON(`${API_BASE}/playlist/${id}`, {
      method: "PUT",
      body: JSON.stringify({ playlist }),
    }),
  deletePlaylistById: (id) =>
    fetchJSON(`${API_BASE}/playlist/${id}`, {
      method: "DELETE",
    }),
};

export default apis;
