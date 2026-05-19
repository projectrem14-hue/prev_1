'use client';

import { useState, useEffect, useMemo } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { addIntention } from '@/lib/firestore';
import { useData, PUBLIC_USER_ID } from '@/lib/DataContext';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { format } from 'date-fns';
import { Plus, Loader2, Layers, Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Modeler() {
  const { toast } = useToast();
  const db = useFirestore();
  const { intentions, loading } = useData();
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
    if (!db) return;
    if (!formData.title) {
      toast({ variant: "destructive", title: "Missing Title", description: "Please name your intention." });
      return;
    }

    setSubmitting(true);
    try {
      addIntention(db, PUBLIC_USER_ID, {
        title: formData.title,
        category: formData.category,
        effortEstimate: formData.effortEstimate,
        estimatedDuration: formData.estimatedDuration,
        scheduledTime: formData.scheduledTime,
        date: formData.date,
      });

      toast({ title: "Intention Locked", description: "Added to your behavioral stack." });
      setFormData(prev => ({ ...prev, title: '', effortEstimate: 3, estimatedDuration: 25 }));
    } catch (error) {
      // Handled centrally
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation />
      <main className="flex-1 md:ml-64 p-6 lg:p-10 max-w-5xl mx-auto w-full space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Intention Modeler</h1>
            <p className="text-muted-foreground">Architect your behavioral session.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Selected Timeline</Label>
            <div className="flex items-center gap-2 bg-card border rounded-xl p-2 pr-4 shadow-sm">
              <Calendar className="w-5 h-5 text-primary ml-2" />
              <Input 
                type="date" value={selectedDate} 
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setFormData(prev => ({ ...prev, date: e.target.value }));
                }}
                className="w-40 border-none bg-transparent h-9 focus-visible:ring-0 text-sm font-bold"
              />
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-10">
          <Card className="clean-card shadow-sm border-primary/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                New Behavioral Intention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Task Definition</Label>
                    <Input 
                      placeholder="e.g. Strategic Planning Session" 
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                      className="rounded-xl h-14 text-lg bg-background font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Domain</Label>
                      <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v as any})}>
                        <SelectTrigger className="rounded-xl h-12 bg-background font-bold capitalize">
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
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Time (Min)</Label>
                      <Input 
                        type="number" value={formData.estimatedDuration} 
                        onChange={e => setFormData({...formData, estimatedDuration: parseInt(e.target.value) || 25})} 
                        className="rounded-xl h-12 bg-background font-bold"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Predicted Effort Required</Label>
                      <Badge variant="outline" className="border-primary/20 text-primary h-7 px-4 font-bold">{formData.effortEstimate}/5</Badge>
                    </div>
                    <Slider 
                      value={[formData.effortEstimate]} 
                      min={1} max={5} step={1} 
                      onValueChange={([v]) => setFormData({...formData, effortEstimate: v})} 
                      className="py-4"
                    />
                  </div>
                  <Button 
                    className="w-full h-14 text-lg font-bold gap-3 rounded-xl shadow-lg shadow-primary/10" 
                    onClick={handleAdd} 
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} 
                    Establish Intention
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Layers className="w-6 h-6 text-primary" />
                Cognitive Stack
              </h2>
              <Badge variant="secondary" className="px-4 h-7 text-[10px] font-bold uppercase tracking-widest">
                {filteredIntentions.length} Defined
              </Badge>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-44 bg-card border rounded-2xl animate-pulse" />)}
              </div>
            ) : filteredIntentions.length === 0 ? (
              <div className="p-20 border-2 border-dashed border-border rounded-3xl text-center text-muted-foreground bg-card/20">
                <p className="font-medium">No intentions established for this date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIntentions.map((item) => (
                  <Card key={item.id} className="clean-card p-6 flex flex-col justify-between h-44 hover:border-primary/30 transition-all cursor-default group">
                    <div className="flex justify-between items-start">
                      <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-bold tracking-widest px-3 h-6">
                        {item.category}
                      </Badge>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Effort</p>
                        <p className="text-sm font-bold text-primary">{item.effortEstimate}/5</p>
                      </div>
                    </div>
                    <p className="font-bold text-lg leading-tight line-clamp-2">{item.title}</p>
                    <div className="flex items-center gap-2 text-muted-foreground pt-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{item.estimatedDuration} Minutes</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
