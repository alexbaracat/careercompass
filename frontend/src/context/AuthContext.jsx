import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Safe fetch wrapper — handles empty bodies, proxy failures, network errors
async function apiFetch(path, options = {}) {
  let res;
  try {
    res = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch (networkErr) {
    // Fetch itself threw (e.g. ECONNREFUSED proxied as network error)
    throw new Error('Cannot reach the server. Make sure the backend is running on port 4000.');
  }

  // Try to parse body as JSON; fall back to plain text
  let data;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // Server returned non-JSON (e.g. nginx/Vite error HTML)
    throw new Error(
      res.status === 502 || res.status === 503 || text === ''
        ? 'Cannot reach the server. Make sure the backend is running on port 4000.'
        : `Server error (${res.status}): ${text.slice(0, 120)}`
    );
  }

  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const token  = localStorage.getItem('cq_token');
    const stored = localStorage.getItem('cq_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('cq_token', data.token);
    localStorage.setItem('cq_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (email, password, firstName, lastName) => {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    localStorage.setItem('cq_token', data.token);
    localStorage.setItem('cq_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('cq_token');
    localStorage.removeItem('cq_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
