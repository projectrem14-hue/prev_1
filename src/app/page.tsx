
'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { ArrowUpRight, TrendingDown, Target, Zap, AlertCircle, PlusCircle } from 'lucide-react';
import { getAllIntentions, getAllRealityLogs } from '@/lib/firestore';
import { Intention, RealityLog } from '@/lib/schema';
import Link from 'next/link';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [logs, setLogs] = useState<RealityLog[]>([]);
  const [metrics, setMetrics] = useState({
    intentionRate: 0,
    streak: 0,
    topFrictionCategory: 'None',
    criticalDeviations: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [allIntentions, allLogs] = await Promise.all([
          getAllIntentions(),
          getAllRealityLogs()
        ]);

        setIntentions(allIntentions);
        setLogs(allLogs);

        if (allIntentions.length > 0) {
          // 1. Intention Rate
          const completedLogs = allLogs.filter(l => l.completed).length;
          const rate = Math.round((completedLogs / allIntentions.length) * 100);

          // 2. Critical Deviations (Intentions with no log at all)
          const loggedIntentionIds = new Set(allLogs.map(l => l.intentionId));
          const deviations = allIntentions.filter(i => !loggedIntentionIds.has(i.id)).length;

          // 3. Top Friction Category (Categories of incomplete tasks)
          const incompleteCategories: Record<string, number> = {};
          allIntentions.forEach(i => {
            const log = allLogs.find(l => l.intentionId === i.id);
            if (!log || !log.completed) {
              incompleteCategories[i.category] = (incompleteCategories[i.category] || 0) + 1;
            }
          });
          const topFriction = Object.entries(incompleteCategories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

          // 4. Streak Calculation
          const logsByDate: Record<string, RealityLog[]> = {};
          allLogs.forEach(l => {
            if (!logsByDate[l.date]) logsByDate[l.date] = [];
            logsByDate[l.date].push(l);
          });

          const intentionsByDate: Record<string, Intention[]> = {};
          allIntentions.forEach(i => {
            if (!intentionsByDate[i.date]) intentionsByDate[i.date] = [];
            intentionsByDate[i.date].push(i);
          });

          const uniqueDates = Array.from(new Set([...Object.keys(logsByDate), ...Object.keys(intentionsByDate)])).sort((a, b) => b.localeCompare(a));
          
          let currentStreak = 0;
          for (const date of uniqueDates) {
            const dayIntentions = intentionsByDate[date] || [];
            const dayLogs = logsByDate[date] || [];
            if (dayIntentions.length === 0) continue;
            
            const dayCompleted = dayLogs.filter(l => l.completed).length;
            const dayRate = (dayCompleted / dayIntentions.length) * 100;
            
            if (dayRate >= 50) {
              currentStreak++;
            } else {
              break;
            }
          }

          setMetrics({
            intentionRate: rate,
            streak: currentStreak,
            topFrictionCategory: topFriction,
            criticalDeviations: deviations,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        <main className="flex-1 ml-64 p-8 lg:p-12">
          <div className="space-y-4 mb-10">
            <Skeleton className="h-12 w-[300px]" />
            <Skeleton className="h-6 w-[400px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </main>
      </div>
    );
  }

  if (intentions.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        <main className="flex-1 ml-64 p-8 lg:p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-headline font-bold mb-2">No data yet</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Start by adding intentions in the Modeler to see your behavioral diagnostics come to life.
          </p>
          <Link href="/modeler">
            <Button size="lg" className="rounded-2xl gap-2 font-bold px-8">
              <PlusCircle className="w-5 h-5" />
              Go to Modeler
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  // Get last 5 intentions for Recent Activity
  const recentIntentions = [...intentions].slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Cognitive Dashboard</h1>
            <p className="text-muted-foreground text-lg">Visualizing the gap between your intentions and reality.</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-border/40 bg-card/30">
              Live Feed
            </Badge>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Intention Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline">{metrics.intentionRate}%</div>
              <Progress value={metrics.intentionRate} className="h-1.5 mt-4" />
              <p className="text-xs text-muted-foreground mt-2">Overall completion compliance</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline">{metrics.streak} Days</div>
              <div className="flex gap-1 mt-4">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= (metrics.streak % 8) ? 'bg-accent' : 'bg-muted'}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Days with &gt;50% compliance</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-secondary" />
                Top Friction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline capitalize">{metrics.topFrictionCategory}</div>
              <Badge variant="secondary" className="mt-4 bg-secondary/10 text-secondary border-none">
                Primary Leak Point
              </Badge>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                Critical Deviations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline">{metrics.criticalDeviations}</div>
              <p className="text-xs text-muted-foreground mt-4">Intentions completely ignored</p>
            </CardContent>
          </Card>
        </div>

        <section className="pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-2xl font-bold">Recent Activity</h2>
            <Link href="/sync">
              <Badge className="bg-primary/20 text-primary border-none hover:bg-primary/30 cursor-pointer">Sync Reality Logs</Badge>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {recentIntentions.map((item) => {
              const log = logs.find(l => l.intentionId === item.id);
              let statusText = "No Log Yet";
              let statusColor = "bg-muted-foreground/20 text-muted-foreground";
              let dotColor = "bg-muted-foreground/40";

              if (log) {
                if (log.completed) {
                  statusText = "Completed";
                  statusColor = "bg-primary/20 text-primary";
                  dotColor = "bg-primary";
                } else {
                  statusText = "Missed";
                  statusColor = "bg-destructive/20 text-destructive";
                  dotColor = "bg-destructive";
                }
              }

              return (
                <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-card/40 border border-border/40 hover:bg-card/60 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Target className={`w-5 h-5 ${log?.completed ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className={`w-1 h-1 rounded-full ${dotColor}`} />
                        {item.category} • Scheduled: {item.scheduledTime}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={`mb-1 border-none ${statusColor}`}>{statusText}</Badge>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
