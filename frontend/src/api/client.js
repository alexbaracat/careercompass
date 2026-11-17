const BASE = '/api';

// Authenticated fetch — reads JWT from localStorage
async function apiFetch(method, path, body) {
  const token = localStorage.getItem('cq_token');
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${BASE}${path}`, opts);
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; }
  catch { throw new Error(`Server error (${res.status})`); }

  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const get    = (path)       => apiFetch('GET',    path);
export const post   = (path, body) => apiFetch('POST',   path, body);
export const put    = (path, body) => apiFetch('PUT',    path, body);
export const del    = (path)       => apiFetch('DELETE', path);

// ── Named helpers used by the app ─────────────────────────────
export const submitAssessment   = (payload) => post('/assessment/submit', payload);
export const getAssessmentRuns  = ()        => get('/assessment-runs');
export const getLatestProfile   = ()        => get('/auth/me');
export const getUserProfile     = ()        => get('/user/profile');
export const updateUserProfile  = (body)    => put('/user/profile', body);
export const changePassword     = (body)    => put('/user/password', body);
