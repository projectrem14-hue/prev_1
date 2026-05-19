'use client';

import { useEffect, useMemo } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/lib/DataContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { 
  TrendingUp, 
  Brain, 
  ShieldAlert, 
  Lightbulb, 
  Zap, 
  AlertCircle,
  ArrowRightCircle
} from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import Link from 'link';

export default function Analysis() {
  const { intentions, logs, loading } = useData();

  useEffect(() => {
    document.title = "GapLogic — Analysis Portal";
  }, []);

  // Chart Data Logic
  const dailyTrend = useMemo(() => {
    return eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() }).map(day => {
      const d = format(day, 'yyyy-MM-dd');
      const dayInt = intentions.filter(i => i.date === d);
      const dayDone = logs.filter(l => l.date === d && l.completed);
      return { 
        name: format(day, 'MMM dd'), 
        rate: dayInt.length > 0 ? Math.round((dayDone.length / dayInt.length) * 100) : 0 
      };
    });
  }, [intentions, logs]);

  // Diagnostic Pattern Logic
  const diagnostics = useMemo(() => {
    if (logs.length < 1) return null;
    const gaps: any[] = [];
    const pivots: any[] = [];

    // Diagnostic Logic for Willpower Leakage
    const lateHealth = logs.filter(l => {
      const intention = intentions.find(i => i.id === l.intentionId);
      if (!intention || intention.category !== 'health') return false;
      const hour = parseInt(intention.scheduledTime.split(':')[0]);
      return hour >= 20 && !l.completed;
    });
    if (lateHealth.length >= 2) {
      gaps.push({ text: "Willpower Leakage: Health habits after 8PM consistently fail.", category: 'health' });
      pivots.push({ text: "Reschedule health habits before 7PM to ensure compliance.", category: 'health' });
    }

    // Diagnostic Logic for Estimation Bias
    const heavyWork = logs.filter(l => {
      const intention = intentions.find(i => i.id === l.intentionId);
      return intention && intention.category === 'work' && intention.effortEstimate > 3 && !l.completed;
    });
    if (heavyWork.length >= 2) {
      gaps.push({ text: "Estimation Bias: High-effort work tasks (4+) are stalling.", category: 'work' });
      pivots.push({ text: "Break large work sessions into sub-tasks with effort < 3.", category: 'work' });
    }

    const totalLogs = logs.length;
    const completionRate = totalLogs > 0 ? logs.filter(l => l.completed).length / totalLogs : 0;
    const score = Math.round(completionRate * 100);

    return { gaps, pivots, score, total: totalLogs };
  }, [intentions, logs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12"><Skeleton className="h-full w-full rounded-3xl" /></main>
      </div>
    );
  }

  const hasEnoughData = logs.length >= 5;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12">
        {!hasEnoughData ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <ShieldAlert className="w-16 h-16 text-primary mb-6" />
            <h2 className="text-3xl font-bold mb-4">Awaiting Behavioral Data</h2>
            <p className="text-muted-foreground mb-8">
              Analysis requires at least 5 focus sessions to identify patterns and generate insights. You currently have {logs.length}/5.
            </p>
            <Progress value={(logs.length / 5) * 100} className="w-full h-3 mb-10" />
            <Link href="/sync">
              <Button size="lg" className="rounded-xl px-12 h-14 font-bold">Start Focus Session</Button>
            </Link>
          </div>
        ) : (
          <>
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Behavioral Analysis</h1>
                <p className="text-muted-foreground text-lg">Integrated trends and diagnostic patterns.</p>
              </div>
              <div className="flex items-center gap-4">
                <Card className="clean-card px-6 py-3 flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Integrity Score</p>
                    <p className="text-2xl font-bold">{diagnostics?.score}%</p>
                  </div>
                  <Zap className="w-6 h-6 text-primary" />
                </Card>
              </div>
            </header>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <Card className="clean-card">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> 
                    Integrity Growth
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrend}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fill="url(#colorRate)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="clean-card">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" /> 
                    Consistency Volume
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Diagnostics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-destructive">
                  <ShieldAlert className="w-6 h-6" /> Behavioral Gaps
                </h2>
                <div className="grid gap-4">
                  {diagnostics?.gaps.length === 0 ? (
                    <div className="p-10 border-2 border-dashed rounded-2xl text-center text-muted-foreground">
                      No significant leaks detected.
                    </div>
                  ) : (
                    diagnostics?.gaps.map((gap, i) => (
                      <Card key={i} className="clean-card border-l-4 border-l-destructive p-5 flex gap-4">
                        <div className="pt-1"><AlertCircle className="w-5 h-5 text-destructive" /></div>
                        <div>
                          <Badge variant="outline" className="mb-2 capitalize">{gap.category}</Badge>
                          <p className="text-sm leading-relaxed">{gap.text}</p>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-accent">
                  <Lightbulb className="w-6 h-6" /> Strategic Pivots
                </h2>
                <div className="grid gap-4">
                  {diagnostics?.pivots.length === 0 ? (
                    <div className="p-10 border-2 border-dashed rounded-2xl text-center text-muted-foreground">
                      Keep logging to unlock pivots.
                    </div>
                  ) : (
                    diagnostics?.pivots.map((pivot, i) => (
                      <Card key={i} className="clean-card border-l-4 border-l-accent p-5 flex gap-4">
                        <div className="pt-1"><ArrowRightCircle className="w-5 h-5 text-accent" /></div>
                        <div>
                          <Badge className="mb-2 capitalize bg-accent/10 text-accent border-none">{pivot.category}</Badge>
                          <p className="text-sm leading-relaxed">{pivot.text}</p>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
