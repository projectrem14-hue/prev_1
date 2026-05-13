
'use client';

import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { ArrowUpRight, TrendingDown, Target, Zap, AlertCircle } from 'lucide-react';

const mockGapData = [
  { name: 'Mon', planned: 5, actual: 4 },
  { name: 'Tue', planned: 6, actual: 2 },
  { name: 'Wed', planned: 4, actual: 4 },
  { name: 'Thu', planned: 7, actual: 3 },
  { name: 'Fri', planned: 5, actual: 5 },
  { name: 'Sat', planned: 3, actual: 1 },
  { name: 'Sun', planned: 2, actual: 0 },
];

const mockCategoryData = [
  { name: 'Work', value: 45 },
  { name: 'Health', value: 25 },
  { name: 'Personal', value: 20 },
  { name: 'Chores', value: 10 },
];

const COLORS = ['#B794F4', '#638BFF', '#9F7AEA', '#4C51BF'];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      
      <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Cognitive Dashboard</h1>
            <p className="text-muted-foreground text-lg">Visualizing the gap between your intentions and reality.</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-border/40 bg-card/30">
              Week Ending Oct 24
            </Badge>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Intention Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline">68%</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-destructive" />
                -12% from last week
              </p>
              <Progress value={68} className="h-1.5 mt-4" />
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                Friction Leaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline">4.2h</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-primary" />
                Lost to distractions daily
              </p>
              <div className="flex gap-1 mt-4">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < 5 ? 'bg-accent' : 'bg-muted'}`} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                Critical Deviations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline">3</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                Focus priorities ignored
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="destructive" className="rounded-full h-2 w-2 p-0" />
                <Badge variant="destructive" className="rounded-full h-2 w-2 p-0" />
                <Badge variant="destructive" className="rounded-full h-2 w-2 p-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="font-headline">Intention vs Reality</CardTitle>
              <CardDescription>Daily comparison of planned tasks vs actual completions.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockGapData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                    cursor={{fill: 'hsl(var(--muted)/0.2)'}}
                  />
                  <Bar dataKey="planned" fill="hsl(var(--primary)/0.4)" radius={[4, 4, 0, 0]} name="Planned" />
                  <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="font-headline">Friction Distribution</CardTitle>
              <CardDescription>Where your intentions are failing most frequently.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Primary Leak</span>
                <span className="text-xl font-bold font-headline">Work</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-2xl font-bold">Recent Discrepancies</h2>
            <Badge className="bg-primary/20 text-primary border-none hover:bg-primary/30 cursor-pointer">View Audit History</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[
              { id: 1, task: "Deep work session (2hrs)", status: "Deviated", reason: "Context switching", time: "2h ago" },
              { id: 2, task: "Morning run", status: "Not Started", reason: "Sleep deprivation", time: "8h ago" },
              { id: 3, task: "Client proposal review", status: "Partially", reason: "Urgent meeting overlap", time: "Yesterday" },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-card/40 border border-border/40 hover:bg-card/60 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Target className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{item.task}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      {item.reason}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1 bg-background/50">{item.status}</Badge>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
