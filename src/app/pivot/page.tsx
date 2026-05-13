'use client';

import { useState, useEffect, useMemo } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  BrainCircuit, 
  RefreshCw, 
  Zap, 
  Lightbulb, 
  TrendingUp, 
  ChevronRight, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Target, 
  ShieldAlert,
  ArrowRightCircle
} from 'lucide-react';
import { getAllIntentions, getAllRealityLogs } from '@/lib/firestore';
import { Intention, RealityLog } from '@/lib/schema';
import { format, parseISO, getDay, isSameDay } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Finding {
  id: string;
  type: 'gap' | 'pivot';
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  icon: any;
}

export default function Pivot() {
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
      console.error("Error fetching diagnostic data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const diagnostics = useMemo(() => {
    if (logs.length < 5) return null;

    const gaps: Finding[] = [];
    const pivots: Finding[] = [];

    // 1. Health Intentions after 8PM
    const healthLate = intentions.filter(i => {
      const hour = parseInt(i.scheduledTime.split(':')[0]);
      return i.category === 'health' && hour >= 20;
    });
    const healthLateLogs = logs.filter(l => healthLate.some(i => i.id === l.intentionId));
    const healthLateRate = healthLateLogs.length > 0 
      ? (healthLateLogs.filter(l => l.completed).length / healthLateLogs.length) * 100 
      : 100;

    if (healthLate.length >= 2 && healthLateRate < 50) {
      gaps.push({
        id: 'health-late',
        type: 'gap',
        title: 'Circadian Conflict',
        description: `You miss ${Math.round(100 - healthLateRate)}% of health intentions scheduled after 8PM. Physical willpower is depleted in your late-day cycle.`,
        category: 'health',
        severity: 'high',
        icon: Clock
      });
      pivots.push({
        id: 'pivot-health-late',
        type: 'pivot',
        title: 'Chronotype Adjustment',
        description: 'Reschedule health habits before 7PM to leverage peak cortisol and willpower windows.',
        category: 'health',
        severity: 'medium',
        icon: ArrowRightCircle
      });
    }

    // 2. Work Intentions effort > 3
    const heavyWork = intentions.filter(i => i.category === 'work' && i.effortEstimate > 3);
    const heavyWorkLogs = logs.filter(l => heavyWork.some(i => i.id === l.intentionId));
    const heavyWorkRate = heavyWorkLogs.length > 0
      ? (heavyWorkLogs.filter(l => l.completed).length / heavyWorkLogs.length) * 100
      : 100;

    if (heavyWork.length >= 2 && heavyWorkRate < 40) {
      gaps.push({
        id: 'heavy-work',
        type: 'gap',
        title: 'Complexity Friction',
        description: `Work intentions with effort > 3 are completed only ${Math.round(heavyWorkRate)}% of the time. High-intensity tasks are causing execution paralysis.`,
        category: 'work',
        severity: 'high',
        icon: Target
      });
      pivots.push({
        id: 'pivot-heavy-work',
        type: 'pivot',
        title: 'Atomic Decomposition',
        description: 'Break work tasks rated above effort 3 into smaller, sub-60 minute chunks to bypass friction.',
        category: 'work',
        severity: 'high',
        icon: Zap
      });
    }

    // 3. Learning Misses (Burnout pattern)
    const learningLogs = logs.filter(l => {
      const intention = intentions.find(i => i.id === l.intentionId);
      return intention?.category === 'learning';
    }).sort((a, b) => b.date.localeCompare(a.date));
    
    const consecutiveMissedLearning = learningLogs.slice(0, 3).filter(l => !l.completed).length;
    if (consecutiveMissedLearning >= 3) {
      gaps.push({
        id: 'learning-burnout',
        type: 'gap',
        title: 'Cognitive Saturation',
        description: 'You have missed 3+ consecutive learning intentions. Your brain is signaling a need for a recovery phase.',
        category: 'learning',
        severity: 'medium',
        icon: BrainCircuit
      });
      pivots.push({
        id: 'pivot-learning-burnout',
        type: 'pivot',
        title: 'Knowledge Recess',
        description: 'Add a scheduled rest day for learning — burnout pattern detected. Switch to passive consumption for 48h.',
        category: 'learning',
        severity: 'low',
        icon: RefreshCw
      });
    }

    // 4. Monday Blues
    const mondayIntentions = intentions.filter(i => getDay(parseISO(i.date)) === 1);
    const mondayLogs = logs.filter(l => mondayIntentions.some(i => i.id === l.intentionId));
    const mondayRate = mondayLogs.length > 0 
      ? (mondayLogs.filter(l => l.completed).length / mondayLogs.length) * 100 
      : 100;

    if (mondayIntentions.length >= 3 && mondayRate < 60) {
      gaps.push({
        id: 'monday-blues',
        type: 'gap',
        title: 'Inertia Lag',
        description: `Monday intentions have a low completion rate (${Math.round(mondayRate)}%). Transition from rest to execution is leaking energy.`,
        category: 'personal',
        severity: 'medium',
        icon: TrendingUp
      });
      pivots.push({
        id: 'pivot-monday-blues',
        type: 'pivot',
        title: 'Momentum Priming',
        description: 'Monday intentions need lower effort estimates (Max 2) to build psychological momentum.',
        category: 'personal',
        severity: 'medium',
        icon: Zap
      });
    }

    // 5. Effort Inaccuracy (Friction Correlation)
    const effortAccuracyLogs = logs.filter(l => {
      const intention = intentions.find(i => i.id === l.intentionId);
      return intention && l.actualEffort > intention.effortEstimate;
    });

    if (effortAccuracyLogs.length >= 3) {
      gaps.push({
        id: 'effort-leak',
        type: 'gap',
        title: 'Planning Optimism',
        description: 'High friction days correlate with actual effort exceeding estimates. You are chronically underestimating energy costs.',
        category: 'personal',
        severity: 'low',
        icon: ShieldAlert
      });
      pivots.push({
        id: 'pivot-effort-leak',
        type: 'pivot',
        title: 'Buffer Padding',
        description: 'When actual effort exceeds estimate, add 25% buffer time to the next planned session.',
        category: 'personal',
        severity: 'low',
        icon: Clock
      });
    }

    // Scoring
    const totalCompleted = logs.filter(l => l.completed).length;
    const completionRate = logs.length > 0 ? (totalCompleted / logs.length) : 0;
    
    const effortAccuracy = logs.length > 0 
      ? logs.reduce((acc, l) => {
          const intention = intentions.find(i => i.id === l.intentionId);
          if (!intention) return acc;
          const diff = Math.abs(l.actualEffort - intention.effortEstimate);
          return acc + (1 - diff / 5);
        }, 0) / logs.length
      : 0;

    const score = Math.round((completionRate * 50) + (effortAccuracy * 30) + (Math.min(gaps.length === 0 ? 20 : 5, 20)));

    return {
      gaps,
      pivots,
      score,
      patternsAnalyzed: intentions.length + logs.length,
      gapsCount: gaps.length,
      pivotsCount: pivots.length
    };
  }, [intentions, logs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        <main className="flex-1 ml-64 p-8 lg:p-12">
          <header className="mb-10 space-y-4">
            <Skeleton className="h-12 w-[400px]" />
            <Skeleton className="h-6 w-[500px]" />
          </header>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Skeleton className="h-[600px]" />
            <Skeleton className="h-[600px]" />
          </div>
        </main>
      </div>
    );
  }

  if (logs.length < 5) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        <main className="flex-1 ml-64 p-8 lg:p-12 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <ShieldAlert className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-headline font-bold mb-4">Insufficient Behavioral Data</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Not enough behavioral data yet. Log at least 5 reality syncs to unlock diagnostics.
          </p>
          <div className="w-full max-w-xs space-y-3 mb-10">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
              <span>Sync Progress</span>
              <span className="text-primary">{logs.length} / 5</span>
            </div>
            <Progress value={(logs.length / 5) * 100} className="h-3" />
          </div>
          <Link href="/sync">
            <Button size="lg" className="rounded-2xl gap-2 font-bold px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Zap className="w-5 h-5" />
              Start Syncing
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const severityColors = {
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    medium: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    high: 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  const categoryColors: Record<string, string> = {
    health: 'bg-emerald-500/15 text-emerald-500',
    work: 'bg-blue-500/15 text-blue-500',
    learning: 'bg-purple-500/15 text-purple-500',
    personal: 'bg-orange-500/15 text-orange-500',
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Cognitive Pivot</h1>
            <p className="text-muted-foreground text-lg">Real-time auditing of your behavioral leaks and strategic adjustments.</p>
          </div>
          <Button 
            onClick={fetchData} 
            disabled={refreshing}
            className="rounded-2xl px-8 py-6 h-auto text-lg font-bold gap-3 shadow-lg shadow-primary/20 hover:scale-105 transition-transform bg-primary text-primary-foreground"
          >
            {refreshing ? <Loader2 className="w-6 h-6 animate-spin" /> : <BrainCircuit className="w-6 h-6" />}
            {refreshing ? 'Analyzing...' : 'Re-run Diagnostics'}
          </Button>
        </header>

        {/* Diagnostic Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card className="glass-card p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Patterns Analyzed</p>
            <div className="text-3xl font-bold font-headline">{diagnostics?.patternsAnalyzed}</div>
          </Card>
          <Card className="glass-card p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Gaps Detected</p>
            <div className="text-3xl font-bold font-headline text-destructive">{diagnostics?.gapsCount}</div>
          </Card>
          <Card className="glass-card p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Pivots Recommended</p>
            <div className="text-3xl font-bold font-headline text-accent">{diagnostics?.pivotsCount}</div>
          </Card>
          <Card className="glass-card p-6 overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Behavioral Health</p>
              <div className="text-3xl font-bold font-headline text-primary">{diagnostics?.score} / 100</div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-muted">
              <div 
                className="h-full bg-primary transition-all duration-1000" 
                style={{ width: `${diagnostics?.score}%` }}
              />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12">
          {/* Root Cause Report */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-destructive" />
                Behavioral Gaps Detected
              </h2>
            </div>

            <div className="space-y-4">
              {diagnostics?.gaps.length === 0 ? (
                <Card className="glass-card border-l-4 border-l-primary p-6">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="font-bold text-lg">Zero Friction Detected</h3>
                      <p className="text-sm text-muted-foreground">Your execution is perfectly aligned with your intentions. Keep this momentum.</p>
                    </div>
                  </div>
                </Card>
              ) : (
                diagnostics?.gaps.map((gap) => (
                  <Card key={gap.id} className={cn(
                    "bg-card/40 border-border/40 hover:bg-card/60 transition-colors border-l-4",
                    gap.severity === 'high' ? 'border-l-red-500' : gap.severity === 'medium' ? 'border-l-orange-500' : 'border-l-blue-500'
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge className={cn("text-[10px] uppercase border font-bold", severityColors[gap.severity])}>
                          {gap.severity} Priority
                        </Badge>
                        <Badge variant="outline" className={cn("capitalize border-none px-2", categoryColors[gap.category])}>
                          {gap.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-headline mt-3 flex items-center gap-2">
                        <gap.icon className="w-4 h-4 text-muted-foreground" />
                        {gap.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {gap.description}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Pivot Strategies */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-accent" />
                Recommended Adjustments
              </h2>
            </div>

            <div className="grid gap-6">
              {diagnostics?.pivots.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/40 rounded-3xl bg-card/10 text-center">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-headline font-semibold mb-1">Optimization Complete</h3>
                  <p className="text-muted-foreground max-w-xs">No strategic pivots required. Your current behavioral workflow is optimal.</p>
                </div>
              ) : (
                diagnostics?.pivots.map((pivot) => (
                  <Card key={pivot.id} className="glass-card overflow-hidden group hover:border-primary/40 transition-all">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Badge className="bg-accent/20 text-accent border-none mb-2 capitalize">{pivot.category}</Badge>
                          <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors">{pivot.title}</CardTitle>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                          <pivot.icon className="w-6 h-6 text-accent group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed text-lg">{pivot.description}</p>
                        <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Impact Potential:</span>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px]">High</Badge>
                          </div>
                          <Link href="/modeler">
                            <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-primary/10 gap-1">
                              Apply Adjustment <ChevronRight className="w-3 h-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
