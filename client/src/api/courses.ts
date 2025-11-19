const API_BASE_URL = 'http://localhost:5000';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(API_BASE_URL + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    throw new Error(data?.message || 'Request failed');
  }
  return data;
}

export function fetchMarketplaceCourses() {
  return request('/api/courses/marketplace', { method: 'GET' });
}

export function createCourse(payload: any) {
  return request('/api/courses', { method: 'POST', body: JSON.stringify(payload) });
}
