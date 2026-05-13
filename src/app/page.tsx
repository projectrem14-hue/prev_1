'use client';

import { useMemo, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/DataContext';
import { 
  Target, 
  Zap, 
  TrendingDown, 
  AlertCircle, 
  ArrowRight,
  Plus,
  BarChart3,
  Calendar,
  Activity
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

    const incompleteCategories: Record<string, number> = {};
    intentions.forEach(i => {
      const log = logs.find(l => l.intentionId === i.id);
      if (!log || !log.completed) {
        incompleteCategories[i.category] = (incompleteCategories[i.category] || 0) + 1;
      }
    });
    const topFriction = Object.entries(incompleteCategories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

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
      topFrictionCategory: topFriction,
      criticalDeviations: deviations,
    };
  }, [intentions, logs]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background text-foreground flex">
          <Navigation />
          <main className="flex-1 md:ml-64 p-6 lg:p-10 space-y-8">
            <Skeleton className="h-10 w-48 rounded-md" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </div>
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        
        <main className="flex-1 md:ml-64 p-6 lg:p-10">
          {intentions.length === 0 ? (
            <div className="max-w-3xl mx-auto py-20 text-center space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4">
                <BarChart3 className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight">
                Analyze your <span className="text-primary">behavioral consistency</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
                GapLogic tracks the distance between what you intend to do and what actually happens. To get started, create your first behavioral plan.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/modeler">
                  <Button size="lg" className="h-14 px-8 rounded-xl font-semibold gap-2">
                    Create Plan <Plus className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/sync">
                  <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl font-semibold gap-2" disabled>
                    Sync Activity <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1 className="text-3xl font-bold font-headline mb-1">Performance Dashboard</h1>
                  <p className="text-muted-foreground">Tracking consistency across your core intentions.</p>
                </div>
                <Link href="/sync">
                  <Button variant="outline" className="gap-2 rounded-lg border-primary/20 hover:bg-primary/5">
                    Sync Progress <Calendar className="w-4 h-4" />
                  </Button>
                </Link>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <Card className="pro-card stats-gradient">
                  <CardContent className="p-6">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Completion Rate</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-bold font-headline">{metrics?.intentionRate}%</h3>
                      <Target className="w-5 h-5 text-primary opacity-50 mb-1" />
                    </div>
                    <Progress value={metrics?.intentionRate} className="h-1.5 mt-4 bg-primary/10" />
                  </CardContent>
                </Card>
                
                <Card className="pro-card stats-gradient">
                  <CardContent className="p-6">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Consistency Streak</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-bold font-headline">{metrics?.streak} <span className="text-sm font-normal text-muted-foreground">Days</span></h3>
                      <Zap className="w-5 h-5 text-yellow-500 opacity-50 mb-1" />
                    </div>
                    <div className="flex gap-1 mt-4">
                      {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} className={cn("h-1 flex-1 rounded-full", i <= ((metrics?.streak || 0) % 8) ? "bg-primary" : "bg-primary/10")} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="pro-card stats-gradient">
                  <CardContent className="p-6">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Primary Friction</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-2xl font-bold font-headline capitalize truncate">{metrics?.topFrictionCategory}</h3>
                      <TrendingDown className="w-5 h-5 text-red-500 opacity-50 mb-1" />
                    </div>
                    <Badge variant="outline" className="mt-3 bg-red-500/5 text-red-500 border-red-500/20 text-[10px] uppercase font-bold">Optimization Needed</Badge>
                  </CardContent>
                </Card>

                <Card className="pro-card stats-gradient">
                  <CardContent className="p-6">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Unsynced Items</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-bold font-headline">{metrics?.criticalDeviations}</h3>
                      <AlertCircle className="w-5 h-5 text-muted-foreground opacity-50 mb-1" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-4 font-semibold uppercase">Needs reality sync</p>
                  </CardContent>
                </Card>
              </div>

              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold font-headline">Recent Activity</h2>
                </div>
                
                <div className="grid gap-3">
                  {[...intentions].slice(0, 5).map((item) => {
                    const log = logs.find(l => l.intentionId === item.id);
                    return (
                      <Card key={item.id} className="pro-card overflow-hidden">
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                              log ? (log.completed ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive") : "bg-muted text-muted-foreground"
                            )}>
                              <Target className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.category}</span>
                                <span className="text-[10px] text-muted-foreground">•</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.date}</span>
                              </div>
                              <h4 className="font-semibold text-sm">{item.title}</h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">Effort: {item.effortEstimate}/5</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">{item.scheduledTime}</p>
                            </div>
                            <Badge variant={log ? (log.completed ? "default" : "destructive") : "secondary"} className="text-[9px] font-bold uppercase py-1 px-3">
                              {log ? (log.completed ? "Completed" : "Missed") : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      </Card>
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