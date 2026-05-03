import { triggerUnauthorized } from './authEvents';

const STORAGE_KEY = "active_session";

export interface User {
  uid?: string;
  name?: string;
  email?: string;
  role?: string;
  profilePicture?: string;
  phone?: string;
}

export function setActiveSession(user: User | null, token?: string) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    if (token) localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("auth_token");
  }
}

export function getActiveUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

export function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  const data = await response.json();

  if (response.status === 401) {
    setActiveSession(null);
    triggerUnauthorized();
    throw new Error(data.message || 'Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export async function getDashboardDataApi() {
  return fetchApi('/dashboard');
}

export async function updateProfilePictureApi(profilePictureBase64: string) {
  return fetchApi('/user/profile-picture', {
    method: 'PUT',
    body: JSON.stringify({ profilePicture: profilePictureBase64 }),
  });
}

export async function updateProfileApi(profileData: { name: string, phone: string }) {
  return fetchApi('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

export async function updatePasswordApi(passwordData: { currentPassword: string, newPassword: string }) {
  return fetchApi('/user/password', {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  });
}