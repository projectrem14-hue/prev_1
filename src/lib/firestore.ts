'use client';

import { Intention, RealityLog } from './schema';

async function parseJsonResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export async function addIntention(
  data: Omit<Intention, 'id' | 'createdAt'>
): Promise<Intention> {
  const result = await parseJsonResponse(
    await fetch('/api/intentions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
  );
  return result.intention;
}

export async function addRealityLog(
  data: Omit<RealityLog, 'id' | 'createdAt'>
): Promise<RealityLog> {
  const result = await parseJsonResponse(
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
  );
  return result.log;
}
