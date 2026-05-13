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
import { Pencil, Plus, Clock, Calendar as CalendarIcon, Loader2, Target as TargetIcon, BrainCircuit, Sparkles } from 'lucide-react';
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
        scheduledTime: formData.scheduledTime,
        date: formData.date,
      });

      toast({ 
        title: "Intention Established", 
        description: (
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Successfully added to your cognitive stack.</span>
          </div>
        )
      });
      setFormData(prev => ({ ...prev, title: '', effortEstimate: 3 }));
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
              <p className="text-muted-foreground text-lg">Define your day with structural integrity.</p>
            </div>
            
            <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col gap-2 min-w-[240px]">
              <Label htmlFor="view-date" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Current Focus Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="view-date" type="date" value={selectedDate} 
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setFormData(prev => ({ ...prev, date: e.target.value }));
                  }}
                  className="bg-background/40 border-none pl-10 h-10 rounded-xl focus-visible:ring-primary/50"
                />
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
            {/* Form Section */}
            <div className="xl:col-span-5 space-y-6">
              <Card className="pro-card border-white/5 overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-primary via-blue-500 to-primary" />
                <CardHeader className="pb-4">
                  <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-primary" />
                    New Intention
                  </CardTitle>
                  <CardDescription>What is your planned behavioral outcome?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Goal Title</Label>
                    <Input 
                      id="title" placeholder="e.g., Strategic Deep Work" 
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                      className="bg-white/[0.03] border-white/10 h-14 rounded-2xl text-lg px-6 focus-visible:ring-primary/30 transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                      <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v as any})}>
                        <SelectTrigger id="category" className="bg-white/[0.03] border-white/10 h-12 rounded-2xl px-4">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-white/10 rounded-xl">
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="learning">Learning</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="time" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input 
                          id="time" type="time" 
                          value={formData.scheduledTime} 
                          onChange={e => setFormData({...formData, scheduledTime: e.target.value})} 
                          className="bg-white/[0.03] border-white/10 h-12 rounded-2xl pl-10" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Effort Intensity</Label>
                      <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 px-3 py-1 font-bold">
                        {effortLabels[formData.effortEstimate]} ({formData.effortEstimate})
                      </Badge>
                    </div>
                    <Slider 
                      value={[formData.effortEstimate]} 
                      min={1} max={5} step={1} 
                      onValueChange={([v]) => setFormData({...formData, effortEstimate: v})} 
                      className="py-2"
                    />
                    <div className="flex justify-between px-1">
                      <span className="text-[10px] text-muted-foreground font-medium">Low</span>
                      <span className="text-[10px] text-muted-foreground font-medium">Moderate</span>
                      <span className="text-[10px] text-muted-foreground font-medium">Intense</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    className="w-full gap-3 rounded-2xl py-8 font-bold text-lg shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]" 
                    onClick={handleAdd} 
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />} 
                    Establish Intention
                  </Button>
                </CardFooter>
              </Card>

              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex gap-4 animate-in fade-in slide-in-from-left-4 duration-700">
                <Sparkles className="w-6 h-6 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  "Setting clear effort estimates reduces cognitive load. Be honest with your energy levels to improve prediction accuracy."
                </p>
              </div>
            </div>

            {/* List Section */}
            <div className="xl:col-span-7 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-2xl font-bold flex items-center gap-3">
                  Your Cognitive Stack 
                  <Badge className="bg-white/5 text-muted-foreground border-white/10 px-2.5 py-0.5 text-sm font-medium">
                    {filteredIntentions.length}
                  </Badge>
                </h2>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{format(new Date(selectedDate), 'EEEE, MMM dd')}</span>
              </div>

              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-28 w-full rounded-2xl" />
                  <Skeleton className="h-28 w-full rounded-2xl" />
                  <Skeleton className="h-28 w-full rounded-2xl" />
                </div>
              ) : filteredIntentions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01] text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                    <TargetIcon className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground font-bold text-lg">Empty Stack</p>
                    <p className="text-muted-foreground text-sm max-w-[280px]">You haven't defined any intentions for this date yet. Use the form to begin.</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredIntentions.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="group animate-in fade-in slide-in-from-right-4 duration-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <Card className="bg-white/[0.02] border-white/5 hover:border-primary/30 transition-all duration-300 overflow-hidden glass-card group-hover:bg-white/[0.04]">
                        <div className="p-6 flex items-center gap-8">
                          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-white/5 text-primary border border-white/5">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground leading-none mb-1">Effort</span>
                            <span className="text-xl font-bold font-headline">{item.effortEstimate}</span>
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                              <Badge className={cn("border px-2 py-0 text-[10px] uppercase font-bold tracking-widest", categoryColors[item.category])}>
                                {item.category}
                              </Badge>
                              <div className="h-1 w-1 rounded-full bg-white/20" />
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                <Clock className="w-3 h-3" /> {item.scheduledTime}
                              </span>
                            </div>
                            <h3 className="font-bold text-xl tracking-tight group-hover:text-primary transition-colors">{item.title}</h3>
                          </div>

                          <div className="hidden sm:flex flex-col items-end gap-2">
                             <div className="w-2 h-2 rounded-full bg-primary/20 animate-pulse" />
                             <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Awaiting Sync</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
