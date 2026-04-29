export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface User {
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
}

export function getActiveUser(): User | null {
  const activeStr = localStorage.getItem("active_session");
  if (!activeStr) return null;
  try {
    return JSON.parse(activeStr);
  } catch {
    return null;
  }
}

export function setActiveSession(user: User | null, token?: string) {
  if (user) {
    localStorage.setItem("active_session", JSON.stringify(user));
    if (token) localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("active_session");
    localStorage.removeItem("auth_token");
  }
}

export function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

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
