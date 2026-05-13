'use client';

import { useState, useEffect, useMemo } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { TrendingUp, Target, Brain, ShieldAlert, History, Filter, LayoutDashboard } from 'lucide-react';
import { getAllIntentions, getAllRealityLogs } from '@/lib/firestore';
import { Intention, RealityLog } from '@/lib/schema';
import { format, subDays, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import Link from 'next/link';

export default function Insights() {
  const [loading, setLoading] = useState(true);
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [logs, setLogs] = useState<RealityLog[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [allIntentions, allLogs] = await Promise.all([
          getAllIntentions(),
          getAllRealityLogs()
        ]);
        setIntentions(allIntentions);
        setLogs(allLogs);
      } catch (error) {
        console.error("Error fetching insights data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (intentions.length === 0) return null;

    const totalIntentions = intentions.length;
    const completedLogs = logs.filter(l => l.completed).length;
    const overallRate = Math.round((completedLogs / totalIntentions) * 100);

    const categories = ['health', 'work', 'learning', 'personal'] as const;
    const catStats = categories.map(cat => {
      const catIntentions = intentions.filter(i => i.category === cat);
      const catCompleted = logs.filter(l => {
        const intention = intentions.find(i => i.id === l.intentionId);
        return intention?.category === cat && l.completed;
      }).length;
      const efficiency = catIntentions.length > 0 ? (catCompleted / catIntentions.length) * 100 : 0;
      return { cat, efficiency };
    });

    const best = [...catStats].sort((a, b) => b.efficiency - a.efficiency)[0];
    const worst = [...catStats].sort((a, b) => a.efficiency - b.efficiency)[0];

    return {
      totalIntentions,
      overallRate,
      best: best.efficiency > 0 ? best.cat : 'N/A',
      worst: worst.efficiency < 100 ? worst.cat : 'N/A'
    };
  }, [intentions, logs]);

  const dailyTrendData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return last7Days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayIntentions = intentions.filter(i => i.date === dateStr);
      const dayLogs = logs.filter(l => l.date === dateStr);
      
      const completed = dayLogs.filter(l => l.completed).length;
      const rate = dayIntentions.length > 0 ? Math.round((completed / dayIntentions.length) * 100) : 0;
      const incompleteCount = dayIntentions.length - completed;

      return {
        name: format(day, 'MMM dd'),
        rate,
        incomplete: incompleteCount
      };
    });
  }, [intentions, logs]);

  const categoryEfficiency = useMemo(() => {
    const categories = ['health', 'work', 'learning', 'personal'] as const;
    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--secondary))',
      'hsl(var(--accent))',
      'hsl(var(--chart-4))'
    ];

    return categories.map((cat, i) => {
      const catIntentions = intentions.filter(i => i.category === cat);
      const catCompleted = logs.filter(l => {
        const intention = intentions.find(i => i.id === l.intentionId);
        return intention?.category === cat && l.completed;
      }).length;
      const efficiency = catIntentions.length > 0 ? Math.round((catCompleted / catIntentions.length) * 100) : 0;
      return {
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        efficiency,
        color: colors[i]
      };
    });
  }, [intentions, logs]);

  const radarData = useMemo(() => {
    const categories = ['health', 'work', 'learning', 'personal'] as const;
    return categories.map(cat => {
      const catIntentions = intentions.filter(i => i.category === cat);
      const catLogs = logs.filter(l => {
        const intention = intentions.find(i => i.id === l.intentionId);
        return intention?.category === cat;
      });

      const avgEstimate = catIntentions.length > 0 
        ? catIntentions.reduce((acc, i) => acc + i.effortEstimate, 0) / catIntentions.length 
        : 0;
      
      const avgActual = catLogs.length > 0
        ? catLogs.reduce((acc, l) => acc + l.actualEffort, 0) / catLogs.length
        : 0;

      return {
        subject: cat.charAt(0).toUpperCase() + cat.slice(1),
        intended: avgEstimate * 20, // scale to 100
        actual: avgActual * 20, // scale to 100
        fullMark: 100,
      };
    });
  }, [intentions, logs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        <main className="flex-1 ml-64 p-8 lg:p-12">
          <div className="space-y-4 mb-10">
            <Skeleton className="h-12 w-[400px]" />
            <Skeleton className="h-6 w-[300px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
        </main>
      </div>
    );
  }

  // Check if we have at least 3 days of data to show meaningful insights
  const uniqueDates = new Set(intentions.map(i => i.date));
  if (uniqueDates.size < 3) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        <main className="flex-1 ml-64 p-8 lg:p-12 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <TrendingUp className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-headline font-bold mb-4">Insufficient Data for Analysis</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Your insights will appear after you log at least 3 days of data. Keep modeling and syncing your reality to unlock behavioral vectors.
          </p>
          <Link href="/modeler">
            <Button size="lg" className="rounded-2xl gap-2 font-bold px-8">
              <Target className="w-5 h-5" />
              Build Your Plan
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Behavioral Insights</h1>
            <p className="text-muted-foreground text-lg">Long-term analysis of your cognitive alignment and consistency vectors.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl border-border/40 gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button className="rounded-xl gap-2">
              <History className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </header>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card className="glass-card p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Intentions</p>
            <div className="text-3xl font-bold font-headline">{stats?.totalIntentions}</div>
          </Card>
          <Card className="glass-card p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Avg Compliance</p>
            <div className="text-3xl font-bold font-headline">{stats?.overallRate}%</div>
          </Card>
          <Card className="glass-card p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Best Focus</p>
            <div className="text-3xl font-bold font-headline capitalize text-primary">{stats?.best}</div>
          </Card>
          <Card className="glass-card p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">High Friction</p>
            <div className="text-3xl font-bold font-headline capitalize text-destructive">{stats?.worst}</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Consistency Trend */}
          <Card className="lg:col-span-8 glass-card border-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Consistency Growth
                  </CardTitle>
                  <CardDescription>Correlation between planned intentions and execution quality over the last 7 days.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrendData}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRate)" strokeWidth={3} name="Intention Rate %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Effort Balance Radar */}
          <Card className="lg:col-span-4 glass-card border-none">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Brain className="w-6 h-6 text-accent" />
                Effort Alignment
              </CardTitle>
              <CardDescription>Intended vs actual energy expenditure across pillars.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                  <Radar
                    name="Intended Effort"
                    dataKey="intended"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Actual Effort"
                    dataKey="actual"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.5}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
          {/* Efficiency by Category */}
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Target className="w-6 h-6 text-secondary" />
                Category Efficiency
              </CardTitle>
              <CardDescription>Completion compliance percentages per behavioral pillar.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryEfficiency} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--foreground))', fontWeight: 600}} width={100} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="efficiency" radius={[0, 8, 8, 0]} barSize={32} name="Completion Rate %">
                    {categoryEfficiency.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Friction Frequency */}
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-destructive" />
                Friction Leak Pattern
              </CardTitle>
              <CardDescription>Frequency of incomplete intentions over the last week.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="incomplete" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} name="Missed Intentions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
