'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useAuth } from '@/lib/AuthContext';
import { 
  CheckCircle2, 
  CircleDashed, 
  Save, 
  Calendar as CalendarIcon,
  Loader2,
  ChevronUp,
  Edit2,
  Sparkles,
  AlertCircle,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { addRealityLog, getRealityLogsByDate, getIntentionsByDate, getAllIntentions, getAllRealityLogs } from '@/lib/firestore';
import { Intention, RealityLog } from '@/lib/schema';
import { format } from 'date-fns';
import Link from 'next/link';
import { predictBehavioralOutcome, PredictBehavioralOutcomeOutput } from '@/ai/flows/predict-behavioral-outcome';

export default function RealitySync() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(today);
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [logs, setLogs] = useState<RealityLog[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [predictingId, setPredictingId] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictBehavioralOutcomeOutput | null>(null);
  
  const [formData, setFormData] = useState({
    completed: true,
    actualEffort: 3,
    frictionNote: '',
    contextNote: '',
  });

  const fetchData = useCallback(async (date: string) => {
    if (!db || !user) return;
    setLoading(true);
    try {
      const [fetchedIntentions, fetchedLogs] = await Promise.all([
        getIntentionsByDate(db, user.uid, date),
        getRealityLogsByDate(db, user.uid, date)
      ]);
      setIntentions(fetchedIntentions);
      setLogs(fetchedLogs);
    } catch (error) {
      toast({ variant: "destructive", title: "Load Error", description: "Failed to load reality data." });
    } finally {
      setLoading(false);
    }
  }, [toast, db, user]);

  useEffect(() => {
    document.title = "GapLogic — Reality Sync";
    if (db && user) fetchData(selectedDate);
  }, [selectedDate, fetchData, db, user]);

  const handleToggleForm = (intention: Intention, existingLog?: RealityLog) => {
    if (expandedId === intention.id) {
      setExpandedId(null);
      setPrediction(null);
    } else {
      setExpandedId(intention.id);
      setPrediction(null);
      setFormData(existingLog ? {
        completed: existingLog.completed,
        actualEffort: existingLog.actualEffort,
        frictionNote: existingLog.frictionNote,
        contextNote: existingLog.contextNote,
      } : {
        completed: true,
        actualEffort: intention.effortEstimate,
        frictionNote: '',
        contextNote: '',
      });
    }
  };

  const handlePredictOutcome = async (intention: Intention) => {
    if (!db || !user) return;
    setPredictingId(intention.id);
    try {
      const [allInts, allLogs] = await Promise.all([
        getAllIntentions(db, user.uid),
        getAllRealityLogs(db, user.uid)
      ]);

      const history = allLogs.map(log => {
        const matchingInt = allInts.find(i => i.id === log.intentionId);
        return {
          title: matchingInt?.title || 'Unknown',
          category: matchingInt?.category || 'general',
          effort: matchingInt?.effortEstimate || 3,
          completed: log.completed,
          friction: log.frictionNote,
          date: log.date,
        };
      }).slice(0, 10);

      const result = await predictBehavioralOutcome({
        history,
        currentIntention: {
          title: intention.title,
          category: intention.category,
          effort: intention.effortEstimate,
          scheduledTime: intention.scheduledTime,
          date: intention.date,
        }
      });

      setPrediction(result);
      if (result.prediction === 'completed') {
        setFormData(prev => ({ ...prev, completed: true }));
      } else {
        setFormData(prev => ({ ...prev, completed: false, frictionNote: result.reasoning }));
      }
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to run behavioral audit." });
    } finally {
      setPredictingId(null);
    }
  };

  const handleSaveLog = async (intentionId: string) => {
    if (!db || !user) return;
    setSubmitting(true);
    try {
      await addRealityLog(db, user.uid, {
        intentionId,
        completed: formData.completed,
        actualEffort: formData.actualEffort,
        frictionNote: formData.frictionNote,
        contextNote: formData.contextNote,
        date: selectedDate,
      });

      toast({ title: "Reality logged.", description: "Sync successful." });
      setExpandedId(null);
      setPrediction(null);
      fetchData(selectedDate);
    } catch (error) {
      // Handled centrally
    } finally {
      setSubmitting(false);
    }
  };

  const progress = intentions.length > 0 ? Math.round((logs.length / intentions.length) * 100) : 0;
  const effortLabels: Record<number, string> = { 1: 'Minimal', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Intense' };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Reality Sync</h1>
              <p className="text-muted-foreground text-lg">Predict and record behavioral outcomes.</p>
            </div>
            <div className="flex flex-col gap-2 min-w-[200px]">
              <Label htmlFor="sync-date" className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Sync Date</Label>
              <Input 
                id="sync-date" type="date" value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="bg-card/50 border-white/5 rounded-xl h-12" 
              />
            </div>
          </header>

          {intentions.length > 0 && (
            <div className="mb-12 space-y-4">
              <div className="flex justify-between items-end">
                <h2 className="text-sm font-bold uppercase text-primary tracking-widest">Execution Integrity</h2>
                <span className="text-xs text-muted-foreground font-bold">{logs.length} / {intentions.length} Synced</span>
              </div>
              <Progress value={progress} className="h-2.5 bg-white/5" />
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="h-44 w-full rounded-2xl" />
            </div>
          ) : intentions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02] text-center">
              <CalendarIcon className="w-16 h-16 text-muted-foreground/20 mb-6" />
              <p className="text-muted-foreground text-lg mb-8">No cognitive stack modeled for this date.</p>
              <Link href="/modeler">
                <Button size="lg" className="rounded-2xl px-10 font-bold h-14 shadow-2xl shadow-primary/20 bg-primary text-white">
                  Model Your Stack
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {intentions.map((item) => {
                const log = logs.find(l => l.intentionId === item.id);
                const isExpanded = expandedId === item.id;
                return (
                  <Card key={item.id} className={cn(
                    "bg-white/[0.02] border-white/5 glass-card transition-all duration-500 overflow-hidden",
                    isExpanded && "ring-1 ring-primary/30"
                  )}>
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-inner",
                            log ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"
                          )}>
                            {log ? <CheckCircle2 className="w-7 h-7" /> : <CircleDashed className="w-7 h-7" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none uppercase text-[10px] font-bold tracking-widest">{item.category}</Badge>
                              <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">Effort {item.effortEstimate}/5</span>
                            </div>
                            <CardTitle className="font-headline text-2xl font-bold">{item.title}</CardTitle>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <Button 
                            variant="outline" 
                            onClick={() => handleToggleForm(item, log)} 
                            className="flex-1 md:flex-none h-12 rounded-xl border-white/10 hover:bg-white/5 font-bold text-sm"
                          >
                            {log && !isExpanded ? <><Edit2 className="w-4 h-4 mr-2" /> Adjust</> : isExpanded ? <><ChevronUp className="w-4 h-4 mr-2" /> Collapse</> : <><Zap className="w-4 h-4 mr-2" /> Sync</>}
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-8 pt-8 border-t border-white/5 space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                          {prediction && (
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex gap-4 animate-in zoom-in-95 duration-300">
                              <div className="pt-1"><BrainCircuit className="w-6 h-6 text-primary" /></div>
                              <div className="space-y-2">
                                <h4 className="font-bold text-primary flex items-center gap-2">AI Behavioral Audit: {prediction.prediction.replace('_', ' ')} <Badge variant="outline" className="text-[10px] border-primary/30">{Math.round(prediction.probability * 100)}% Confidence</Badge></h4>
                                <p className="text-sm text-muted-foreground leading-relaxed italic">"{prediction.reasoning}"</p>
                                <div className="flex items-center gap-2 text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 w-fit px-3 py-1 rounded-full">
                                  <Sparkles className="w-3 h-3" /> Tip: {prediction.suggestedAction}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-8">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Execution Status</Label>
                                  {!prediction && !log && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10"
                                      onClick={() => handlePredictOutcome(item)}
                                      disabled={predictingId === item.id}
                                    >
                                      {predictingId === item.id ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Sparkles className="w-3 h-3 mr-1.5" />} 
                                      Predict Outcome
                                    </Button>
                                  )}
                                </div>
                                <div className="flex gap-3">
                                  <Button 
                                    variant={formData.completed ? "default" : "outline"} 
                                    className={cn("flex-1 h-14 rounded-2xl font-bold text-base transition-all", formData.completed ? "shadow-lg shadow-primary/20" : "border-white/10 opacity-50")} 
                                    onClick={() => setFormData({...formData, completed: true})}
                                  >
                                    Completed
                                  </Button>
                                  <Button 
                                    variant={!formData.completed ? "destructive" : "outline"} 
                                    className={cn("flex-1 h-14 rounded-2xl font-bold text-base transition-all", !formData.completed ? "shadow-lg shadow-destructive/20" : "border-white/10 opacity-50")} 
                                    onClick={() => setFormData({...formData, completed: false})}
                                  >
                                    Missed
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Actual Effort</Label>
                                  <Badge variant="outline" className="border-primary/30 text-primary">{effortLabels[formData.actualEffort]}</Badge>
                                </div>
                                <Slider 
                                  value={[formData.actualEffort]} min={1} max={5} step={1} 
                                  onValueChange={([v]) => setFormData({...formData, actualEffort: v})} 
                                />
                              </div>
                            </div>

                            <div className="space-y-8">
                              <div className="space-y-3">
                                <Label className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                  Friction Analysis {prediction && <Badge className="bg-primary/10 text-primary text-[9px] border-none">AI Suggested</Badge>}
                                </Label>
                                <Textarea 
                                  placeholder="What prevented perfect execution?" 
                                  value={formData.frictionNote} 
                                  onChange={e => setFormData({...formData, frictionNote: e.target.value})} 
                                  className="min-h-[100px] rounded-2xl bg-white/[0.03] border-white/10 focus:ring-primary/50" 
                                />
                              </div>
                              <div className="space-y-3">
                                <Label className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Situational Context</Label>
                                <Textarea 
                                  placeholder="Energy levels, environment, state of mind..." 
                                  value={formData.contextNote} 
                                  onChange={e => setFormData({...formData, contextNote: e.target.value})} 
                                  className="min-h-[100px] rounded-2xl bg-white/[0.03] border-white/10 focus:ring-primary/50" 
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end pt-4">
                            <Button 
                              className="h-16 px-12 rounded-2xl font-bold text-lg gap-3 shadow-2xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform" 
                              onClick={() => handleSaveLog(item.id)} 
                              disabled={submitting}
                            >
                              {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />} 
                              Finalize Reality Sync
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
              
              {logs.length === intentions.length && logs.length > 0 && (
                 <div className="flex justify-center pt-12 animate-float">
                   <Link href="/pivot">
                     <Button size="lg" className="rounded-3xl px-16 h-20 text-xl font-bold gap-4 shadow-[0_20px_50px_rgba(59,130,246,0.3)] bg-gradient-to-br from-primary to-blue-600 border-none text-white hover:scale-105 transition-all">
                       <Zap className="w-7 h-7 fill-white" /> Run Full Behavioral Diagnostic
                     </Button>
                   </Link>
                 </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
