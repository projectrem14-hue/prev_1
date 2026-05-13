
'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Zap, CheckCircle2, CircleDashed, XCircle, AlertCircle, Clock, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockDailyStack = [
  { id: '1', name: 'Design System Audit', category: 'Work', plannedEffort: '3h', status: 'not_started' },
  { id: '2', name: '5km Morning Run', category: 'Health', plannedEffort: '0.8h', status: 'completed' },
  { id: '3', name: 'Client Proposal Draft', category: 'Work', plannedEffort: '2h', status: 'partially_completed' },
];

export default function RealitySync() {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Reality Sync</h1>
            <p className="text-muted-foreground text-lg">Record what actually happened. Honest logging is the key to closing the gap.</p>
          </div>
          <Button className="rounded-xl gap-2 font-bold bg-primary/20 text-primary border-none hover:bg-primary/30">
            <Save className="w-5 h-5" />
            Finalize Sync
          </Button>
        </header>

        <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-card/50 border border-border/40 p-1 mb-8 rounded-xl h-auto">
            <TabsTrigger value="active" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Current Intentions
            </TabsTrigger>
            <TabsTrigger value="synced" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Synced History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6 pb-12">
            <div className="grid grid-cols-1 gap-6">
              {mockDailyStack.map((item) => (
                <Card key={item.id} className="bg-card/30 border-border/40 border-none glass-card">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
                    <div className="md:col-span-4 space-y-4">
                      <div>
                        <Badge className="mb-2 bg-primary/15 text-primary border-none">{item.category}</Badge>
                        <CardTitle className="font-headline text-2xl">{item.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Planned: {item.plannedEffort}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {[
                          { val: 'completed', icon: CheckCircle2, label: 'Completed', color: 'text-primary' },
                          { val: 'partially_completed', icon: CircleDashed, label: 'Partial', color: 'text-accent' },
                          { val: 'deviated', icon: AlertCircle, label: 'Deviated', color: 'text-yellow-500' },
                          { val: 'not_started', icon: XCircle, label: 'Missed', color: 'text-destructive' },
                        ].map((status) => (
                          <button
                            key={status.val}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all",
                              item.status === status.val 
                                ? "bg-card border-primary/50 text-foreground ring-1 ring-primary/20" 
                                : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            <status.icon className={cn("w-4 h-4", status.color)} />
                            {status.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-8 flex flex-col gap-4">
                      <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Reality Check & Notes</Label>
                      <Textarea 
                        placeholder="Why did this outcome happen? Note any distractions, mood shifts, or context..."
                        className="flex-1 bg-background/50 border-border/40 min-h-[120px] rounded-2xl p-4 focus:ring-primary/20"
                      />
                      <div className="flex justify-end items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground">Actual Time:</Label>
                          <input 
                            type="text" 
                            placeholder="e.g. 2.5h" 
                            className="w-20 bg-background/50 border border-border/40 rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                          />
                        </div>
                        <Button variant="ghost" className="text-primary hover:bg-primary/10 rounded-xl">Save Note</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-center pt-8">
              <Button size="lg" className="rounded-2xl px-12 py-8 h-auto text-xl font-headline font-bold gap-3 shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary to-accent border-none text-white hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 fill-white" />
                Trigger Gap Analysis
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="synced">
            <div className="p-20 text-center text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No history available for the selected period.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
