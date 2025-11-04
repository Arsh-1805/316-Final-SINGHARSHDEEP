const API_BASE = "http://localhost:4000";

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  return { status: res.status, data };
}

// 1) these two really are /api/...
export const getPlaylistPairs = () =>
  fetchJSON(`${API_BASE}/api/playlistpairs`, {
    method: "GET",
  });

export const getPlaylistById = (id) =>
  fetchJSON(`${API_BASE}/api/playlist/${id}`, {
    method: "GET",
  });

export const createPlaylist = (name, songs = [], ownerEmail) =>
  fetchJSON(`${API_BASE}/store/playlist`, {
    method: "POST",
    body: JSON.stringify({
      name,
      ownerEmail,
      songs,
    }),
  });

export const updatePlaylistById = (id, playlist) =>
  fetchJSON(`${API_BASE}/store/playlist/${id}`, {
    method: "PUT",
    body: JSON.stringify({ playlist }),
  });

export const deletePlaylistById = (id) =>
  fetchJSON(`${API_BASE}/store/playlist/${id}`, {
    method: "DELETE",
  });

const apis = {
  getPlaylistPairs,
  getPlaylistById,
  createPlaylist,
  updatePlaylistById,
  deletePlaylistById,
};

export default apis;
