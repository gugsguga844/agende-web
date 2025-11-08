import { endpoints } from './endpoints';
import { RegisterPayload, AddSessionPayload, ClientPayload, UpdateSessionPayload, UpdateUserPayload } from '../types/api';

const envBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
const baseUrl = envBase || (isLocalhost ? 'http://127.0.0.1:8000/api' : '/api');

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

export async function apiPatch(endpoint: string, data: any, customHeaders: any = {}, skipAuth = false) {
  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PATCH',
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

export async function updateUser(payload: UpdateUserPayload) {
  try {
    const res = await apiPatch(endpoints.getUser, payload);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function uploadImage(file: File) {
  try {
    console.log('Iniciando upload da imagem:', file.name, file.size, file.type);
    
    const formData = new FormData();
    formData.append('image', file);

    // Para FormData, NÃO incluir Content-Type - deixar o navegador definir
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseUrl}${endpoints.uploadImage}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    console.log('Resposta do servidor:', res.status, res.statusText);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Erro do servidor:', errorData);
      throw new Error(errorData.message || `Erro: ${res.status} - ${res.statusText}`);
    }

    const responseData = await res.json();
    console.log('Upload bem-sucedido:', responseData);
    return responseData;
  } catch (err) {
    console.error('Erro no upload:', err);
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

export async function updateSession(id: string, payload: UpdateSessionPayload) {
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

export async function getDashboardStatistics() {
  try {
    const res = await apiGet(endpoints.dashboardStats);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}