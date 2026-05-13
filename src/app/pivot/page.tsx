
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigation } from '@/components/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useAuth } from '@/lib/AuthContext';
import { 
  BrainCircuit, 
  ShieldAlert, 
  Lightbulb, 
  Loader2, 
  Target, 
  Clock, 
  Zap,
  ArrowRightCircle
} from 'lucide-react';
import { getAllIntentions, getAllRealityLogs } from '@/lib/firestore';
import { Intention, RealityLog } from '@/lib/schema';
import Link from 'next/link';

export default function Pivot() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [logs, setLogs] = useState<RealityLog[]>([]);

  const fetchData = useCallback(async () => {
    if (!db || !user) return;
    setRefreshing(true);
    try {
      const [allIntentions, allLogs] = await Promise.all([
        getAllIntentions(db, user.uid),
        getAllRealityLogs(db, user.uid)
      ]);
      setIntentions(allIntentions);
      setLogs(allLogs);
    } catch (error) {
      toast({ variant: "destructive", title: "Diagnostic Error", description: "Failed to audit behavior history." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast, db, user]);

  useEffect(() => {
    document.title = "GapLogic — Cognitive Pivot";
    if (db && user) fetchData();
  }, [db, user, fetchData]);

  const diagnostics = useMemo(() => {
    if (logs.length < 5) return null;
    const gaps: any[] = [];
    const pivots: any[] = [];

    // Pattern Analysis Rules
    const lateHealth = logs.filter(l => {
      const intention = intentions.find(i => i.id === l.intentionId);
      if (!intention || intention.category !== 'health') return false;
      const hour = parseInt(intention.scheduledTime.split(':')[0]);
      return hour >= 20 && !l.completed;
    });
    if (lateHealth.length >= 3) {
      gaps.push({ text: "Willpower leakage: Health intentions after 8PM consistently fail.", category: 'health', severity: 'high' });
      pivots.push({ text: "Reschedule high-friction health habits before 7PM to ensure compliance.", category: 'health', priority: 'high' });
    }

    const heavyWork = logs.filter(l => {
      const intention = intentions.find(i => i.id === l.intentionId);
      return intention && intention.category === 'work' && intention.effortEstimate > 3 && !l.completed;
    });
    if (heavyWork.length >= 2) {
      gaps.push({ text: "Overestimation: High-effort work tasks (4+) are stalling.", category: 'work', severity: 'medium' });
      pivots.push({ text: "Break work sessions into smaller sub-tasks with effort levels < 3.", category: 'work', priority: 'medium' });
    }

    const mondayLull = logs.filter(l => {
      const date = new Date(l.date);
      return date.getDay() === 1 && !l.completed;
    });
    if (mondayLull.length >= 2) {
      gaps.push({ text: "Monday Inertia: The start of your week shows a 60% higher failure rate.", category: 'personal', severity: 'medium' });
      pivots.push({ text: "Reduce effort estimates by 1 point on Mondays to build early momentum.", category: 'personal', priority: 'high' });
    }

    const totalLogs = logs.length;
    const completionRate = logs.filter(l => l.completed).length / totalLogs;
    const effortAccuracy = logs.filter(l => {
      const intention = intentions.find(i => i.id === l.intentionId);
      return intention && l.actualEffort <= intention.effortEstimate;
    }).length / totalLogs;

    const score = Math.round((completionRate * 50) + (effortAccuracy * 30) + (20)); // Base bonus

    return { gaps, pivots, score, analyzed: intentions.length + logs.length };
  }, [intentions, logs]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background text-foreground flex"><Navigation />
          <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12"><Skeleton className="h-[600px] w-full rounded-3xl" /></main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12">
          {logs.length < 5 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <ShieldAlert className="w-16 h-16 text-primary mb-6" />
              <h2 className="text-3xl font-headline font-bold mb-4">Insufficient Behavioral Data</h2>
              <p className="text-muted-foreground mb-8 max-w-md">Run at least 5 reality syncs to unlock diagnostics.</p>
              <Progress value={(logs.length / 5) * 100} className="w-64 h-3 mb-10" />
              <Link href="/sync"><Button size="lg" className="rounded-2xl px-12 h-14 font-bold shadow-xl shadow-primary/20">Start Syncing</Button></Link>
            </div>
          ) : (
            <>
              <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div><h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Cognitive Pivot</h1><p className="text-muted-foreground text-lg">AI-powered behavior auditing.</p></div>
                <Button onClick={fetchData} disabled={refreshing} className="rounded-2xl px-8 h-14 font-bold gap-3 shadow-xl shadow-primary/20">
                  {refreshing ? <Loader2 className="animate-spin" /> : <BrainCircuit className="w-5 h-5" />} Analyze History
                </Button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
                <Card className="glass-card col-span-1 lg:col-span-3">
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><Zap className="w-8 h-8 text-primary" /></div>
                      <div><div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Behavioral Health Score</div><div className="text-4xl font-bold font-headline">{diagnostics?.score}</div></div>
                    </div>
                    <div className="text-right hidden sm:block"><div className="text-xs font-bold text-muted-foreground uppercase mb-1">Status</div><Badge className="bg-emerald-500/20 text-emerald-500 border-none px-4">Optimized</Badge></div>
                  </div>
                </Card>
                <Card className="glass-card">
                  <div className="p-6 text-center">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Gaps Analyzed</div>
                    <div className="text-3xl font-bold font-headline">{diagnostics?.analyzed}</div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h2 className="font-headline text-2xl font-bold flex items-center gap-2 text-destructive"><ShieldAlert className="w-6 h-6" /> Behavioral Gaps</h2>
                  <div className="grid gap-4">
                    {diagnostics?.gaps.map((gap, i) => (
                      <Card key={i} className="glass-card border-l-4 border-l-destructive p-5 flex gap-4">
                        <div className="pt-1"><AlertCircle className="w-5 h-5 text-destructive" /></div>
                        <div>
                          <Badge variant="outline" className="mb-2 capitalize">{gap.category}</Badge>
                          <p className="text-sm leading-relaxed">{gap.text}</p>
                          <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-destructive">Severity: {gap.severity}</div>
                        </div>
                      </Card>
                    ))}
                    {diagnostics?.gaps.length === 0 && <Card className="glass-card p-6 text-center"><p className="text-muted-foreground italic">No gaps detected. You are maintaining high consistency.</p></Card>}
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="font-headline text-2xl font-bold flex items-center gap-2 text-accent"><Lightbulb className="w-6 h-6" /> Strategic Pivots</h2>
                  <div className="grid gap-4">
                    {diagnostics?.pivots.map((pivot, i) => (
                      <Card key={i} className="glass-card border-l-4 border-l-accent p-5 flex gap-4">
                        <div className="pt-1"><ArrowRightCircle className="w-5 h-5 text-accent" /></div>
                        <div>
                          <Badge className="mb-2 capitalize bg-accent/20 text-accent border-none">{pivot.category}</Badge>
                          <p className="text-sm leading-relaxed">{pivot.text}</p>
                          <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-accent">Priority: {pivot.priority}</div>
                        </div>
                      </Card>
                    ))}
                    {diagnostics?.pivots.length === 0 && <Card className="glass-card p-6 text-center"><p className="text-muted-foreground italic">Your current workflow is optimized.</p></Card>}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
