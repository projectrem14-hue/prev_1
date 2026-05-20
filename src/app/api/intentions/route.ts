import { NextRequest, NextResponse } from 'next/server';
import { pool, ensureMigrated } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';
import { mapIntention } from '@/lib/db-mapper';

export async function GET(req: NextRequest) {
  try {
    await ensureMigrated();
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT * FROM intentions WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );

    return NextResponse.json({
      intentions: result.rows.map(mapIntention),
    });
  } catch (error) {
    console.error('[intentions GET]', error);
    return NextResponse.json({ error: 'Failed to load intentions' }, { status: 500 });
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
      title,
      category,
      effortEstimate,
      scheduledTime,
      estimatedDuration,
      date,
    } = body;

    if (!title || !category || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO intentions (
        user_id, title, category, effort_estimate, scheduled_time, estimated_duration, date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        user.id,
        String(title).trim(),
        category,
        Number(effortEstimate) || 3,
        String(scheduledTime || '09:00'),
        Number(estimatedDuration) || 25,
        String(date),
      ]
    );

    return NextResponse.json({ intention: mapIntention(result.rows[0]) });
  } catch (error) {
    console.error('[intentions POST]', error);
    return NextResponse.json({ error: 'Failed to create intention' }, { status: 500 });
  }
}
