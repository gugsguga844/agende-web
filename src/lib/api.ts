import { endpoints } from './endpoints';

const baseUrl = 'https://sessio-api-production.up.railway.app/api';

function getAuthHeaders(customHeaders: any = {}, skipAuth = false) {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };
}

async function apiGet(endpoint: string, customHeaders: any = {}, skipAuth = false) {
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      headers: getAuthHeaders(customHeaders, skipAuth),
    });
    if (!res.ok) throw new Error(`Erro: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function apiPost(endpoint: string, data: any, customHeaders: any = {}, skipAuth = false) {
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(customHeaders, skipAuth),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Erro: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function apiPut(endpoint: string, data: any, customHeaders: any = {}, skipAuth = false) {
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(customHeaders, skipAuth),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Erro: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function apiDelete(endpoint: string, customHeaders: any = {}, skipAuth = false) {
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(customHeaders, skipAuth),
    });
    if (!res.ok) throw new Error(`Erro: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function login(payload: { email: string; password: string }) {
  try {
    // skipAuth = true para não enviar o token no login
    const res = await apiPost(endpoints.login, payload, {}, true);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function register(payload: { email: string; password: string }) {
  try {
    // skipAuth = true para não enviar o token no register
    const res = await apiPost(endpoints.register, payload, {}, true);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getUser() {
  try {
    const res = await apiGet(endpoints.getUser);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export { apiGet, apiPost, apiPut, apiDelete, baseUrl }; 