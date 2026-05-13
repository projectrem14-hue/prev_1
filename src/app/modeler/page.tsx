
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Plus, Clock, Calendar as CalendarIcon, Loader2, Target as TargetIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { addIntention, getIntentionsByDate } from '@/lib/firestore';
import { Intention } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Modeler() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [selectedDate, setSelectedDate] = useState(today);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'work' as const,
    effortEstimate: 3,
    scheduledTime: format(new Date(), 'HH:mm'),
    date: today,
  });

  const fetchIntentions = useCallback(async (date: string) => {
    if (!db || !user) return;
    setLoading(true);
    try {
      const data = await getIntentionsByDate(db, user.uid, date);
      setIntentions(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Load Error", description: "Failed to load intentions." });
    } finally {
      setLoading(false);
    }
  }, [toast, db, user]);

  useEffect(() => {
    document.title = "GapLogic — Intention Modeler";
    if (db && user) {
      fetchIntentions(selectedDate);
    }
  }, [selectedDate, fetchIntentions, db, user]);

  const handleAdd = async () => {
    if (!db || !user) return;
    if (!formData.title) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please enter a title." });
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

      toast({ title: "Intention locked in.", description: `"${formData.title}" added.` });
      setFormData(prev => ({ ...prev, title: '', effortEstimate: 3 }));
      fetchIntentions(selectedDate);
    } catch (error) {
      // Handled centrally
    } finally {
      setSubmitting(false);
    }
  };

  const effortLabels: Record<number, string> = { 1: 'Minimal', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Intense' };
  const categoryColors: Record<string, string> = {
    health: 'bg-emerald-500/15 text-emerald-500',
    work: 'bg-blue-500/15 text-blue-500',
    learning: 'bg-purple-500/15 text-purple-500',
    personal: 'bg-orange-500/15 text-orange-500',
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex">
        <Navigation />
        <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Intention Modeler</h1>
              <p className="text-muted-foreground text-lg">Define your goals with precision.</p>
            </div>
            <div className="flex flex-col gap-2 min-w-[200px]">
              <Label htmlFor="view-date" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Planning Date</Label>
              <Input 
                id="view-date" type="date" value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-card/50 border-border/40 rounded-xl"
              />
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-none sticky top-8">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Pencil className="w-5 h-5 text-primary" /> Draft Intention</CardTitle>
                <CardDescription>Specify your behavioral commitment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input 
                    id="title" placeholder="e.g., Deep Work Session" 
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="bg-background/50 h-12 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v as any})}>
                      <SelectTrigger id="category" className="bg-background/50 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" value={formData.scheduledTime} onChange={e => setFormData({...formData, scheduledTime: e.target.value})} className="bg-background/50 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center"><Label>Effort Intensity</Label><Badge variant="outline" className="text-primary">{effortLabels[formData.effortEstimate]}</Badge></div>
                  <Slider value={[formData.effortEstimate]} min={1} max={5} step={1} onValueChange={([v]) => setFormData({...formData, effortEstimate: v})} />
                </div>
              </CardContent>
              <CardFooter><Button className="w-full gap-2 rounded-xl py-6 font-bold shadow-lg shadow-primary/20" onClick={handleAdd} disabled={submitting}>{submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} Lock in Stack</Button></CardFooter>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <h2 className="font-headline text-2xl font-bold flex items-center gap-3">Your Stack <Badge className="bg-primary/20 text-primary border-none">{intentions.length}</Badge></h2>
              {loading ? <Skeleton className="h-44 w-full rounded-2xl" /> : intentions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-3xl bg-card/10 text-center">
                  <TargetIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Nothing planned for this date yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {intentions.map(item => (
                    <Card key={item.id} className="bg-card/30 border-none glass-card">
                      <div className="p-6 flex items-center gap-6">
                        <div className="text-center min-w-[50px]"><div className="text-[10px] font-bold text-muted-foreground uppercase">Effort</div><div className="text-2xl font-bold font-headline text-primary">{item.effortEstimate}</div></div>
                        <div className="flex-1">
                          <Badge className={cn("mb-2 border-none capitalize", categoryColors[item.category])}>{item.category}</Badge>
                          <h3 className="font-headline text-xl font-bold">{item.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {item.scheduledTime}</span>
                            <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> {item.date}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
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
