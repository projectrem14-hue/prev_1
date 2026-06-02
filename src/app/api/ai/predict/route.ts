import { NextRequest, NextResponse } from 'next/server';
import { pool, ensureMigrated } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-server';
import { predictBehavioralOutcome } from '@/ai/flows/predict-behavioral-outcome';
import { BehavioralClassifier } from '@/ai/models/behavioral-classifier';

export async function POST(req: NextRequest) {
  try {
    await ensureMigrated();
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, category, effortEstimate, scheduledTime, date } = body;

    if (!title || !category || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the user's historical logs to provide behavioral context for prediction
    const historyResult = await pool.query(
      `SELECT 
        i.title, 
        i.category, 
        i.effort_estimate as effort, 
        i.scheduled_time,
        r.completed, 
        r.friction_note as friction, 
        r.date
      FROM reality_logs r
      JOIN intentions i ON r.intention_id = i.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT 30`,
      [user.id]
    );

    const history = historyResult.rows.map(row => ({
      title: row.title,
      category: row.category,
      effort: Number(row.effort) || 3,
      scheduledTime: row.scheduled_time || '09:00',
      completed: Boolean(row.completed),
      friction: row.friction || '',
      date: row.date,
    }));

    // Train and execute the local math-based ML model
    const classifier = new BehavioralClassifier();
    const chronologicalHistory = [...history].reverse();
    classifier.train(chronologicalHistory);

    const targetTask = {
      category,
      effort: Number(effortEstimate) || 3,
      scheduledTime: scheduledTime || '09:00',
    };
    const classifierPrediction = classifier.predict(targetTask, history);
    const modelInfo = classifier.getModelInfo();

    // Call the predictBehavioralOutcome flow using the configured gemma2:2b model
    let predictionOutput;
    try {
      predictionOutput = await predictBehavioralOutcome({
        history,
        currentIntention: {
          title,
          category,
          effort: Number(effortEstimate) || 3,
          scheduledTime: scheduledTime || '09:00',
          date,
        },
      });
    } catch (llmError) {
      console.warn('[predict API Route] Gemma predictBehavioralOutcome failed or timed out. Returning local fallback.', llmError);
      predictionOutput = {
        prediction: 'completed' as const,
        probability: 0.5,
        reasoning: 'Gemma forecast is currently offline or timed out. Your scheduling parameters are logged and ready.',
        suggestedAction: 'Break the task down into smaller increments and protect your focus block.',
      };
    }

    return NextResponse.json({
      ...predictionOutput,
      classifierPrediction,
      modelInfo,
    });
  } catch (error) {
    console.error('[predict API Route Error]', error);
    return NextResponse.json({ error: 'Failed to predict outcome' }, { status: 500 });
  }
}
