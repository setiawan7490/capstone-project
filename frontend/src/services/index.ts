import { ApiResponse, DashboardStats, MoodEntry, Pagination } from '../types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE}${url}`, options);
  const json: ApiResponse<T> = await res.json();
  return json;
}

// ── Detection ──────────────────────────────────────────────────────

export async function detectFromCamera(): Promise<ApiResponse<{ detection: MoodEntry; entryId: string }>> {
  return request('/detect/camera', { method: 'POST' });
}

export async function detectFromUpload(file: File): Promise<ApiResponse<{ detection: MoodEntry; entryId: string; imageUrl: string }>> {
  const form = new FormData();
  form.append('image', file);
  return request('/detect/upload', { method: 'POST', body: form });
}

// ── History ────────────────────────────────────────────────────────

export async function fetchHistory(params: {
  page?: number;
  limit?: number;
  filter?: 'today' | 'week' | 'month' | 'all';
}): Promise<ApiResponse<{ entries: MoodEntry[]; pagination: Pagination }>> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.filter) q.set('filter', params.filter);
  return request(`/history?${q.toString()}`);
}

export async function fetchHistoryById(id: string): Promise<ApiResponse<MoodEntry>> {
  return request(`/history/${id}`);
}

export async function deleteHistoryEntry(id: string): Promise<ApiResponse<null>> {
  return request(`/history/${id}`, { method: 'DELETE' });
}

// ── Dashboard ──────────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  return request('/dashboard/stats');
}