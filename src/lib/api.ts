import { endpoints } from './endpoints';
import { RegisterPayload, AddSessionPayload, ClientPayload } from '../types/api';

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
    const responseBody = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error: any = new Error(responseBody?.message || `Erro: ${res.status}`);
      error.status = res.status;
      error.body = responseBody;
      throw error;
    }
    return responseBody;
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

export async function register(payload: RegisterPayload) {
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

export async function addClient(payload: ClientPayload) {
  try {
    const res = await apiPost(endpoints.clients, payload);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getClients() {
  try {
    const res = await apiGet(endpoints.clients);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getSessions() {
  try {
    const res = await apiGet(endpoints.sessions);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function addSession(payload: AddSessionPayload) {
  try {
    const res = await apiPost(endpoints.sessions, payload);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getSession(id: string) {
  try {
    const res = await apiGet(endpoints.session.replace(':id', id));
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
} 

export async function updateSession(id: string, payload: { name: string; description: string; date: string }) {
  try {
    const res = await apiPut(endpoints.session.replace(':id', id), payload);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function deleteSession(id: string) {
  try {
    const res = await apiDelete(endpoints.session.replace(':id', id));
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}