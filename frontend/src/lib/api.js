const API_BASE = 'https://4dqf2ei3vk.execute-api.ap-southeast-2.amazonaws.com/';

let accessToken = localStorage.getItem('access_token');
let refreshToken = localStorage.getItem('refresh_token');

export function setTokens(access, refresh) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

export function getAccessToken() {
  return accessToken || localStorage.getItem('access_token');
}

async function refreshAccessToken() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (res.ok) {
      const data = await res.json();
      accessToken = data.access_token;
      localStorage.setItem('access_token', data.access_token);
      return true;
    }
  } catch (e) {}
  return false;
}

export async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { ...options.headers };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  
  let res = await fetch(url, { ...options, headers });
  
  if (res.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(url, { ...options, headers });
    } else {
      clearTokens();
      window.location.href = '/';
      throw new Error('Session expired');
    }
  }
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }
  
  return res.json();
}

export function getWsUrl(path) {
  let base = API_BASE || 'http://localhost:8000';
  if (base.startsWith('https://')) {
    base = base.replace('https://', 'wss://');
  } else if (base.startsWith('http://')) {
    base = base.replace('http://', 'ws://');
  }
  return `${base}${path}`;
}
