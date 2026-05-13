
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Target, Clock, Plus, Trash2, Calendar as CalendarIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { addIntention, getIntentionsByDate } from '@/lib/firestore';
import { Intention } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Modeler() {
  const { toast } = useToast();
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
    setLoading(true);
    try {
      const data = await getIntentionsByDate(date);
      setIntentions(data);
    } catch (error) {
      console.error("Error fetching intentions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntentions(selectedDate);
  }, [selectedDate, fetchIntentions]);

  const handleAdd = async () => {
    if (!formData.title || !formData.scheduledTime || !formData.date) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill out all fields before locking in your intention.",
      });
      return;
    }

    setSubmitting(true);
    try {
      addIntention({
        title: formData.title,
        category: formData.category,
        effortEstimate: formData.effortEstimate,
        scheduledTime: formData.scheduledTime,
        date: formData.date,
      });

      toast({
        title: "Intention locked in.",
        description: `"${formData.title}" has been added to your stack.`,
      });

      // Reset form (except date)
      setFormData(prev => ({
        ...prev,
        title: '',
        effortEstimate: 3,
        scheduledTime: format(new Date(), 'HH:mm'),
      }));

      // Refresh if the added intention is for the currently viewed date
      if (formData.date === selectedDate) {
        fetchIntentions(selectedDate);
      } else {
        setSelectedDate(formData.date);
      }
    } catch (error) {
      console.error("Error saving intention:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const effortLabels: Record<number, string> = {
    1: 'Minimal',
    2: 'Low',
    3: 'Moderate',
    4: 'High',
    5: 'Intense'
  };

  const categoryColors: Record<string, string> = {
    health: 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25',
    work: 'bg-blue-500/15 text-blue-500 hover:bg-blue-500/25',
    learning: 'bg-purple-500/15 text-purple-500 hover:bg-purple-500/25',
    personal: 'bg-orange-500/15 text-orange-500 hover:bg-orange-500/25',
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Intention Modeler</h1>
            <p className="text-muted-foreground text-lg">Define your goals with precision. Clarity is the first step to consistency.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="view-date" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Viewing Date</Label>
            <Input 
              id="view-date"
              type="date"
              className="bg-card/50 border-border/40 rounded-xl"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* Input Form Column */}
          <div className="lg:col-span-1">
            <Card className="glass-card sticky top-8 border-none">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Define Intention
                </CardTitle>
                <CardDescription>What are you committing to?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Design System Audit" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="bg-background/50 border-border/40"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={v => setFormData({...formData, category: v as any})}
                    >
                      <SelectTrigger id="category" className="bg-background/50 border-border/40">
                        <SelectValue placeholder="Category" />
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
                    <Input 
                      id="time" 
                      type="time"
                      value={formData.scheduledTime}
                      onChange={e => setFormData({...formData, scheduledTime: e.target.value})}
                      className="bg-background/50 border-border/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Scheduled Date</Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="bg-background/50 border-border/40"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <Label>Effort Intensity</Label>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {effortLabels[formData.effortEstimate]}
                    </Badge>
                  </div>
                  <Slider 
                    value={[formData.effortEstimate]} 
                    min={1}
                    max={5} 
                    step={1} 
                    onValueChange={([v]) => setFormData({...formData, effortEstimate: v})} 
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full gap-2 rounded-xl py-6 text-base font-semibold shadow-lg shadow-primary/20" 
                  onClick={handleAdd}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  Lock in Today
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* List Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold flex items-center gap-3">
                {selectedDate === today ? "Today's Stack" : `Stack for ${selectedDate}`}
                <Badge variant="outline" className="bg-primary/10 text-primary border-none px-3">
                  {intentions.length}
                </Badge>
              </h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="bg-card/40 border-border/40 h-24 animate-pulse" />
                ))}
              </div>
            ) : intentions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border/40 rounded-3xl bg-card/10 text-center">
                <Target className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-headline font-semibold mb-1">Stack is empty</h3>
                <p className="text-muted-foreground max-w-xs">Nothing stacked for this day. Add your first intention in the sidebar.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {intentions.map(item => (
                  <Card key={item.id} className="bg-card/40 border-border/40 overflow-hidden group hover:border-primary/50 transition-all border-none glass-card">
                    <div className="flex p-6 gap-6 items-center">
                      <div className="flex flex-col items-center gap-1 min-w-[60px]">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Effort</div>
                        <div className="text-2xl font-bold font-headline text-primary">
                          {item.effortEstimate}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <Badge className={cn("mb-2 border-none capitalize", categoryColors[item.category])}>
                              {item.category}
                            </Badge>
                            <h3 className="font-headline text-xl font-bold">{item.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {item.scheduledTime}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {item.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center pr-2">
                         <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center opacity-40">
                           <CheckCircle2 className="w-5 h-5 text-primary" />
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
  );
}
