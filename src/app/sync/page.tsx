'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Navigation } from '@/components/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useAuth } from '@/lib/AuthContext';
import { useData } from '@/lib/DataContext';
import { 
  CheckCircle2, 
  XCircle,
  Play, 
  Pause, 
  RotateCcw,
  Timer,
  Save,
  Loader2,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { addRealityLog } from '@/lib/firestore';
import { Intention } from '@/lib/schema';
import { format } from 'date-fns';
import Link from 'next/link';

export default function FocusTimer() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useAuth();
  const { intentions, logs, loading, refresh } = useData();
  const today = format(new Date(), 'yyyy-MM-dd');
  
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

  // Use global data instead of local fetching to ensure consistency and speed
  const todayIntentions = useMemo(() => {
    return intentions.filter(i => i.date === today);
  }, [intentions, today]);

  useEffect(() => {
    document.title = "GapLogic — Focus Session";
  }, []);

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

      toast({ title: "Reality Synced", description: "Behavioral data saved." });
      setActiveIntention(null);
      setIsCompleted(false);
      await refresh();
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex">
        <Navigation />
        <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12 max-w-5xl mx-auto w-full">
          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Focus Session</h1>
            <p className="text-muted-foreground">Run your daily stack.</p>
          </header>

          {activeIntention ? (
            <section className="space-y-8">
              <Card className="clean-card p-12 text-center space-y-10 border-none shadow-none bg-secondary/30">
                <div className="space-y-2">
                  <Badge variant="secondary" className="uppercase tracking-widest text-[10px] font-bold px-4 h-6">
                    {activeIntention.category}
                  </Badge>
                  <h2 className="text-4xl font-bold">{activeIntention.title}</h2>
                </div>

                <div className="text-[120px] font-bold tracking-tighter tabular-nums leading-none">
                  {formatTime(timeLeft)}
                </div>

                <Progress value={progress} className="h-2 bg-background" />

                <div className="flex justify-center gap-6">
                  <Button 
                    variant="outline" 
                    className="h-14 w-14 rounded-full border-none bg-card hover:bg-accent"
                    onClick={() => setTimeLeft(activeIntention.estimatedDuration * 60)}
                  >
                    <RotateCcw className="w-6 h-6" />
                  </Button>
                  <Button 
                    className="h-20 w-20 rounded-full shadow-lg"
                    onClick={() => setIsPaused(!isPaused)}
                  >
                    {isPaused ? <Play className="w-8 h-8 fill-current" /> : <Pause className="w-8 h-8 fill-current" />}
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="h-14 w-14 rounded-full border-none shadow-lg"
                    onClick={() => handleSessionEnd()}
                  >
                    <Zap className="w-6 h-6" />
                  </Button>
                </div>
              </Card>

              {isCompleted && (
                <Card className="clean-card p-8 space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">Session Outcome</h3>
                    <p className="text-muted-foreground text-sm">Compare plan vs. reality.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Status</Label>
                        <div className="flex gap-4">
                          <Button 
                            className={cn("flex-1 h-12 rounded-xl font-bold", feedback.completed ? "bg-primary" : "bg-muted text-muted-foreground")}
                            onClick={() => setFeedback({...feedback, completed: true})}
                          >
                            Completed
                          </Button>
                          <Button 
                            className={cn("flex-1 h-12 rounded-xl font-bold", !feedback.completed ? "bg-destructive" : "bg-muted text-muted-foreground")}
                            onClick={() => setFeedback({...feedback, completed: false})}
                          >
                            Missed
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Actual Effort</Label>
                          <span className="text-primary font-bold">{feedback.actualEffort}/5</span>
                        </div>
                        <Slider value={[feedback.actualEffort]} min={1} max={5} step={1} onValueChange={([v]) => setFeedback({...feedback, actualEffort: v})} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Notes</Label>
                      <Textarea 
                        placeholder="What resisted your focus?" 
                        className="min-h-[140px] rounded-xl"
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
                    Confirm Result
                  </Button>
                </Card>
              )}
            </section>
          ) : (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Timer className="w-6 h-6 text-primary" />
                Today's Cognitive Stack
              </h2>
              
              {loading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />)}
                </div>
              ) : todayIntentions.length === 0 ? (
                <div className="py-20 border-2 border-dashed border-border rounded-2xl text-center space-y-6">
                  <p className="text-muted-foreground">No tasks modeled for today yet.</p>
                  <Link href="/modeler">
                    <Button variant="outline" className="h-11 px-8">Go to Modeler</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {todayIntentions.map((item) => {
                    const log = logs.find(l => l.intentionId === item.id);
                    return (
                      <Card key={item.id} className="clean-card overflow-hidden hover:border-primary/50 transition-colors">
                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center",
                              log ? (log.completed ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive") : "bg-primary/5 text-primary"
                            )}>
                              {log ? (log.completed ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />) : <Play className="w-6 h-6" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-4">{item.category}</Badge>
                                <span className="text-[10px] text-muted-foreground font-bold">{item.estimatedDuration}m</span>
                              </div>
                              <h4 className="font-bold text-lg">{item.title}</h4>
                            </div>
                          </div>
                          {!log && (
                            <Button onClick={() => startSession(item)} className="h-11 px-6 font-bold">
                              Start
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
