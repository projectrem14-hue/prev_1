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
  Zap, 
  TrendingDown, 
  AlertCircle, 
  ArrowRight,
  Plus,
  BarChart3,
  Calendar,
  Activity,
  ShieldCheck,
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

    const incompleteCategories: Record<string, number> = {};
    intentions.forEach(i => {
      const log = logs.find(l => l.intentionId === i.id);
      if (!log || !log.completed) {
        incompleteCategories[i.category] = (incompleteCategories[i.category] || 0) + 1;
      }
    });
    const topFriction = Object.entries(incompleteCategories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Optimized';

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
            <Skeleton className="h-12 w-64 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            </div>
            <Skeleton className="h-[500px] w-full rounded-2xl" />
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        
        <main className="flex-1 md:ml-64 p-6 lg:p-10 pb-24 md:pb-10">
          {intentions.length === 0 ? (
            <div className="max-w-4xl mx-auto py-24 text-center space-y-12">
              <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-primary/10 mb-4 animate-float">
                <ShieldCheck className="w-14 h-14 text-primary" />
                <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-50" />
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold font-headline leading-tight tracking-tight">
                  Master your <span className="text-primary italic">consistency</span>
                </h1>
                <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl mx-auto">
                  GapLogic is a high-performance audit tool for behavioral integrity. Start your first session to begin the diagnostic process.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <Link href="/modeler">
                  <Button size="lg" className="h-16 px-10 rounded-2xl font-bold text-lg gap-3 shadow-2xl shadow-primary/30">
                    Model First Intentions <Plus className="w-6 h-6" />
                  </Button>
                </Link>
                <Link href="/sync">
                  <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl font-bold text-lg gap-3 border-white/10 hover:bg-white/5">
                    Sync Activity <ArrowRight className="w-6 h-6" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                  <h1 className="text-4xl font-bold font-headline tracking-tight">Behavioral Control</h1>
                  <p className="text-muted-foreground text-lg">Real-time audit of your cognitive execution.</p>
                </div>
                <Link href="/sync">
                  <Button variant="outline" className="h-12 gap-3 rounded-xl border-white/10 hover:bg-white/5 px-6 font-bold">
                    <Calendar className="w-4 h-4 text-primary" />
                    Sync Reality
                  </Button>
                </Link>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Card className="pro-card stats-gradient glass-card overflow-hidden">
                  <CardContent className="p-8">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Integrity Score</p>
                    <div className="flex items-end justify-between mb-4">
                      <h3 className="text-4xl font-bold font-headline tracking-tighter">{metrics?.intentionRate}%</h3>
                      <Target className="w-6 h-6 text-primary opacity-40" />
                    </div>
                    <Progress value={metrics?.intentionRate} className="h-2 bg-white/5" />
                  </CardContent>
                </Card>
                
                <Card className="pro-card stats-gradient glass-card">
                  <CardContent className="p-8">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Live Streak</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-4xl font-bold font-headline tracking-tighter">{metrics?.streak} <span className="text-base font-medium text-muted-foreground/60 ml-1">Days</span></h3>
                      <Flame className={cn("w-6 h-6 opacity-40", (metrics?.streak || 0) > 0 ? "text-orange-500" : "text-muted-foreground")} />
                    </div>
                    <div className="flex gap-1.5 mt-6">
                      {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", i <= ((metrics?.streak || 0) % 8) ? "bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-white/5")} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="pro-card stats-gradient glass-card">
                  <CardContent className="p-8">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Primary Leak</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-2xl font-bold font-headline capitalize truncate tracking-tight">{metrics?.topFrictionCategory}</h3>
                      <TrendingDown className="w-6 h-6 text-destructive opacity-40" />
                    </div>
                    <Badge variant="outline" className={cn("mt-6 border-none px-3 py-1 text-[10px] uppercase font-bold tracking-widest", metrics?.topFrictionCategory === 'Optimized' ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive")}>
                      {metrics?.topFrictionCategory === 'Optimized' ? 'Zero Friction' : 'Action Required'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="pro-card stats-gradient glass-card">
                  <CardContent className="p-8">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Awaiting Sync</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-4xl font-bold font-headline tracking-tighter">{metrics?.criticalDeviations}</h3>
                      <AlertCircle className="w-6 h-6 text-muted-foreground opacity-40" />
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-6 font-bold uppercase tracking-widest">Incomplete History</p>
                  </CardContent>
                </Card>
              </div>

              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold font-headline tracking-tight">Timeline Log</h2>
                  </div>
                  <Link href="/modeler">
                    <Button variant="ghost" className="text-xs font-bold text-primary uppercase tracking-widest hover:bg-primary/5">
                      View Full Stack <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                </div>
                
                <div className="grid gap-4">
                  {[...intentions].slice(0, 6).map((item) => {
                    const log = logs.find(l => l.intentionId === item.id);
                    return (
                      <Card key={item.id} className="pro-card glass-card group transition-all duration-300">
                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner",
                              log ? (log.completed ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive") : "bg-white/5 text-muted-foreground"
                            )}>
                              <Target className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1.5">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{item.category}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{item.date}</span>
                              </div>
                              <h4 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">{item.title}</h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right hidden sm:block space-y-1">
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Effort: {item.effortEstimate}/5</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{item.scheduledTime}</p>
                            </div>
                            <Badge 
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 border-none",
                                log ? (log.completed ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive") : "bg-white/5 text-muted-foreground"
                              )}
                            >
                              {log ? (log.completed ? "Verified" : "Breached") : "Pending"}
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
