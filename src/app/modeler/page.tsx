'use client';

import { useState, useEffect, useMemo } from 'react';
import { Navigation } from '@/components/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { addIntention } from '@/lib/firestore';
import { useData } from '@/lib/DataContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { useFirestore } from '@/firebase';
import { format } from 'date-fns';
import { Plus, Loader2, Layers, Clock, BrainCircuit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
    document.title = "GapLogic — Modeler";
  }, []);

  const filteredIntentions = useMemo(() => {
    return intentions.filter(i => i.date === selectedDate);
  }, [intentions, selectedDate]);

  const handleAdd = async () => {
    if (!user || !db) return;
    if (!formData.title) {
      toast({ variant: "destructive", title: "Error", description: "Title is required." });
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

      toast({ title: "Success", description: "Intention added." });
      setFormData(prev => ({ ...prev, title: '', effortEstimate: 3, estimatedDuration: 25 }));
      await refresh();
    } catch (error) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex">
        <Navigation />
        <main className="flex-1 md:ml-64 p-6 lg:p-10 pb-20 max-w-5xl mx-auto w-full">
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Modeler</h1>
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Focus Date</Label>
              <Input 
                type="date" value={selectedDate} 
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setFormData(prev => ({ ...prev, date: e.target.value }));
                }}
                className="w-40 h-9 rounded-lg"
              />
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-2">
              <Card className="clean-card shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" />
                    New Intention
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Title</Label>
                    <Input 
                      placeholder="e.g. Morning Meditation" 
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                      className="rounded-lg h-10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Domain</Label>
                      <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v as any})}>
                        <SelectTrigger className="rounded-lg h-10">
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
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Time (Min)</Label>
                      <Input 
                        type="number" value={formData.estimatedDuration} 
                        onChange={e => setFormData({...formData, estimatedDuration: parseInt(e.target.value) || 25})} 
                        className="rounded-lg h-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Effort</Label>
                      <span className="text-xs font-bold text-primary">{formData.effortEstimate}/5</span>
                    </div>
                    <Slider 
                      value={[formData.effortEstimate]} 
                      min={1} max={5} step={1} 
                      onValueChange={([v]) => setFormData({...formData, effortEstimate: v})} 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full standard-button gap-2" 
                    onClick={handleAdd} 
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} 
                    Save Intention
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="lg:col-span-3 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Your Stack
                <Badge variant="secondary" className="ml-2 px-1.5 h-4 text-[10px] font-bold">
                  {filteredIntentions.length}
                </Badge>
              </h2>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-16 bg-card rounded-lg animate-pulse" />)}
                </div>
              ) : filteredIntentions.length === 0 ? (
                <div className="p-12 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
                  Empty for this date.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredIntentions.map((item) => (
                    <div key={item.id} className="clean-card p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-bold text-sm">{item.title}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-[8px] h-3.5 border-none bg-secondary">
                            {item.category}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.estimatedDuration}m
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold uppercase text-muted-foreground">Effort</p>
                        <p className="text-xs font-bold text-primary">{item.effortEstimate}/5</p>
                      </div>
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