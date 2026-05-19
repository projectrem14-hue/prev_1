'use client';

import { useMemo, useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useData } from '@/lib/DataContext';
import { useAuth } from '@/lib/AuthContext';
import { useFirestore } from '@/firebase';
import { addIntention } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { 
  Target, 
  AlertCircle, 
  Calendar,
  Activity,
  Flame,
  Database,
  Send,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Dashboard() {
  const { intentions, logs, loading } = useData();
  const { user } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = "GapLogic | Dashboard";
  }, []);

  const handleSeedData = async () => {
    if (!db || !user) return;
    setSeeding(true);
    try {
      await addIntention(db, user.uid, {
        title: "Sample High-Performance Audit",
        category: "work",
        effortEstimate: 4,
        estimatedDuration: 45,
        scheduledTime: "09:00",
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      toast({ title: "Sample Pushed", description: "Firestore record created successfully." });
    } catch (e) {
      // Handled by global listener
    } finally {
      setSeeding(false);
    }
  };

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

  if (!mounted || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex">
          <Navigation />
          <main className="flex-1 md:ml-64 p-6 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex">
        <Navigation />
        
        <main className="flex-1 md:ml-64 p-6 lg:p-10 pb-20 max-w-6xl mx-auto w-full">
          {intentions.length === 0 && !seeding ? (
            <div className="py-20 text-center space-y-8 max-w-xl mx-auto">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Your Audit Begins Here</h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  GapLogic helps you analyze behavioral leaks by comparing your plans to your reality. Establish your first set of intentions to start.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/modeler">
                  <Button className="h-14 px-10 text-lg font-bold w-full sm:w-auto">Establish First Intention</Button>
                </Link>
                <Button variant="outline" className="h-14 px-10 text-lg font-bold border-primary/20" onClick={handleSeedData}>
                  Push Sample Data
                </Button>
              </div>
            </div>
          ) : (
            <>
              <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Database Connected: Live</span>
                  </div>
                </div>
                <Link href="/sync">
                  <Button variant="outline" className="h-11 px-6 gap-2 border-primary/20 hover:bg-primary/5">
                    <Calendar className="w-4 h-4" />
                    Enter Focus Session
                  </Button>
                </Link>
              </header>

              {/* Database Storage Verification HUD */}
              <Card className="mb-8 border-primary/20 bg-primary/5 overflow-hidden">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Cloud Storage Verification</h4>
                      <p className="text-xs text-muted-foreground">Verifying live records in Cloud Firestore.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Intentions</p>
                        <p className="text-xl font-bold text-primary">{intentions.length}</p>
                      </div>
                      <div className="text-center border-l pl-6">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Reality Logs</p>
                        <p className="text-xl font-bold text-primary">{logs.length}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary font-bold gap-2 hover:bg-primary/10"
                      onClick={handleSeedData}
                      disabled={seeding}
                    >
                      {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Push Sample
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                <Card className="clean-card shadow-sm">
                  <CardContent className="p-8">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Integrity Rate</p>
                    <div className="flex items-end justify-between mb-4">
                      <h3 className="text-4xl font-bold">{metrics?.intentionRate || 0}%</h3>
                      <Target className="w-6 h-6 text-primary opacity-40" />
                    </div>
                    <Progress value={metrics?.intentionRate || 0} className="h-2" />
                  </CardContent>
                </Card>
                
                <Card className="clean-card shadow-sm">
                  <CardContent className="p-8">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Current Streak</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-4xl font-bold">{metrics?.streak || 0} Days</h3>
                      <Flame className="w-6 h-6 text-primary opacity-40" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="clean-card shadow-sm">
                  <CardContent className="p-8">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Pending Sync</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-4xl font-bold">{metrics?.criticalDeviations || 0}</h3>
                      <AlertCircle className="w-6 h-6 text-muted-foreground opacity-40" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Activity className="w-6 h-6 text-primary" />
                  Behavioral Activity
                </h2>
                
                <div className="space-y-3">
                  {[...intentions].slice(0, 5).map((item) => {
                    const log = logs.find(l => l.intentionId === item.id);
                    return (
                      <div key={item.id} className="clean-card p-5 flex items-center justify-between border-transparent hover:border-primary/10 transition-colors">
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            log ? (log.completed ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive") : "bg-secondary text-muted-foreground"
                          )}>
                            <Target className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{item.category} • {item.date}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn(
                          "text-[10px] uppercase font-bold tracking-widest px-4 h-7 border-none",
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
