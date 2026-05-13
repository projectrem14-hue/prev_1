
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { TrendingUp, Brain } from 'lucide-react';
import { getAllIntentions, getAllRealityLogs } from '@/lib/firestore';
import { Intention, RealityLog } from '@/lib/schema';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import Link from 'next/link';

export default function Insights() {
  const { toast } = useToast();
  const db = useFirestore();
  const [loading, setLoading] = useState(true);
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [logs, setLogs] = useState<RealityLog[]>([]);

  useEffect(() => {
    document.title = "GapLogic — Behavioral Insights";
    if (!db) return;

    async function fetchData() {
      try {
        const [allIntentions, allLogs] = await Promise.all([
          getAllIntentions(db), 
          getAllRealityLogs(db)
        ]);
        setIntentions(allIntentions);
        setLogs(allLogs);
      } catch (error) {
        toast({ variant: "destructive", title: "Insights Error", description: "Failed to load visualization data." });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, db]);

  const stats = useMemo(() => {
    if (intentions.length === 0) return null;
    const completed = logs.filter(l => l.completed).length;
    const categories = ['health', 'work', 'learning', 'personal'] as const;
    const catPerf = categories.map(cat => {
      const catInt = intentions.filter(i => i.category === cat);
      const catDone = logs.filter(l => intentions.find(i => i.id === l.intentionId)?.category === cat && l.completed);
      return { cat, rate: catInt.length > 0 ? catDone.length / catInt.length : 0 };
    });
    
    const sorted = [...catPerf].sort((a,b) => b.rate - a.rate);
    const best = sorted[0]?.cat || 'none';
    const worst = sorted[sorted.length - 1]?.cat || 'none';

    return {
      total: intentions.length,
      rate: Math.round((completed / intentions.length) * 100) || 0,
      best,
      worst
    };
  }, [intentions, logs]);

  const dailyTrend = useMemo(() => {
    return eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() }).map(day => {
      const d = format(day, 'yyyy-MM-dd');
      const dayInt = intentions.filter(i => i.date === d);
      const dayDone = logs.filter(l => l.date === d && l.completed);
      return { 
        name: format(day, 'MMM dd'), 
        rate: dayInt.length > 0 ? Math.round((dayDone.length / dayInt.length) * 100) : 0 
      };
    });
  }, [intentions, logs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex"><Navigation />
        <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12"><Skeleton className="h-12 w-96 mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10"><Skeleton className="h-[400px] rounded-3xl" /><Skeleton className="h-[400px] rounded-3xl" /></div>
        </main>
      </div>
    );
  }

  const uniqueDays = new Set(intentions.map(i => i.date)).size;
  if (uniqueDays < 3) {
    return (
      <div className="min-h-screen bg-background text-foreground flex"><Navigation />
        <main className="flex-1 md:ml-64 p-6 lg:p-12 flex flex-col items-center justify-center text-center pb-24 md:pb-12">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6"><TrendingUp className="w-12 h-12 text-primary" /></div>
          <h2 className="text-3xl font-headline font-bold mb-4">Insufficient History</h2>
          <p className="text-muted-foreground mb-8 max-w-md">Analytics unlock after 3 days of behavioral data. Keep stacking your intentions.</p>
          <Link href="/modeler"><Button size="lg" className="rounded-2xl h-14 font-bold shadow-xl shadow-primary/20 px-10 bg-primary text-primary-foreground">Build Your Stack</Button></Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex"><Navigation />
      <main className="flex-1 md:ml-64 p-6 lg:p-12 pb-24 md:pb-12">
        <header className="mb-10">
          <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Behavioral Insights</h1>
          <p className="text-muted-foreground text-lg">Statistical analysis of your cognitive consistency vectors.</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <Card className="glass-card p-6"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Logs</p><div className="text-3xl font-bold font-headline">{stats?.total}</div></Card>
          <Card className="glass-card p-6"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Compliance</p><div className="text-3xl font-bold font-headline">{stats?.rate}%</div></Card>
          <Card className="glass-card p-6"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Best Pillar</p><div className="text-3xl font-bold font-headline capitalize text-primary">{stats?.best}</div></Card>
          <Card className="glass-card p-6"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Friction Pillar</p><div className="text-3xl font-bold font-headline capitalize text-destructive">{stats?.worst}</div></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Card className="glass-card border-none">
            <CardHeader><CardTitle className="font-headline flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Consistency Growth</CardTitle></CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend}>
                  <defs><linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#effeaff" stopOpacity={0.3}/><stop offset="95%" stopColor="#effeaff" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="rate" stroke="#effeaff" fill="url(#colorRate)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="glass-card border-none">
            <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Brain className="w-5 h-5 text-primary" /> Efficiency Vector</CardTitle></CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px' }} />
                  <Bar dataKey="rate" fill="#effeaff" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
