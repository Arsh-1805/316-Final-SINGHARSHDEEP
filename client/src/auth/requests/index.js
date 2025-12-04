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

export const getLoggedIn = () =>
  fetchJSON(`${API_BASE}/auth/loggedIn`, { method: "GET" });

export const registerUser = (
  email,
  userName,
  password,
  passwordVerify,
  avatar
) =>
  fetchJSON(`${API_BASE}/auth/register`, {
    method: "POST",
    body: JSON.stringify({
      email,
      userName,
      password,
      passwordVerify,
      avatar,
    }),
  });


export const loginUser = (email, password) =>
  fetchJSON(`${API_BASE}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const logoutUser = () =>
  fetchJSON(`${API_BASE}/auth/logout`, {
    method: "POST",
  });

const apis = {
  getLoggedIn,
  registerUser,
  loginUser,
  logoutUser,
};

export default apis;
