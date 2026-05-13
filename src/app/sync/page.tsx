
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  CheckCircle2, 
  CircleDashed, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Save, 
  Calendar as CalendarIcon,
  Loader2,
  ChevronDown,
  ChevronUp,
  Edit2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  addRealityLog, 
  getRealityLogsByDate, 
  getIntentionsByDate 
} from '@/lib/firestore';
import { Intention, RealityLog } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';

export default function RealitySync() {
  const { toast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(today);
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [logs, setLogs] = useState<RealityLog[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Form state for the active log being edited
  const [formData, setFormData] = useState({
    completed: true,
    actualEffort: 3,
    frictionNote: '',
    contextNote: '',
  });

  const fetchData = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const [fetchedIntentions, fetchedLogs] = await Promise.all([
        getIntentionsByDate(date),
        getRealityLogsByDate(date)
      ]);
      setIntentions(fetchedIntentions);
      setLogs(fetchedLogs);
    } catch (error) {
      console.error("Error fetching sync data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate, fetchData]);

  const handleToggleForm = (intention: Intention, existingLog?: RealityLog) => {
    if (expandedId === intention.id) {
      setExpandedId(null);
    } else {
      setExpandedId(intention.id);
      if (existingLog) {
        setFormData({
          completed: existingLog.completed,
          actualEffort: existingLog.actualEffort,
          frictionNote: existingLog.frictionNote,
          contextNote: existingLog.contextNote,
        });
      } else {
        setFormData({
          completed: true,
          actualEffort: intention.effortEstimate,
          frictionNote: '',
          contextNote: '',
        });
      }
    }
  };

  const handleSaveLog = (intentionId: string) => {
    try {
      addRealityLog({
        intentionId,
        completed: formData.completed,
        actualEffort: formData.actualEffort,
        frictionNote: formData.frictionNote,
        contextNote: formData.contextNote,
        date: selectedDate,
      });

      toast({
        title: "Reality logged.",
        description: "Your behavioral data has been synchronized.",
      });

      setExpandedId(null);
      // Refresh data to show the new log
      setTimeout(() => fetchData(selectedDate), 500);
    } catch (error) {
      console.error("Error saving log:", error);
    }
  };

  const syncedCount = logs.length;
  const totalCount = intentions.length;
  const progressValue = totalCount > 0 ? (syncedCount / totalCount) * 100 : 0;

  const effortLabels: Record<number, string> = {
    1: 'Minimal',
    2: 'Low',
    3: 'Moderate',
    4: 'High',
    5: 'Intense'
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Reality Sync</h1>
            <p className="text-muted-foreground text-lg">Record what actually happened. Honest logging closes the gap.</p>
          </div>
          <div className="flex flex-col gap-2 min-w-[200px]">
            <Label htmlFor="sync-date" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sync Date</Label>
            <Input 
              id="sync-date"
              type="date"
              className="bg-card/50 border-border/40 rounded-xl"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </header>

        {totalCount > 0 && (
          <div className="mb-10 space-y-3">
            <div className="flex justify-between items-end">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Daily Progress</h2>
              <span className="text-sm font-medium text-muted-foreground">
                {syncedCount} of {totalCount} intentions synced
              </span>
            </div>
            <Progress value={progressValue} className="h-3 bg-card border border-border/20" />
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-40 bg-card/40 animate-pulse border-none" />
            ))}
          </div>
        ) : intentions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border/40 rounded-3xl bg-card/10 text-center">
            <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-headline font-semibold mb-1">No intentions found</h3>
            <p className="text-muted-foreground mb-8 max-w-xs">Nothing was stacked for this day. Head to the modeler to build your plan.</p>
            <Link href="/modeler">
              <Button variant="secondary" className="rounded-xl px-8">Go to Modeler</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 pb-12">
            {intentions.map((item) => {
              const log = logs.find(l => l.intentionId === item.id);
              const isExpanded = expandedId === item.id;

              return (
                <Card key={item.id} className={cn(
                  "bg-card/30 border-none glass-card transition-all duration-300 overflow-hidden",
                  log && !isExpanded ? "border-l-4 border-l-primary/40" : ""
                )}>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                          log ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground"
                        )}>
                          {log ? <CheckCircle2 className="w-6 h-6" /> : <CircleDashed className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase">{item.category}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {item.scheduledTime}
                            </span>
                          </div>
                          <CardTitle className="font-headline text-2xl">{item.title}</CardTitle>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {log && !isExpanded && (
                          <Badge variant="outline" className={cn(
                            "px-3 py-1 rounded-lg border-none",
                            log.completed ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                          )}>
                            {log.completed ? "Completed" : "Missed"}
                          </Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-xl hover:bg-primary/10 text-primary gap-2"
                          onClick={() => handleToggleForm(item, log)}
                        >
                          {log && !isExpanded ? (
                            <><Edit2 className="w-4 h-4" /> Edit Log</>
                          ) : isExpanded ? (
                            <><ChevronUp className="w-4 h-4" /> Collapse</>
                          ) : (
                            <><Zap className="w-4 h-4" /> Sync Reality</>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Summary View (When Logged & Not Expanded) */}
                    {log && !isExpanded && (
                      <div className="mt-6 pt-6 border-t border-border/40 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Actual Effort</Label>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xl font-headline font-bold text-primary">{log.actualEffort}</span>
                            <span className="text-sm text-muted-foreground">({effortLabels[log.actualEffort]})</span>
                          </div>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                          {log.frictionNote && (
                            <div>
                              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Friction Notes</Label>
                              <p className="text-sm text-foreground/80 mt-1 italic">"{log.frictionNote}"</p>
                            </div>
                          )}
                          {log.contextNote && (
                            <div>
                              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Context</Label>
                              <p className="text-sm text-foreground/80 mt-1 italic">"{log.contextNote}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Form View (When Expanded) */}
                    {isExpanded && (
                      <div className="mt-8 pt-8 border-t border-border/40 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                          <div className="lg:col-span-4 space-y-6">
                            <div className="space-y-3">
                              <Label className="text-sm font-bold text-foreground">Outcome Status</Label>
                              <div className="flex gap-2">
                                <Button 
                                  variant={formData.completed ? "default" : "outline"}
                                  className={cn("flex-1 rounded-xl gap-2", formData.completed ? "bg-primary" : "bg-card")}
                                  onClick={() => setFormData({...formData, completed: true})}
                                >
                                  <CheckCircle2 className="w-4 h-4" /> Done
                                </Button>
                                <Button 
                                  variant={!formData.completed ? "destructive" : "outline"}
                                  className={cn("flex-1 rounded-xl gap-2", !formData.completed ? "bg-destructive" : "bg-card")}
                                  onClick={() => setFormData({...formData, completed: false})}
                                >
                                  <XCircle className="w-4 h-4" /> Missed
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <Label className="text-sm font-bold">Actual Effort</Label>
                                <Badge variant="outline" className="text-primary border-primary/20">
                                  {effortLabels[formData.actualEffort]}
                                </Badge>
                              </div>
                              <Slider 
                                value={[formData.actualEffort]} 
                                min={1} 
                                max={5} 
                                step={1} 
                                onValueChange={([v]) => setFormData({...formData, actualEffort: v})} 
                              />
                            </div>
                          </div>

                          <div className="lg:col-span-8 flex flex-col gap-6">
                            <div className="space-y-2">
                              <Label className="text-sm font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-accent" />
                                Reality Check (Friction)
                              </Label>
                              <Textarea 
                                placeholder="What blocked you? Any distractions or friction points?"
                                className="bg-background/50 border-border/40 rounded-2xl min-h-[100px]"
                                value={formData.frictionNote}
                                onChange={(e) => setFormData({...formData, frictionNote: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-bold">Contextual Notes</Label>
                              <Textarea 
                                placeholder="Mood, energy levels, situational context..."
                                className="bg-background/50 border-border/40 rounded-2xl min-h-[100px]"
                                value={formData.contextNote}
                                onChange={(e) => setFormData({...formData, contextNote: e.target.value})}
                              />
                            </div>
                            <div className="flex justify-end pt-2">
                              <Button 
                                className="px-10 py-6 rounded-xl gap-2 font-bold shadow-lg shadow-primary/20"
                                onClick={() => handleSaveLog(item.id)}
                              >
                                <Save className="w-5 h-5" />
                                Save Reality Log
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}

            <div className="flex justify-center pt-8">
              <Link href="/pivot">
                <Button size="lg" className="rounded-2xl px-12 py-8 h-auto text-xl font-headline font-bold gap-3 shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary to-accent border-none text-white hover:scale-105 transition-transform">
                  <Zap className="w-6 h-6 fill-white" />
                  Trigger Gap Analysis
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
