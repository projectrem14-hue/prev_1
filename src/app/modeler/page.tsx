
'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Target, Clock, Plus, Trash2, Save, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Intention {
  id: string;
  name: string;
  description: string;
  category: string;
  effort: number;
  priority: 'low' | 'medium' | 'high';
}

export default function Modeler() {
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [formData, setFormData] = useState<Partial<Intention>>({
    name: '',
    description: '',
    category: 'Work',
    effort: 2,
    priority: 'medium',
  });

  const handleAdd = () => {
    if (!formData.name) return;
    const newIntention: Intention = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name as string,
      description: formData.description || '',
      category: formData.category || 'Work',
      effort: formData.effort || 2,
      priority: formData.priority as any || 'medium',
    };
    setIntentions([...intentions, newIntention]);
    setFormData({ name: '', description: '', category: 'Work', effort: 2, priority: 'medium' });
  };

  const removeIntention = (id: string) => {
    setIntentions(intentions.filter(i => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <header className="mb-10">
          <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Intention Modeler</h1>
          <p className="text-muted-foreground text-lg">Define your goals with precision. Clarity is the first step to consistency.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          <div className="lg:col-span-1">
            <Card className="glass-card sticky top-8 border-none">
              <CardHeader>
                <CardTitle className="font-headline">Define Intention</CardTitle>
                <CardDescription>What are you committing to today?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Goal Title</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g., Design System Audit" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Learning">Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Expected Effort (Hours)</Label>
                    <span className="text-sm font-bold text-primary">{formData.effort}h</span>
                  </div>
                  <Slider 
                    value={[formData.effort || 0]} 
                    max={12} 
                    step={0.5} 
                    onValueChange={([v]) => setFormData({...formData, effort: v})} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Notes / Context</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Break down steps or mention constraints..." 
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full gap-2 rounded-xl py-6 text-base font-semibold" onClick={handleAdd}>
                  <Plus className="w-5 h-5" />
                  Add to Today's Plan
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
                Today's Intention Stack
                <Badge variant="outline" className="bg-primary/10 text-primary border-none">{intentions.length}</Badge>
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full gap-2 border-border/40">
                  <CalendarIcon className="w-4 h-4" />
                  Schedule
                </Button>
                <Button variant="outline" size="sm" className="rounded-full gap-2 bg-primary/10 border-none text-primary">
                  <Save className="w-4 h-4" />
                  Lock Stack
                </Button>
              </div>
            </div>

            {intentions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border/40 rounded-3xl bg-card/10 text-center">
                <Target className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-headline font-semibold mb-1">Your stack is empty</h3>
                <p className="text-muted-foreground max-w-xs">Start by defining your first intention for today in the sidebar.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {intentions.map(item => (
                  <Card key={item.id} className="bg-card/40 border-border/40 overflow-hidden group hover:border-primary/50 transition-all">
                    <div className="flex p-6 gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center font-bold text-primary">
                          {item.effort}h
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-tighter px-1.5 py-0">Effort</Badge>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Badge className="mb-2 bg-primary/15 text-primary border-none hover:bg-primary/20">{item.category}</Badge>
                            <h3 className="font-headline text-xl font-bold">{item.name}</h3>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeIntention(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">{item.description}</p>
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
