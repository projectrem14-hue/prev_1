'use client';

import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { TrendingUp, Target, Brain, ShieldAlert, History, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

const trendData = [
  { name: 'Week 1', consistency: 45, friction: 30 },
  { name: 'Week 2', consistency: 52, friction: 25 },
  { name: 'Week 3', consistency: 48, friction: 35 },
  { name: 'Week 4', consistency: 61, friction: 20 },
  { name: 'Week 5', consistency: 68, friction: 15 },
  { name: 'Week 6', consistency: 72, friction: 12 },
];

const effortData = [
  { subject: 'Work', A: 120, B: 110, fullMark: 150 },
  { subject: 'Health', A: 98, B: 130, fullMark: 150 },
  { subject: 'Personal', A: 86, B: 130, fullMark: 150 },
  { subject: 'Learning', A: 99, B: 100, fullMark: 150 },
  { subject: 'Focus', A: 85, B: 90, fullMark: 150 },
];

const categoryEfficiency = [
  { name: 'Work', efficiency: 85, color: 'hsl(var(--primary))' },
  { name: 'Health', efficiency: 65, color: 'hsl(var(--secondary))' },
  { name: 'Learning', efficiency: 45, color: 'hsl(var(--accent))' },
  { name: 'Personal', efficiency: 92, color: 'hsl(var(--chart-4))' },
];

export default function Insights() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Behavioral Insights</h1>
            <p className="text-muted-foreground text-lg">Long-term analysis of your cognitive alignment and consistency vectors.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl border-border/40 gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button className="rounded-xl gap-2">
              <History className="w-4 h-4" />
              Export Report
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Consistency Trend */}
          <Card className="lg:col-span-8 glass-card border-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Consistency Growth
                  </CardTitle>
                  <CardDescription>Correlation between planned intentions and execution quality over 6 weeks.</CardDescription>
                </div>
                <Badge className="bg-primary/20 text-primary border-none font-mono">+24% Trend</Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorConsistency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Area type="monotone" dataKey="consistency" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorConsistency)" strokeWidth={3} />
                  <Line type="monotone" dataKey="friction" stroke="hsl(var(--destructive))" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Effort Balance */}
          <Card className="lg:col-span-4 glass-card border-none">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Brain className="w-6 h-6 text-accent" />
                Effort Radar
              </CardTitle>
              <CardDescription>Visualizing your energetic distribution across pillars.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={effortData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} axisLine={false} tick={false} />
                  <Radar
                    name="Intended"
                    dataKey="B"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Actual"
                    dataKey="A"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.5}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
          {/* Efficiency by Category */}
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Target className="w-6 h-6 text-secondary" />
                Category Efficiency
              </CardTitle>
              <CardDescription>Where your intentions are most successfully realized.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryEfficiency} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--foreground))', fontWeight: 600}} width={100} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="efficiency" radius={[0, 8, 8, 0]} barSize={32}>
                    {categoryEfficiency.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Friction Logs */}
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-destructive" />
                Critical Leak Patterns
              </CardTitle>
              <CardDescription>Identified root causes of recent deviations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Context Switching", impact: "High", color: "destructive", trend: "Increasing" },
                  { label: "Planning Fallacy", impact: "Medium", color: "secondary", trend: "Stable" },
                  { label: "Digital Friction", impact: "High", color: "destructive", trend: "Decreasing" },
                  { label: "Decision Fatigue", impact: "Low", color: "outline", trend: "Increasing" },
                ].map((leak, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/20">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{leak.label}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">{leak.trend}</span>
                    </div>
                    <Badge variant={leak.color as any} className="rounded-lg">{leak.impact} Impact</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
