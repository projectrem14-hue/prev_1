
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
  Zap,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { addRealityLog, getRealityLogsByDate, getIntentionsByDate } from '@/lib/firestore';
import { Intention, RealityLog } from '@/lib/schema';
import { format } from 'date-fns';
import Link from 'next/link';

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
    } else {
      setExpandedId(intention.id);
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
            <div><h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Reality Sync</h1><p className="text-muted-foreground text-lg">Record what actually happened.</p></div>
            <div className="flex flex-col gap-2 min-w-[200px]"><Label htmlFor="sync-date" className="text-xs uppercase tracking-widest text-muted-foreground">Log Date</Label><Input id="sync-date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-card/50 rounded-xl" /></div>
          </header>

          {intentions.length > 0 && (
            <div className="mb-10 space-y-3">
              <div className="flex justify-between items-end"><h2 className="text-xs font-bold uppercase text-primary">Daily Progress</h2><span className="text-xs text-muted-foreground">{logs.length} / {intentions.length} Synced</span></div>
              <Progress value={progress} className="h-3" />
            </div>
          )}

          {loading ? <Skeleton className="h-44 w-full rounded-2xl" /> : intentions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-3xl bg-card/10 text-center">
              <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-8">No intentions found for this day.</p>
              <Link href="/modeler"><Button size="lg" className="rounded-2xl px-10 font-bold h-14 shadow-xl shadow-primary/20">Go to Modeler</Button></Link>
            </div>
          ) : (
            <div className="space-y-6">
              {intentions.map((item) => {
                const log = logs.find(l => l.intentionId === item.id);
                const isExpanded = expandedId === item.id;
                return (
                  <Card key={item.id} className="bg-card/30 border-none glass-card transition-all overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", log ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground")}>
                            {log ? <CheckCircle2 className="w-6 h-6" /> : <CircleDashed className="w-6 h-6" />}
                          </div>
                          <div><Badge className="bg-primary/10 text-primary mb-1 uppercase font-bold">{item.category}</Badge><CardTitle className="font-headline text-2xl">{item.title}</CardTitle></div>
                        </div>
                        <Button variant="ghost" onClick={() => handleToggleForm(item, log)} className="rounded-xl text-primary font-bold">
                          {log && !isExpanded ? <><Edit2 className="w-4 h-4 mr-2" /> Edit</> : isExpanded ? <><ChevronUp className="w-4 h-4 mr-2" /> Hide</> : <><Save className="w-4 h-4 mr-2" /> Sync Reality</>}
                        </Button>
                      </div>
                      {isExpanded && (
                        <div className="mt-8 pt-8 border-t border-border/40 space-y-8 animate-in slide-in-from-top-4 duration-300">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                              <div className="space-y-3"><Label className="font-bold">Execution Status</Label><div className="flex gap-2">
                                <Button variant={formData.completed ? "default" : "outline"} className="flex-1 h-12 rounded-xl font-bold" onClick={() => setFormData({...formData, completed: true})}>Completed</Button>
                                <Button variant={!formData.completed ? "destructive" : "outline"} className="flex-1 h-12 rounded-xl font-bold" onClick={() => setFormData({...formData, completed: false})}>Missed</Button>
                              </div></div>
                              <div className="space-y-4"><div className="flex justify-between items-center"><Label className="font-bold">Actual Effort</Label><Badge variant="outline">{effortLabels[formData.actualEffort]}</Badge></div>
                              <Slider value={[formData.actualEffort]} min={1} max={5} step={1} onValueChange={([v]) => setFormData({...formData, actualEffort: v})} /></div>
                            </div>
                            <div className="space-y-6">
                              <div className="space-y-2"><Label className="font-bold">Friction Notes</Label><Textarea placeholder="What blocked you?" value={formData.frictionNote} onChange={e => setFormData({...formData, frictionNote: e.target.value})} className="rounded-xl bg-background/50" /></div>
                              <div className="space-y-2"><Label className="font-bold">Context</Label><Textarea placeholder="Mood, energy level..." value={formData.contextNote} onChange={e => setFormData({...formData, contextNote: e.target.value})} className="rounded-xl bg-background/50" /></div>
                            </div>
                          </div>
                          <div className="flex justify-end"><Button className="h-14 px-10 rounded-2xl font-bold gap-2 shadow-xl shadow-primary/20" onClick={() => handleSaveLog(item.id)} disabled={submitting}>{submitting ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />} Save Log</Button></div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
              {logs.length === intentions.length && logs.length > 0 && (
                 <div className="flex justify-center pt-8"><Link href="/pivot"><Button size="lg" className="rounded-2xl px-12 h-16 text-xl font-bold gap-3 shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary to-accent border-none text-white hover:scale-105 transition-transform"><Zap className="w-6 h-6 fill-white" /> Trigger AI Diagnostic</Button></Link></div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
