'use client';

import { useMemo, useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useData, PUBLIC_USER_ID } from '@/lib/DataContext';
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
  Loader2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Dashboard() {
  const { intentions, logs, loading } = useData();
  const db = useFirestore();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = "GapLogic | Dashboard";
  }, []);

  const handleSeedData = async () => {
    if (!db) {
      toast({ 
        variant: "destructive", 
        title: "Connection Error", 
        description: "Firebase is not initialized." 
      });
      return;
    }
    
    setSeeding(true);
    try {
      const sampleTitle = `Sample Audit - ${format(new Date(), 'HH:mm:ss')}`;
      await addIntention(db, PUBLIC_USER_ID, {
        title: sampleTitle,
        category: "work",
        effortEstimate: 4,
        estimatedDuration: 45,
        scheduledTime: format(new Date(), 'HH:mm'),
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      
      toast({ 
        title: "Data Pushed to Firebase", 
        description: "Verify in Firebase Console -> Firestore -> users -> default-user -> intentions." 
      });
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

  const sortedIntentions = useMemo(() => {
    return [...intentions].sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
  }, [intentions]);

  if (!mounted || loading) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation />
      
      <main className="flex-1 md:ml-64 p-6 lg:p-10 pb-20 max-w-6xl mx-auto w-full">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Firestore Live Sync</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="https://console.firebase.google.com/" target="_blank">
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest gap-2">
                <ExternalLink className="w-3 h-3" />
                Firebase Console
              </Button>
            </Link>
            <Link href="/sync">
              <Button className="h-11 px-6 gap-2 rounded-xl font-bold">
                <Calendar className="w-4 h-4" />
                Focus Session
              </Button>
            </Link>
          </div>
        </header>

        {/* Database Storage Verification HUD */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Cloud Firestore Data Audit</h4>
                <p className="text-xs text-muted-foreground">View real-time record counts from your Firebase Project.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-10">
              <div className="flex gap-10">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Intentions</p>
                  <p className="text-2xl font-bold text-primary">{intentions.length}</p>
                </div>
                <div className="text-center border-l pl-10">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Logs</p>
                  <p className="text-2xl font-bold text-primary">{logs.length}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-xl border-primary/30 font-bold gap-3 hover:bg-primary/5 min-w-[160px]"
                onClick={handleSeedData}
                disabled={seeding}
              >
                {seeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Push Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        {intentions.length === 0 && !seeding ? (
          <div className="py-20 text-center space-y-8 max-w-xl mx-auto border-2 border-dashed rounded-3xl bg-card/50">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
              <Target className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight">Database Connectivity Confirmed</h1>
              <p className="text-muted-foreground text-lg leading-relaxed px-6">
                Your Firestore database is active but empty. Use the <b>Push Sample</b> button above to send your first record to the cloud.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-10">
              <Link href="/modeler" className="flex-1">
                <Button className="h-14 w-full text-lg font-bold rounded-xl shadow-lg shadow-primary/10">Go to Modeler</Button>
              </Link>
              <Button variant="outline" className="h-14 flex-1 text-lg font-bold border-primary/20 rounded-xl" onClick={handleSeedData}>
                Push Sample
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <Card className="clean-card">
                <CardContent className="p-8">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Integrity Rate</p>
                  <div className="flex items-end justify-between mb-4">
                    <h3 className="text-4xl font-bold">{metrics?.intentionRate || 0}%</h3>
                    <Target className="w-6 h-6 text-primary opacity-40" />
                  </div>
                  <Progress value={metrics?.intentionRate || 0} className="h-2" />
                </CardContent>
              </Card>
              
              <Card className="clean-card">
                <CardContent className="p-8">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Current Streak</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-bold">{metrics?.streak || 0} Days</h3>
                    <Flame className="w-6 h-6 text-primary opacity-40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="clean-card">
                <CardContent className="p-8">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Pending Audit</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-bold">{metrics?.criticalDeviations || 0}</h3>
                    <AlertCircle className="w-6 h-6 text-muted-foreground opacity-40" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Activity className="w-6 h-6 text-primary" />
                  Live Activity Stream
                </h2>
                <Badge variant="outline" className="text-[10px] font-bold uppercase border-primary/20 text-primary h-7 px-4">
                  <RefreshCw className="w-3 h-3 mr-2 animate-spin-slow" />
                  Real-time
                </Badge>
              </div>
              
              <div className="grid gap-3">
                {sortedIntentions.slice(0, 5).map((item) => {
                  const log = logs.find(l => l.intentionId === item.id);
                  return (
                    <div key={item.id} className="clean-card p-5 flex items-center justify-between group hover:border-primary/20 transition-all cursor-default">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                          log ? (log.completed ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive") : "bg-secondary/50 text-muted-foreground"
                        )}>
                          <Target className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                            {item.category} • {format(new Date(item.date), 'MMM dd')} {item.scheduledTime ? `at ${item.scheduledTime}` : ''}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={cn(
                        "text-[10px] uppercase font-bold tracking-widest px-4 h-8 rounded-lg border-none",
                        log ? (log.completed ? "bg-emerald-500/20 text-emerald-500" : "bg-destructive/20 text-destructive") : "bg-muted text-muted-foreground"
                      )}>
                        {log ? (log.completed ? "Completed" : "Missed") : "Pending Session"}
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
  );
}
