export async function createYoutubeTranscript(url: string, withTimestamps: boolean) {
  const res = await fetch('http://localhost:5000/api/transcript/youtube', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ url, withTimestamps }),
  });
  if (!res.ok) {
    const msg = await safeMessage(res);
    throw new Error(msg || 'Failed to create transcript');
  }
  return res.json();
}

export async function getTranscriptById(id: string) {
  const res = await fetch(`http://localhost:5000/api/transcript/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    const msg = await safeMessage(res);
    throw new Error(msg || 'Failed to fetch transcript');
  }
  return res.json();
}

async function safeMessage(res: Response) {
  try {
    const data = await res.json();
    return data?.message;
  } catch {
    return undefined;
  }
}
