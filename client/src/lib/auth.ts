export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};

export type AuthData = {
  token: string;
  user: AuthUser;
};

export const getAuth = (): AuthData | null => {
  const stored = localStorage.getItem('portfolio_auth');

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthData;
  } catch {
    return null;
  }
};

export const saveAuth = (data: AuthData) => {
  localStorage.setItem('portfolio_auth', JSON.stringify(data));
  window.dispatchEvent(new Event('auth-change'));
};

export const clearAuth = () => {
  localStorage.removeItem('portfolio_auth');
  window.dispatchEvent(new Event('auth-change'));
};