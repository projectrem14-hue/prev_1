
'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { 
  Target, 
  Zap, 
  TrendingDown, 
  AlertCircle, 
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { getAllIntentions, getAllRealityLogs } from '@/lib/firestore';
import { Intention, RealityLog } from '@/lib/schema';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { toast } = useToast();
  const db = useFirestore();
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
    document.title = "GapLogic — Dashboard";
    async function fetchData() {
      if (!db) return;
      try {
        const [allIntentions, allLogs] = await Promise.all([
          getAllIntentions(db),
          getAllRealityLogs(db)
        ]);

        setIntentions(allIntentions);
        setLogs(allLogs);

        if (allIntentions.length > 0) {
          const completedLogs = allLogs.filter(l => l.completed).length;
          const rate = Math.round((completedLogs / allIntentions.length) * 100);

          const loggedIntentionIds = new Set(allLogs.map(l => l.intentionId));
          const deviations = allIntentions.filter(i => !loggedIntentionIds.has(i.id)).length;

          const incompleteCategories: Record<string, number> = {};
          allIntentions.forEach(i => {
            const log = allLogs.find(l => l.intentionId === i.id);
            if (!log || !log.completed) {
              incompleteCategories[i.category] = (incompleteCategories[i.category] || 0) + 1;
            }
          });
          const topFriction = Object.entries(incompleteCategories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

          const dates = Array.from(new Set(allIntentions.map(i => i.date))).sort((a, b) => b.localeCompare(a));
          let currentStreak = 0;
          for (const date of dates) {
            const dayIntentions = allIntentions.filter(i => i.date === date);
            const dayLogs = allLogs.filter(l => l.date === date && l.completed);
            if (dayIntentions.length > 0 && (dayLogs.length / dayIntentions.length) >= 0.5) {
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
        toast({
          variant: "destructive",
          title: "Data Load Error",
          description: "Failed to load dashboard data. Check your connection.",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [toast, db]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12">
          <div className="space-y-4 mb-10">
            <Skeleton className="h-12 w-[300px]" />
            <Skeleton className="h-6 w-[400px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <Skeleton className="h-[400px] w-full rounded-3xl" />
        </main>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        
        <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12">
          {intentions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-headline font-bold mb-3">No data yet</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Start by adding intentions in the Modeler to see your behavioral diagnostics come to life.
              </p>
              <Link href="/modeler">
                <Button size="lg" className="rounded-2xl gap-2 font-bold px-10 h-14 bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                  <PlusCircle className="w-5 h-5" />
                  Go to Modeler
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Cognitive Dashboard</h1>
                  <p className="text-muted-foreground text-lg">Visualizing the gap between your intentions and reality.</p>
                </div>
                <Badge variant="outline" className="px-4 py-1.5 rounded-full border-border/40 bg-card/30 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Live Analytics
                </Badge>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Intention Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold font-headline">{metrics.intentionRate}%</div>
                    <Progress value={metrics.intentionRate} className="h-1.5 mt-4" />
                  </CardContent>
                </Card>
                
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent" />
                      Current Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold font-headline">{metrics.streak} Days</div>
                    <div className="flex gap-1 mt-4">
                      {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= (metrics.streak % 8) ? "bg-accent" : "bg-muted")} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-secondary" />
                      Top Friction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold font-headline capitalize truncate">{metrics.topFrictionCategory}</div>
                    <Badge variant="secondary" className="mt-4 bg-secondary/10 text-secondary border-none">Primary Leak Point</Badge>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      Deviations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold font-headline">{metrics.criticalDeviations}</div>
                    <p className="text-xs text-muted-foreground mt-4">Intentions never logged</p>
                  </CardContent>
                </Card>
              </div>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-headline text-2xl font-bold">Recent Activity</h2>
                  <Link href="/sync">
                    <Button variant="ghost" className="text-primary hover:bg-primary/10 gap-2 font-bold">
                      <RefreshCw className="w-4 h-4" />
                      Sync Reality
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {[...intentions].slice(0, 5).map((item) => {
                    const log = logs.find(l => l.intentionId === item.id);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-card/40 border border-border/40 hover:bg-card/60 transition-all group glass-card border-none">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Target className={cn("w-6 h-6", log?.completed ? "text-primary" : "text-muted-foreground")} />
                          </div>
                          <div>
                            <h4 className="font-headline font-semibold text-lg">{item.title}</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className={cn("w-1.5 h-1.5 rounded-full", log ? (log.completed ? "bg-primary" : "bg-destructive") : "bg-muted-foreground/40")} />
                              {item.category} • {item.scheduledTime}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <Badge variant="outline" className={cn(
                            "border-none px-3 py-1",
                            log ? (log.completed ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive") : "bg-muted/30 text-muted-foreground"
                          )}>
                            {log ? (log.completed ? "Completed" : "Missed") : "No Log"}
                          </Badge>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
