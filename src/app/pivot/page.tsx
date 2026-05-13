
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  BrainCircuit, 
  RefreshCw, 
  ShieldAlert, 
  Lightbulb, 
  Loader2, 
  Target, 
  Clock, 
  Zap,
  TrendingUp,
  ArrowRightCircle
} from 'lucide-react';
import { getAllIntentions, getAllRealityLogs } from '@/lib/firestore';
import { Intention, RealityLog } from '@/lib/schema';
import { format, parseISO, getDay } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Pivot() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [logs, setLogs] = useState<RealityLog[]>([]);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [allIntentions, allLogs] = await Promise.all([
        getAllIntentions(),
        getAllRealityLogs()
      ]);
      setIntentions(allIntentions);
      setLogs(allLogs);
    } catch (error) {
      toast({ variant: "destructive", title: "Diagnostic Error", description: "Failed to audit behavior history." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    document.title = "GapLogic — Cognitive Pivot";
    fetchData();
  }, [toast]);

  const diagnostics = useMemo(() => {
    if (logs.length < 5) return null;
    const gaps: any[] = [];
    const pivots: any[] = [];

    // Analyze Late Day Health Pattern
    const healthLate = intentions.filter(i => {
      const hour = parseInt(i.scheduledTime.split(':')[0]);
      return i.category === 'health' && hour >= 20;
    });
    const healthLateRate = healthLate.length > 0 ? (logs.filter(l => healthLate.some(i => i.id === l.intentionId && l.completed)).length / healthLate.length) * 100 : 100;

    if (healthLate.length >= 2 && healthLateRate < 50) {
      gaps.push({ title: 'Circadian Conflict', desc: `You miss ${Math.round(100 - healthLateRate)}% of health intentions after 8PM.`, cat: 'health', severity: 'high', icon: Clock });
      pivots.push({ title: 'Chronotype Adjustment', desc: 'Reschedule health habits before 7PM to leverage peak energy.', cat: 'health', icon: ArrowRightCircle });
    }

    // Analyze Complexity Friction
    const heavyWork = intentions.filter(i => i.category === 'work' && i.effortEstimate > 3);
    const heavyWorkRate = heavyWork.length > 0 ? (logs.filter(l => heavyWork.some(i => i.id === l.intentionId && l.completed)).length / heavyWork.length) * 100 : 100;

    if (heavyWork.length >= 2 && heavyWorkRate < 40) {
      gaps.push({ title: 'Complexity Friction', desc: `Heavy work tasks (Effort > 3) are failing at ${Math.round(100-heavyWorkRate)}% rate.`, cat: 'work', severity: 'high', icon: Target });
      pivots.push({ title: 'Atomic Decomposition', desc: 'Break high-effort work into sub-60 minute chunks.', cat: 'work', icon: Zap });
    }

    const completionRate = logs.filter(l => l.completed).length / logs.length;
    const score = Math.round(completionRate * 100);

    return { gaps, pivots, score, analyzed: intentions.length + logs.length };
  }, [intentions, logs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12">
          <Skeleton className="h-12 w-96 mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Skeleton className="h-[500px] rounded-3xl" />
            <Skeleton className="h-[500px] rounded-3xl" />
          </div>
        </main>
      </div>
    );
  }

  if (logs.length < 5) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        <main className="flex-1 md:ml-64 p-6 lg:p-12 flex flex-col items-center justify-center text-center pb-24 md:pb-12">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6"><ShieldAlert className="w-12 h-12 text-primary" /></div>
          <h2 className="text-3xl font-headline font-bold mb-4">Insufficient Behavioral Data</h2>
          <p className="text-muted-foreground mb-8 max-w-md">Run at least 5 reality syncs to unlock AI diagnostic pivoting.</p>
          <div className="w-full max-w-xs space-y-3 mb-10">
            <div className="flex justify-between text-xs font-bold uppercase"><span>Sync Progress</span><span className="text-primary">{logs.length} / 5</span></div>
            <Progress value={(logs.length / 5) * 100} className="h-3" />
          </div>
          <Link href="/sync"><Button size="lg" className="rounded-2xl px-12 h-14 font-bold shadow-xl shadow-primary/20 bg-primary text-primary-foreground">Start Syncing</Button></Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div><h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Cognitive Pivot</h1><p className="text-muted-foreground text-lg">AI-powered auditing of behavioral leaks and strategic pivots.</p></div>
          <Button onClick={fetchData} disabled={refreshing} className="rounded-2xl px-8 h-14 font-bold gap-3 shadow-xl shadow-primary/20 bg-primary text-primary-foreground">
            {refreshing ? <Loader2 className="animate-spin" /> : <BrainCircuit className="w-5 h-5" />} Analyze History
          </Button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="glass-card p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Patterns Analyzed</p>
            <div className="text-3xl font-bold font-headline">{diagnostics?.analyzed}</div>
          </Card>
          <Card className="glass-card p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Gaps Detected</p>
            <div className="text-3xl font-bold font-headline text-destructive">{diagnostics?.gaps.length}</div>
          </Card>
          <Card className="glass-card p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Pivots Generated</p>
            <div className="text-3xl font-bold font-headline text-accent">{diagnostics?.pivots.length}</div>
          </Card>
          <Card className="glass-card p-6 relative overflow-hidden">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Behavioral Health</p>
            <div className="text-3xl font-bold font-headline text-primary">{diagnostics?.score}%</div>
            <div className="absolute bottom-0 left-0 h-1 bg-primary" style={{ width: `${diagnostics?.score}%` }} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h2 className="font-headline text-2xl font-bold flex items-center gap-2"><ShieldAlert className="w-6 h-6 text-destructive" /> Behavioral Gaps</h2>
            <div className="space-y-4">
              {diagnostics?.gaps.map((gap: any, i: number) => (
                <Card key={i} className="glass-card border-l-4 border-l-destructive">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-headline flex items-center gap-2"><gap.icon className="w-4 h-4" /> {gap.title}</CardTitle>
                    <Badge variant="outline" className="capitalize text-destructive border-destructive/30">{gap.severity}</Badge>
                  </CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{gap.desc}</p></CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="font-headline text-2xl font-bold flex items-center gap-2"><Lightbulb className="w-6 h-6 text-accent" /> Strategic Pivots</h2>
            <div className="space-y-4">
              {diagnostics?.pivots.map((pivot: any, i: number) => (
                <Card key={i} className="glass-card border-l-4 border-l-accent">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-headline flex items-center gap-2"><ArrowRightCircle className="w-4 h-4 text-accent" /> {pivot.title}</CardTitle>
                    <Badge variant="outline" className="capitalize text-accent border-accent/30">{pivot.cat}</Badge>
                  </CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{pivot.desc}</p></CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
