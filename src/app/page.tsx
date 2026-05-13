'use client';

import { useMemo, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/DataContext';
import { 
  Target, 
  TrendingDown, 
  AlertCircle, 
  Plus,
  Calendar,
  Activity,
  Flame
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { intentions, logs, loading } = useData();

  useEffect(() => {
    document.title = "GapLogic | Dashboard";
  }, []);

  const metrics = useMemo(() => {
    if (intentions.length === 0) return null;

    const completedLogs = logs.filter(l => l.completed).length;
    const rate = Math.round((completedLogs / intentions.length) * 100);

    const loggedIntentionIds = new Set(logs.map(l => l.intentionId));
    const deviations = intentions.filter(i => !loggedIntentionIds.has(i.id)).length;

    const dates = Array.from(new Set(intentions.map(i => i.date))).sort((a, b) => b.localeCompare(a));
    let currentStreak = 0;
    for (const date of dates) {
      const dayIntentions = intentions.filter(i => i.date === date);
      const dayLogs = logs.filter(l => l.date === date && l.completed);
      if (dayIntentions.length > 0 && dayLogs.length > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      intentionRate: rate,
      streak: currentStreak,
      criticalDeviations: deviations,
    };
  }, [intentions, logs]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex">
          <Navigation />
          <main className="flex-1 md:ml-64 p-6 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </div>
            <Skeleton className="h-96 w-full rounded-lg" />
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex">
        <Navigation />
        
        <main className="flex-1 md:ml-64 p-6 lg:p-10 pb-20">
          {intentions.length === 0 ? (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
              <h1 className="text-4xl font-bold tracking-tight">Welcome to GapLogic</h1>
              <p className="text-muted-foreground text-lg">
                Start by modeling your first behavioral intentions to begin the diagnostic process.
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Link href="/modeler">
                  <Button className="standard-button px-8">Establish First Intention</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <Link href="/sync">
                  <Button variant="outline" className="h-10 gap-2">
                    <Calendar className="w-4 h-4" />
                    Focus Session
                  </Button>
                </Link>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <Card className="clean-card">
                  <CardContent className="p-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Integrity Rate</p>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-3xl font-bold">{metrics?.intentionRate}%</h3>
                      <Target className="w-5 h-5 text-primary opacity-50" />
                    </div>
                    <Progress value={metrics?.intentionRate} className="h-1.5" />
                  </CardContent>
                </Card>
                
                <Card className="clean-card">
                  <CardContent className="p-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Streak</p>
                    <div className="flex items-center justify-between">
                      <h3 className="text-3xl font-bold">{metrics?.streak} Days</h3>
                      <Flame className="w-5 h-5 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="clean-card">
                  <CardContent className="p-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pending Sync</p>
                    <div className="flex items-center justify-between">
                      <h3 className="text-3xl font-bold">{metrics?.criticalDeviations}</h3>
                      <AlertCircle className="w-5 h-5 text-muted-foreground opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activity
                </h2>
                
                <div className="grid gap-3">
                  {[...intentions].slice(0, 5).map((item) => {
                    const log = logs.find(l => l.intentionId === item.id);
                    return (
                      <div key={item.id} className="clean-card p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            log ? (log.completed ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive") : "bg-secondary text-muted-foreground"
                          )}>
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.category} • {item.date}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn(
                          "text-[10px] uppercase font-bold tracking-widest px-3 border-none",
                          log ? (log.completed ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive") : "bg-secondary"
                        )}>
                          {log ? (log.completed ? "Completed" : "Missed") : "Pending"}
                        </Badge>
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