import { NextRequest, NextResponse } from 'next/server';
import { pool, ensureMigrated } from '@/lib/db';
import {
  verifyPassword,
  createSessionForUser,
  setSessionCookie,
  SessionUser,
} from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    await ensureMigrated();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const result = await pool.query(
      'SELECT id, email, name, password_hash, created_at FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const row = result.rows[0];
    const valid = await verifyPassword(password, row.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user: SessionUser = {
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.created_at.toISOString(),
    };

    const token = await createSessionForUser(user);
    await setSessionCookie(token);

    return NextResponse.json({ user, token });
  } catch (error) {
    console.error('[login]', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
