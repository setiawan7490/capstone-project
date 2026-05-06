import { ApiResponse, DashboardStats, MoodEntry, Pagination } from '../types';

const BASE = '/api';

function getToken() { return localStorage.getItem('mood_token'); }

async function req<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string,string>) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  // Remove Content-Type for FormData
  if (options.body instanceof FormData) delete headers['Content-Type'];
  const res = await fetch(`${BASE}${url}`, { ...options, headers });
  return res.json();
}

// Auth
export const apiRegister = (name: string, email: string, password: string) =>
  req<{ token: string; user: { id: string; name: string; email: string } }>('/auth/register', {
    method: 'POST', body: JSON.stringify({ name, email, password }),
  });

export const apiLogin = (email: string, password: string) =>
  req<{ token: string; user: { id: string; name: string; email: string } }>('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  });

export const apiGetMe = () =>
  req<{ id: string; name: string; email: string }>('/auth/me');

// Detection
export const apiDetectCamera = (imageBase64?: string) =>
  req<{ detection: MoodEntry; entryId: string }>('/detect/camera', {
    method: 'POST', body: JSON.stringify({ imageBase64 }),
  });

export const apiDetectUpload = (file: File) => {
  const form = new FormData();
  form.append('image', file);
  const token = getToken();
  return fetch(`${BASE}/detect/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  }).then(r => r.json()) as Promise<ApiResponse<{ detection: MoodEntry; entryId: string; imageUrl: string }>>;
};

// History
export const apiGetHistory = (params: { page?: number; limit?: number; filter?: string }) => {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.filter) q.set('filter', params.filter);
  return req<{ entries: MoodEntry[]; pagination: Pagination }>(`/history?${q}`);
};

export const apiGetHistoryById = (id: string) =>
  req<MoodEntry>(`/history/${id}`);

export const apiDeleteHistory = (id: string) =>
  req<null>(`/history/${id}`, { method: 'DELETE' });

// Dashboard
export const apiGetDashboardStats = () =>
  req<DashboardStats>('/dashboard/stats');