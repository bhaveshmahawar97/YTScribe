const API_BASE_URL = 'http://localhost:5000';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(API_BASE_URL + path, {
    credentials: 'include',
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

export function getMyPlaylists() {
  return request(`/api/playlists/me`, { method: 'GET' });
}

export function getPlaylist(id: string) {
  return request(`/api/playlists/${id}`, { method: 'GET' });
}

export function createPlaylist(payload: {
  title: string;
  description?: string | null;
  category?: string | null;
  thumbnailUrl?: string | null;
  firstVideoUrl?: string | null;
}) {
  return request('/api/playlists', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function importPlaylist(payload: { playlistUrl: string; title?: string }) {
  return request('/api/playlists/import', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function importYoutubePlaylist(url: string) {
  return request('/api/playlists/import-youtube', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export function addVideo(playlistId: string, payload: { title: string; youtubeUrl: string; order?: number }) {
  return request(`/api/playlists/${playlistId}/videos`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateVideoStatus(playlistId: string, videoId: string, status: 'not_started' | 'watching' | 'completed') {
  return request(`/api/playlists/${playlistId}/videos/${videoId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function saveVideoProgress(playlistId: string, videoId: string, payload: { currentTime: number; status: 'watching' | 'paused' | 'completed' }) {
  return request(`/api/playlists/${playlistId}/videos/${videoId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
