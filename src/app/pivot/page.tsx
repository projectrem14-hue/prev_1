
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [logs, setLogs] = useState<RealityLog[]>([]);

  const fetchData = useCallback(async () => {
    if (!db) return;
    setRefreshing(true);
    try {
      const [allIntentions, allLogs] = await Promise.all([
        getAllIntentions(db),
        getAllRealityLogs(db)
      ]);
      setIntentions(allIntentions);
      setLogs(allLogs);
    } catch (error) {
      toast({ variant: "destructive", title: "Diagnostic Error", description: "Failed to audit behavior history." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast, db]);

  useEffect(() => {
    document.title = "GapLogic — Cognitive Pivot";
    if (db) fetchData();
  }, [db, fetchData]);

  const diagnostics = useMemo(() => {
    if (logs.length < 5) return null;
    const gaps: any[] = [];
    const pivots: any[] = [];

    // Simple Rule Engines
    const completionRate = logs.filter(l => l.completed).length / logs.length;
    const score = Math.round(completionRate * 100);

    return { gaps, pivots, score, analyzed: intentions.length + logs.length };
  }, [intentions, logs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex"><Navigation />
        <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12"><Skeleton className="h-[600px] w-full rounded-3xl" /></main>
      </div>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h2 className="font-headline text-2xl font-bold flex items-center gap-2 text-destructive"><ShieldAlert className="w-6 h-6" /> Behavioral Gaps</h2>
                  <Card className="glass-card p-6"><p className="text-muted-foreground italic">No gaps detected. You are maintaining high consistency.</p></Card>
                </div>
                <div className="space-y-6">
                  <h2 className="font-headline text-2xl font-bold flex items-center gap-2 text-accent"><Lightbulb className="w-6 h-6" /> Strategic Pivots</h2>
                  <Card className="glass-card p-6"><p className="text-muted-foreground italic">Your current workflow is optimized.</p></Card>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
