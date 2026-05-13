'use client';

import { useState, useEffect, useMemo } from 'react';
import { Navigation } from '@/components/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Plus, Clock, Calendar as CalendarIcon, Loader2, Target as TargetIcon, BrainCircuit, Sparkles, Layers, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { addIntention } from '@/lib/firestore';
import { useData } from '@/lib/DataContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { useFirestore } from '@/firebase';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Modeler() {
  const { toast } = useToast();
  const { user } = useAuth();
  const db = useFirestore();
  const { intentions, loading, refresh } = useData();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'work' as const,
    effortEstimate: 3,
    estimatedDuration: 25,
    scheduledTime: format(new Date(), 'HH:mm'),
    date: today,
  });

  useEffect(() => {
    document.title = "GapLogic — Intention Modeler";
  }, []);

  const filteredIntentions = useMemo(() => {
    return intentions.filter(i => i.date === selectedDate);
  }, [intentions, selectedDate]);

  const handleAdd = async () => {
    if (!user || !db) return;
    if (!formData.title) {
      toast({ variant: "destructive", title: "Information Required", description: "What is the primary objective of this intention?" });
      return;
    }

    setSubmitting(true);
    try {
      await addIntention(db, user.uid, {
        title: formData.title,
        category: formData.category,
        effortEstimate: formData.effortEstimate,
        estimatedDuration: formData.estimatedDuration,
        scheduledTime: formData.scheduledTime,
        date: formData.date,
      });

      toast({ 
        title: "Intention Established", 
        description: "Successfully added to your cognitive stack."
      });
      setFormData(prev => ({ ...prev, title: '', effortEstimate: 3, estimatedDuration: 25 }));
      await refresh();
    } catch (error) {
      // Handled centrally
    } finally {
      setSubmitting(false);
    }
  };

  const effortLabels: Record<number, string> = { 1: 'Minimal', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Intense' };
  const categoryColors: Record<string, string> = {
    health: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    work: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    learning: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    personal: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12 max-w-7xl mx-auto w-full">
          <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-primary">
                <BrainCircuit className="w-8 h-8" />
                <h1 className="font-headline text-4xl font-bold tracking-tight">Intention Modeler</h1>
              </div>
              <p className="text-muted-foreground text-lg">Define your behavioral intentions with structural integrity.</p>
            </div>
            
            <div className="bg-card p-4 rounded-2xl border border-border flex flex-col gap-2 min-w-[240px] shadow-sm">
              <Label htmlFor="view-date" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Current Focus Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="view-date" type="date" value={selectedDate} 
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setFormData(prev => ({ ...prev, date: e.target.value }));
                  }}
                  className="bg-background border-input pl-10 h-10 rounded-xl focus-visible:ring-primary/50 cursor-pointer"
                />
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
            <section id="intention-form" className="xl:col-span-5">
              <Card className="border-border overflow-hidden shadow-xl bg-card">
                <div className="h-1 w-full bg-primary" />
                <CardHeader className="pb-4">
                  <CardTitle className="font-headline text-xl flex items-center gap-3">
                    <Pencil className="w-5 h-5 text-primary" />
                    New Intention
                  </CardTitle>
                  <CardDescription>Establish a new commitment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Title</Label>
                    <Input 
                      id="title" placeholder="e.g., Deep Work: Strategy" 
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                      className="bg-background border-input h-12 rounded-xl text-base px-4 focus-visible:ring-primary/30"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Domain</Label>
                      <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v as any})}>
                        <SelectTrigger id="category" className="bg-background border-input h-12 rounded-xl px-4">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border rounded-xl">
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="learning">Learning</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Duration (Min)</Label>
                      <div className="relative">
                        <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="duration" type="number" 
                          value={formData.estimatedDuration} 
                          onChange={e => setFormData({...formData, estimatedDuration: parseInt(e.target.value) || 25})} 
                          className="bg-background border-input h-12 rounded-xl pl-10" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estimated Effort</Label>
                      <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 px-3 py-1 text-[10px] font-bold">
                        {effortLabels[formData.effortEstimate]}
                      </Badge>
                    </div>
                    <Slider 
                      value={[formData.effortEstimate]} 
                      min={1} max={5} step={1} 
                      onValueChange={([v]) => setFormData({...formData, effortEstimate: v})} 
                      className="py-1"
                    />
                  </div>
                </CardContent>
                <CardFooter className="pb-8">
                  <Button 
                    className="w-full gap-2 rounded-xl py-6 font-bold text-base shadow-lg shadow-primary/20" 
                    onClick={handleAdd} 
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} 
                    Add to Stack
                  </Button>
                </CardFooter>
              </Card>
            </section>

            <section className="xl:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-xl font-bold flex items-center gap-3">
                  <Layers className="w-5 h-5 text-primary" />
                  Cognitive Stack 
                  <Badge className="bg-secondary text-secondary-foreground border-none px-2 py-0.5 text-[10px] font-bold">
                    {filteredIntentions.length}
                  </Badge>
                </h2>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{format(new Date(selectedDate), 'EEEE, MMM dd')}</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              ) : filteredIntentions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-2xl bg-card/30 text-center space-y-4">
                  <TargetIcon className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-sm max-w-[200px]">No intentions defined for this period.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredIntentions.map((item, index) => (
                    <Card key={item.id} className="bg-card border-border hover:border-primary/40 transition-all duration-300 overflow-hidden group shadow-sm">
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className={cn("border px-2 py-0 text-[9px] uppercase font-bold tracking-widest", categoryColors[item.category])}>
                            {item.category}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">{item.estimatedDuration}m</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
                        <div className="pt-2 flex items-center justify-between border-t border-border">
                          <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">Effort</span>
                          <span className="text-sm font-bold font-headline text-primary">{item.effortEstimate}/5</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
