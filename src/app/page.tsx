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
  PlusCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  BrainCircuit,
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
          <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12 space-y-8">
            <Skeleton className="h-12 w-64 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            </div>
            <Skeleton className="h-96 w-full rounded-3xl" />
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        
        <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12">
          {intentions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto">
              <div className="relative mb-12 animate-float">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                <div className="relative w-32 h-32 rounded-[2rem] bg-gradient-to-br from-primary via-secondary to-accent p-[1px]">
                  <div className="w-full h-full rounded-[1.95rem] bg-background flex items-center justify-center">
                    <BrainCircuit className="w-16 h-16 text-primary glow-text" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-headline font-bold mb-6 text-center leading-tight">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Behavioral Core</span> is Empty
              </h1>
              <p className="text-muted-foreground text-xl mb-12 text-center max-w-2xl leading-relaxed">
                GapLogic analyzes the dissonance between what you plan and what you actually do. To begin your audit, initialize your first behavioral stack.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <Card className="glass-panel group hover:bg-white/5 transition-all cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-primary">
                      <Target className="w-5 h-5" />
                      Phase 1: Modeler
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Define your ideal cognitive intentions for the day with precision.</p>
                    <Link href="/modeler">
                      <Button variant="outline" className="w-full gap-2 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        Initialize Stack <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="glass-panel group hover:bg-white/5 transition-all cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-accent">
                      <RefreshCw className="w-5 h-5" />
                      Phase 2: Reality Sync
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Log the actual outcomes to surface behavioral friction and leaks.</p>
                    <Link href="/sync">
                      <Button variant="outline" className="w-full gap-2 rounded-xl group-hover:bg-accent group-hover:text-accent-foreground transition-all" disabled>
                        Unlock after Modeler <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <>
              <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Neural Status: Active</span>
                  </div>
                  <h1 className="font-headline text-5xl font-bold tracking-tighter mb-2">Cognitive Command</h1>
                  <p className="text-muted-foreground text-lg">Real-time analysis of your behavioral fidelity.</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 rounded-xl flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    Optimizing Flow
                  </Badge>
                </div>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Card className="glass-panel hover:scale-[1.02] transition-transform duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Intention Fidelity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold font-headline mb-4">{metrics?.intentionRate}%</div>
                    <Progress value={metrics?.intentionRate} className="h-2 bg-white/5" />
                  </CardContent>
                </Card>
                
                <Card className="glass-panel hover:scale-[1.02] transition-transform duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent" />
                      Cognitive Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold font-headline mb-4">{metrics?.streak} <span className="text-sm font-normal text-muted-foreground">Days</span></div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= ((metrics?.streak || 0) % 8) ? "bg-accent shadow-[0_0_10px_rgba(6,182,212,0.5)]" : "bg-white/5")} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-panel hover:scale-[1.02] transition-transform duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-secondary" />
                      Friction Node
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold font-headline capitalize truncate mb-2">{metrics?.topFrictionCategory}</div>
                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 rounded-lg">High Leak Risk</Badge>
                  </CardContent>
                </Card>

                <Card className="glass-panel hover:scale-[1.02] transition-transform duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      Discrepancies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold font-headline mb-1 text-destructive">{metrics?.criticalDeviations}</div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Untracked intentions</p>
                  </CardContent>
                </Card>
              </div>

              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <h2 className="font-headline text-3xl font-bold tracking-tight">Recent Activity</h2>
                  </div>
                  <Link href="/sync">
                    <Button variant="ghost" className="hover:bg-primary/10 text-primary gap-2 font-bold rounded-xl">
                      <RefreshCw className="w-4 h-4" />
                      Sync Reality
                    </Button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {[...intentions].slice(0, 5).map((item) => {
                    const log = logs.find(l => l.intentionId === item.id);
                    return (
                      <div key={item.id} className="group glass-panel p-6 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                            log ? (log.completed ? "bg-primary/20 text-primary shadow-[0_0_20px_rgba(168,85,247,0.2)]" : "bg-destructive/20 text-destructive") : "bg-muted/30 text-muted-foreground"
                          )}>
                            <Target className="w-7 h-7" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-white/5 hover:bg-white/10 text-[10px] text-muted-foreground border-none px-2 py-0">
                                {item.category.toUpperCase()}
                              </Badge>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.date}</span>
                            </div>
                            <h4 className="font-headline font-bold text-xl group-hover:text-primary transition-colors">{item.title}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1.5 font-medium"><Activity className="w-3.5 h-3.5" /> Effort: {item.effortEstimate}</span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                              <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> {item.scheduledTime}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={cn(
                            "px-4 py-1.5 rounded-full font-bold border-none",
                            log ? (log.completed ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground") : "bg-muted text-muted-foreground"
                          )}>
                            {log ? (log.completed ? "COMPLETED" : "MISSED") : "PENDING"}
                          </Badge>
                          {log?.frictionNote && (
                            <div className="flex items-center gap-1.5 text-xs text-destructive font-medium max-w-[200px] truncate">
                              <AlertCircle className="w-3 h-3" />
                              Friction logged
                            </div>
                          )}
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