'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigation } from '@/components/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useAuth } from '@/lib/AuthContext';
import { 
  CheckCircle2, 
  XCircle,
  Play, 
  Pause, 
  RotateCcw,
  Timer,
  BrainCircuit,
  Save,
  Loader2,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { addRealityLog, getRealityLogsByDate, getIntentionsByDate } from '@/lib/firestore';
import { Intention, RealityLog } from '@/lib/schema';
import { format } from 'date-fns';
import Link from 'next/link';

export default function FocusTimer() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [loading, setLoading] = useState(true);
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [logs, setLogs] = useState<RealityLog[]>([]);
  const [activeIntention, setActiveIntention] = useState<Intention | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [feedback, setFeedback] = useState({
    completed: true,
    actualEffort: 3,
    frictionNote: '',
    contextNote: '',
  });

  const fetchData = useCallback(async () => {
    if (!db || !user) return;
    setLoading(true);
    try {
      const [fetchedIntentions, fetchedLogs] = await Promise.all([
        getIntentionsByDate(db, user.uid, today),
        getRealityLogsByDate(db, user.uid, today)
      ]);
      setIntentions(fetchedIntentions);
      setLogs(fetchedLogs);
    } catch (error) {
      toast({ variant: "destructive", title: "Load Error", description: "Failed to load intentions." });
    } finally {
      setLoading(false);
    }
  }, [toast, db, user, today]);

  useEffect(() => {
    document.title = "GapLogic — Focus Session";
    if (db && user) fetchData();
  }, [fetchData, db, user]);

  useEffect(() => {
    if (!isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && activeIntention && !isPaused) {
      handleSessionEnd();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, timeLeft, activeIntention]);

  const startSession = (intention: Intention) => {
    setActiveIntention(intention);
    setTimeLeft((intention.estimatedDuration || 25) * 60);
    setIsPaused(false);
    setIsCompleted(false);
    setFeedback(prev => ({ ...prev, actualEffort: intention.effortEstimate }));
    toast({ title: "Session Started", description: `Focusing on: ${intention.title}` });
  };

  const handleSessionEnd = () => {
    setIsPaused(true);
    setIsCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    toast({ title: "Time's Up!", description: "Record your actual behavioral data below." });
  };

  const handleSaveReality = async () => {
    if (!db || !user || !activeIntention) return;
    setSubmitting(true);
    try {
      await addRealityLog(db, user.uid, {
        intentionId: activeIntention.id,
        completed: feedback.completed,
        actualEffort: feedback.actualEffort,
        frictionNote: feedback.frictionNote,
        contextNote: feedback.contextNote,
        date: today,
      });

      toast({ title: "Reality Synced", description: "Your behavioral data has been saved." });
      setActiveIntention(null);
      setIsCompleted(false);
      fetchData();
    } catch (error) {
      // Handled centrally
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = activeIntention ? ((activeIntention.estimatedDuration * 60 - timeLeft) / (activeIntention.estimatedDuration * 60)) * 100 : 0;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background text-foreground flex">
          <Navigation />
          <main className="flex-1 md:ml-64 p-6 lg:p-12"><Skeleton className="h-full w-full rounded-2xl" /></main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12 max-w-5xl mx-auto w-full">
          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Focus Session</h1>
            <p className="text-muted-foreground">Execute your cognitive stack with precision.</p>
          </header>

          {activeIntention ? (
            <section className="space-y-8">
              <Card className="clean-card p-12 text-center space-y-10">
                <div className="space-y-2">
                  <Badge className="bg-primary/10 text-primary border-none uppercase tracking-widest text-[10px] font-bold px-4 h-6">
                    {activeIntention.category}
                  </Badge>
                  <h2 className="text-4xl font-bold">{activeIntention.title}</h2>
                </div>

                <div className="text-[120px] font-bold tracking-tighter tabular-nums leading-none">
                  {formatTime(timeLeft)}
                </div>

                <Progress value={progress} className="h-3 bg-secondary" />

                <div className="flex justify-center gap-6">
                  <Button 
                    variant="outline" 
                    className="h-14 w-14 rounded-full"
                    onClick={() => setTimeLeft(activeIntention.estimatedDuration * 60)}
                  >
                    <RotateCcw className="w-6 h-6" />
                  </Button>
                  <Button 
                    className="h-20 w-20 rounded-full"
                    onClick={() => setIsPaused(!isPaused)}
                  >
                    {isPaused ? <Play className="w-8 h-8 fill-current" /> : <Pause className="w-8 h-8 fill-current" />}
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="h-14 w-14 rounded-full"
                    onClick={() => handleSessionEnd()}
                  >
                    <Zap className="w-6 h-6" />
                  </Button>
                </div>
              </Card>

              {isCompleted && (
                <Card className="clean-card p-8 space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">Audit Outcome</h3>
                    <p className="text-muted-foreground">Compare your actual performance against your intention.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Behavioral Result</Label>
                        <div className="flex gap-4">
                          <Button 
                            className={cn("flex-1 h-14 rounded-xl font-bold", feedback.completed ? "bg-primary" : "bg-secondary text-muted-foreground")}
                            onClick={() => setFeedback({...feedback, completed: true})}
                          >
                            Completed
                          </Button>
                          <Button 
                            className={cn("flex-1 h-14 rounded-xl font-bold", !feedback.completed ? "bg-destructive" : "bg-secondary text-muted-foreground")}
                            onClick={() => setFeedback({...feedback, completed: false})}
                          >
                            Missed
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Actual Effort</Label>
                          <Badge className="bg-primary/10 text-primary border-none">{feedback.actualEffort}/5</Badge>
                        </div>
                        <Slider value={[feedback.actualEffort]} min={1} max={5} step={1} onValueChange={([v]) => setFeedback({...feedback, actualEffort: v})} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Friction Points</Label>
                      <Textarea 
                        placeholder="What resisted your focus?" 
                        className="min-h-[140px] rounded-xl bg-background border-border"
                        value={feedback.frictionNote}
                        onChange={(e) => setFeedback({...feedback, frictionNote: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 rounded-xl font-bold text-lg gap-2"
                    onClick={handleSaveReality}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Behavioral Sync
                  </Button>
                </Card>
              )}
            </section>
          ) : (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Timer className="w-6 h-6 text-primary" />
                Select Task to Focus
              </h2>
              
              {intentions.length === 0 ? (
                <div className="py-20 border-2 border-dashed border-border rounded-2xl text-center space-y-6">
                  <p className="text-muted-foreground">Your cognitive stack is empty for today.</p>
                  <Link href="/modeler">
                    <Button variant="outline" className="h-11 px-8">Establish Intentions</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {intentions.map((item) => {
                    const log = logs.find(l => l.intentionId === item.id);
                    return (
                      <Card key={item.id} className="clean-card hover:border-primary/50 transition-colors">
                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center",
                              log ? (log.completed ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive") : "bg-primary/10 text-primary"
                            )}>
                              {log ? (log.completed ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />) : <Play className="w-6 h-6" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px] uppercase font-bold py-0">{item.category}</Badge>
                                <span className="text-[10px] text-muted-foreground font-bold">{item.estimatedDuration}m</span>
                              </div>
                              <h4 className="font-bold text-lg">{item.title}</h4>
                            </div>
                          </div>
                          {!log && (
                            <Button onClick={() => startSession(item)} className="h-11 px-6 gap-2">
                              Start Focus
                            </Button>
                          )}
                          {log && (
                            <Badge className={cn(
                              "border-none px-4 h-8 font-bold uppercase text-[10px] tracking-widest",
                              log.completed ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                            )}>
                              {log.completed ? 'Completed' : 'Missed'}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}