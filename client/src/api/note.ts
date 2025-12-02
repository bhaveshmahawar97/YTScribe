const API_BASE_URL = 'http://localhost:5000';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(API_BASE_URL + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    const message = data?.message || 'Request failed';
    throw new Error(message);
  }
  return data;
}

export function getNotes() {
  return request('/api/notes', { method: 'GET' });
}

export function createNote(payload: {
  title: string;
  description?: string;
  content: string;
  isAIGenerated?: boolean;
  videoId?: string;
  tags?: string[];
}) {
  return request('/api/notes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
