'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Navigation } from '@/components/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Zap,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { addRealityLog } from '@/lib/firestore';
import { Intention } from '@/lib/schema';
import { format } from 'date-fns';
import Link from 'next/link';
import { predictBehavioralOutcome, PredictBehavioralOutcomeOutput } from '@/ai/flows/predict-behavioral-outcome';

export default function FocusTimer() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useAuth();
  const { intentions, logs, loading } = useData();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [activeIntention, setActiveIntention] = useState<Intention | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictBehavioralOutcomeOutput | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [feedback, setFeedback] = useState({
    completed: true,
    actualEffort: 3,
    frictionNote: '',
    contextNote: '',
  });

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

  const runPrediction = async (intention: Intention) => {
    if (predicting) return;
    setPredicting(true);
    try {
      const history = intentions.map(i => {
        const log = logs.find(l => l.intentionId === i.id);
        return {
          title: i.title,
          category: i.category,
          effort: i.effortEstimate,
          completed: !!log?.completed,
          friction: log?.frictionNote,
          date: i.date
        };
      });

      const res = await predictBehavioralOutcome({
        history: history.slice(0, 15),
        currentIntention: {
          title: intention.title,
          category: intention.category,
          effort: intention.effortEstimate,
          scheduledTime: intention.scheduledTime,
          date: intention.date
        }
      });
      setPrediction(res);
    } catch (e) {
      console.error(e);
    } finally {
      setPredicting(false);
    }
  };

  const startSession = (intention: Intention) => {
    setActiveIntention(intention);
    setTimeLeft((intention.estimatedDuration || 25) * 60);
    setIsPaused(false);
    setIsCompleted(false);
    setPrediction(null);
    setFeedback(prev => ({ ...prev, actualEffort: intention.effortEstimate, completed: true, frictionNote: '', contextNote: '' }));
    runPrediction(intention);
    toast({ title: "Session Initialized", description: `Active Task: ${intention.title}` });
  };

  const handleSessionEnd = () => {
    setIsPaused(true);
    setIsCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    toast({ title: "Session Terminal", description: "Audit the outcome below." });
  };

  const handleSaveReality = async () => {
    if (!db || !user || !activeIntention) return;
    setSubmitting(true);
    try {
      addRealityLog(db, user.uid, {
        intentionId: activeIntention.id,
        completed: feedback.completed,
        actualEffort: feedback.actualEffort,
        frictionNote: feedback.frictionNote,
        contextNote: feedback.contextNote,
        date: today,
      });

      toast({ title: "Reality Synced", description: "Outcome recorded in behavioral history." });
      setActiveIntention(null);
      setIsCompleted(false);
      setPrediction(null);
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
        <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 max-w-5xl mx-auto w-full">
          <header className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Focus Session</h1>
            <p className="text-muted-foreground">Run your daily stack and audit deviations.</p>
          </header>

          {activeIntention ? (
            <section className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Card className="clean-card border-none bg-primary/5 overflow-hidden">
                <CardContent className="p-12 text-center space-y-10">
                  <div className="space-y-4">
                    <Badge variant="secondary" className="uppercase tracking-widest text-[10px] font-bold px-6 h-7">
                      {activeIntention.category}
                    </Badge>
                    <h2 className="text-5xl font-bold tracking-tight">{activeIntention.title}</h2>
                  </div>

                  <div className="text-[140px] font-bold tracking-tighter tabular-nums leading-none text-primary">
                    {formatTime(timeLeft)}
                  </div>

                  <div className="space-y-2">
                    <Progress value={progress} className="h-2 bg-primary/10" />
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Inception</span>
                      <span>Target: {activeIntention.estimatedDuration}m</span>
                    </div>
                  </div>

                  <div className="flex justify-center items-center gap-8">
                    <Button 
                      variant="outline" 
                      className="h-16 w-16 rounded-full border-muted bg-card hover:bg-muted"
                      onClick={() => setTimeLeft(activeIntention.estimatedDuration * 60)}
                    >
                      <RotateCcw className="w-8 h-8" />
                    </Button>
                    <Button 
                      className="h-24 w-24 rounded-full shadow-2xl bg-primary text-primary-foreground hover:scale-105 transition-transform"
                      onClick={() => setIsPaused(!isPaused)}
                    >
                      {isPaused ? <Play className="w-10 h-10 fill-current" /> : <Pause className="w-10 h-10 fill-current" />}
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="h-16 w-16 rounded-full shadow-xl hover:scale-105 transition-transform"
                      onClick={() => handleSessionEnd()}
                    >
                      <Zap className="w-8 h-8 fill-current" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Predictive Audit HUD */}
              {(predicting || prediction) && !isCompleted && (
                <Card className="clean-card border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3 border-b border-primary/10">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 text-primary">
                      <BrainCircuit className="w-4 h-4" />
                      Predictive Behavioral Audit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {predicting ? (
                      <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground animate-pulse">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing behavioral history for leakage patterns...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Confidence Model</p>
                          <div className="flex items-center gap-3">
                            {prediction?.prediction === 'completed' ? <TrendingUp className="text-emerald-500 w-5 h-5" /> : <AlertTriangle className="text-destructive w-5 h-5" />}
                            <span className="text-lg font-bold capitalize">{prediction?.prediction}</span>
                          </div>
                        </div>
                        <div className="md:col-span-2 space-y-3">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Diagnostic Reasoning</p>
                          <p className="text-sm leading-relaxed font-medium">{prediction?.reasoning}</p>
                          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold">
                            <Zap className="w-3 h-3" />
                            Pivot: {prediction?.suggestedAction}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {isCompleted && (
                <Card className="clean-card p-10 space-y-10 animate-in slide-in-from-bottom-6 duration-700">
                  <div className="text-center space-y-3 border-b pb-8">
                    <h3 className="text-3xl font-bold">Reality Audit</h3>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Compare Intention vs. Behavioral Outcome</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Terminal Status</Label>
                        <div className="flex gap-4">
                          <Button 
                            className={cn("flex-1 h-16 rounded-2xl font-bold text-lg", feedback.completed ? "bg-emerald-500 hover:bg-emerald-600" : "bg-muted text-muted-foreground")}
                            onClick={() => setFeedback({...feedback, completed: true})}
                          >
                            <CheckCircle2 className="w-6 h-6 mr-2" />
                            Completed
                          </Button>
                          <Button 
                            className={cn("flex-1 h-16 rounded-2xl font-bold text-lg", !feedback.completed ? "bg-destructive hover:bg-destructive/90" : "bg-muted text-muted-foreground")}
                            onClick={() => setFeedback({...feedback, completed: false})}
                          >
                            <XCircle className="w-6 h-6 mr-2" />
                            Missed
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Actual Energy Expenditure</Label>
                          <Badge variant="outline" className="text-primary font-bold h-7 px-4 text-sm border-primary/20">{feedback.actualEffort}/5</Badge>
                        </div>
                        <Slider value={[feedback.actualEffort]} min={1} max={5} step={1} onValueChange={([v]) => setFeedback({...feedback, actualEffort: v})} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Friction Notes & Context</Label>
                      <Textarea 
                        placeholder="Identify what resisted your focus (e.g., environment, internal resistance, fatigue)..." 
                        className="min-h-[180px] rounded-2xl bg-muted/20 border-muted p-6 text-base leading-relaxed"
                        value={feedback.frictionNote}
                        onChange={(e) => setFeedback({...feedback, frictionNote: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full h-18 rounded-2xl font-bold text-xl gap-3 shadow-2xl"
                    onClick={handleSaveReality}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    Sync Reality
                  </Button>
                </Card>
              )}
            </section>
          ) : (
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Timer className="w-6 h-6 text-primary" />
                  </div>
                  Daily Cognitive Stack
                </h2>
                <Badge variant="outline" className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest border-muted">
                  {todayIntentions.length} Sessions Remaining
                </Badge>
              </div>
              
              {loading ? (
                <div className="grid gap-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-32 bg-card border rounded-2xl animate-pulse" />)}
                </div>
              ) : todayIntentions.length === 0 ? (
                <Card className="border-2 border-dashed border-muted rounded-3xl bg-transparent">
                  <CardContent className="py-20 text-center space-y-8">
                    <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                      <History className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold">No tasks established for today.</p>
                      <p className="text-muted-foreground">Visit the Modeler to architect your session stack.</p>
                    </div>
                    <Link href="/modeler">
                      <Button variant="outline" className="h-12 px-10 rounded-xl font-bold uppercase tracking-widest text-xs">Establish First Intention</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {todayIntentions.map((item) => {
                    const log = logs.find(l => l.intentionId === item.id);
                    return (
                      <Card key={item.id} className="clean-card hover:border-primary/40 transition-all duration-300">
                        <div className="p-8 flex items-center justify-between">
                          <div className="flex items-center gap-8">
                            <div className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                              log ? (log.completed ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive") : "bg-primary/5 text-primary"
                            )}>
                              {log ? (log.completed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />) : <Play className="w-8 h-8" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-5 border-none bg-secondary/50">{item.category}</Badge>
                                <span className="text-[10px] text-muted-foreground font-bold tracking-widest">{item.estimatedDuration}M DURATION</span>
                              </div>
                              <h4 className="font-bold text-2xl tracking-tight">{item.title}</h4>
                            </div>
                          </div>
                          {!log && (
                            <Button onClick={() => startSession(item)} className="h-14 px-10 font-bold text-lg rounded-xl">
                              Begin Session
                            </Button>
                          )}
                          {log && (
                            <div className="text-right">
                              <Badge className={cn(
                                "border-none px-6 h-10 font-bold uppercase text-[10px] tracking-widest rounded-xl",
                                log.completed ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                              )}>
                                {log.completed ? 'Completed' : 'Missed'}
                              </Badge>
                            </div>
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
