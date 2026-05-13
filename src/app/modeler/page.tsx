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
import { Plus, Loader2, Layers, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
      // Handled centrally
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex">
        <Navigation />
        <main className="flex-1 md:ml-64 p-6 lg:p-10 pb-20 max-w-6xl mx-auto w-full">
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Intention Modeler</h1>
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Focus Date</Label>
              <Input 
                type="date" value={selectedDate} 
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setFormData(prev => ({ ...prev, date: e.target.value }));
                }}
                className="w-44 h-10 rounded-lg bg-card"
              />
            </div>
          </header>

          <div className="grid grid-cols-1 gap-10">
            <Card className="clean-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Establish New Intention
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Task Title</Label>
                    <Input 
                      placeholder="e.g. Deep Work Session" 
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                      className="rounded-lg h-12 text-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Domain</Label>
                      <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v as any})}>
                        <SelectTrigger className="rounded-lg h-12">
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
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration (Min)</Label>
                      <Input 
                        type="number" value={formData.estimatedDuration} 
                        onChange={e => setFormData({...formData, estimatedDuration: parseInt(e.target.value) || 25})} 
                        className="rounded-lg h-12"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Anticipated Effort</Label>
                      <span className="text-sm font-bold text-primary">{formData.effortEstimate}/5</span>
                    </div>
                    <Slider 
                      value={[formData.effortEstimate]} 
                      min={1} max={5} step={1} 
                      onValueChange={([v]) => setFormData({...formData, effortEstimate: v})} 
                      className="py-4"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full h-14 text-lg font-bold gap-2 mt-2" 
                    onClick={handleAdd} 
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} 
                    Add to Stack
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Layers className="w-6 h-6 text-primary" />
                Your Cognitive Stack
                <Badge variant="secondary" className="ml-2 px-2 h-6 text-xs font-bold">
                  {filteredIntentions.length} Tasks
                </Badge>
              </h2>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card border rounded-xl animate-pulse" />)}
                </div>
              ) : filteredIntentions.length === 0 ? (
                <div className="p-20 border border-dashed rounded-2xl text-center text-muted-foreground">
                  No intentions established for this date.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredIntentions.map((item) => (
                    <div key={item.id} className="clean-card p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-bold tracking-wider">
                          {item.category}
                        </Badge>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">Effort</p>
                          <p className="text-sm font-bold text-primary">{item.effortEstimate}/5</p>
                        </div>
                      </div>
                      <p className="font-bold text-lg leading-tight">{item.title}</p>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">{item.estimatedDuration} Minutes</span>
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