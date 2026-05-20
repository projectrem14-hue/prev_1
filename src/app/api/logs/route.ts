import { NextRequest, NextResponse } from 'next/server';
import { pool, ensureMigrated } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';
import { mapLog } from '@/lib/db-mapper';

export async function GET(req: NextRequest) {
  try {
    await ensureMigrated();
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT * FROM reality_logs WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );

    return NextResponse.json({
      logs: result.rows.map(mapLog),
    });
  } catch (error) {
    console.error('[logs GET]', error);
    return NextResponse.json({ error: 'Failed to load logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureMigrated();
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      intentionId,
      completed,
      actualEffort,
      frictionNote,
      contextNote,
      date,
    } = body;

    if (!intentionId || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const owned = await pool.query(
      'SELECT id FROM intentions WHERE id = $1 AND user_id = $2',
      [intentionId, user.id]
    );
    if (owned.rows.length === 0) {
      return NextResponse.json({ error: 'Intention not found' }, { status: 404 });
    }

    const result = await pool.query(
      `INSERT INTO reality_logs (
        user_id, intention_id, completed, actual_effort, friction_note, context_note, date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        user.id,
        intentionId,
        Boolean(completed),
        Number(actualEffort) || 3,
        String(frictionNote || ''),
        String(contextNote || ''),
        String(date),
      ]
    );

    return NextResponse.json({ log: mapLog(result.rows[0]) });
  } catch (error) {
    console.error('[logs POST]', error);
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
  }
}
