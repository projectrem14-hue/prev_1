
'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BrainCircuit, RefreshCw, Zap, Lightbulb, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';
import { analyzeBehavioralDiscrepancies, AnalyzeBehavioralDiscrepanciesOutput } from '@/ai/flows/analyze-behavioral-discrepancies';
import { generatePersonalizedRecommendations, GeneratePersonalizedRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';

// Mock data to feed into AI
const plannedIntentions = [
  { id: '1', description: 'Deep Work: Project Alpha Design', expectedEffort: '3 hours', category: 'Work' },
  { id: '2', description: 'Daily Exercise: 5km Run', expectedEffort: '45 mins', category: 'Health' },
  { id: '3', description: 'Skill Study: React Server Components', expectedEffort: '1 hour', category: 'Learning' },
];

const actualBehaviors = [
  { id: '1', description: 'Checked emails, started design but got distracted by slack', completionStatus: 'partially_completed' as const, actualTimeSpent: '1.5 hours' },
  { id: '2', description: 'Skipped run due to rainy weather and low energy', completionStatus: 'not_started' as const, notes: 'Feeling sluggish' },
  { id: '3', description: 'Completed study session late at night', completionStatus: 'completed' as const, actualTimeSpent: '1 hour' },
];

export default function Pivot() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeBehavioralDiscrepanciesOutput | null>(null);
  const [recommendations, setRecommendations] = useState<GeneratePersonalizedRecommendationsOutput | null>(null);

  const runAudit = async () => {
    setLoading(true);
    try {
      const auditResult = await analyzeBehavioralDiscrepancies({
        plannedIntentions,
        actualBehaviors,
        analysisContext: "User reported feeling slightly burnt out. Weather was poor."
      });
      setAnalysis(auditResult);

      const pivotResult = await generatePersonalizedRecommendations({
        userGoals: "Achieve better focus during deep work hours and maintain physical health consistency.",
        discrepanciesSummary: auditResult.discrepancies.map(d => d.deviationExplanation).join('. '),
        plannedTasks: plannedIntentions.map(i => ({ name: i.description, description: i.category, expectedEffortHours: 2 })),
        actualBehaviors: actualBehaviors.map(b => ({ name: b.description, completed: b.completionStatus === 'completed', actualEffortHours: 1 }))
      });
      setRecommendations(pivotResult);
    } catch (error) {
      console.error("AI Flow failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Navigation />
      
      <main className="flex-1 ml-64 p-8 lg:p-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">Cognitive Pivot</h1>
            <p className="text-muted-foreground text-lg">AI-driven auditing of your behavioral leaks and strategic workflow adjustments.</p>
          </div>
          <Button 
            onClick={runAudit} 
            disabled={loading}
            className="rounded-2xl px-8 py-6 h-auto text-lg font-bold gap-3 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <BrainCircuit className="w-6 h-6" />}
            {loading ? 'Analyzing...' : 'Run Discrepancy Audit'}
          </Button>
        </header>

        {!analysis && !loading && (
          <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border/40 rounded-3xl bg-card/10 text-center max-w-2xl mx-auto mt-12">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
              <RefreshCw className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <h3 className="text-2xl font-headline font-semibold mb-2">Ready for Diagnosis</h3>
            <p className="text-muted-foreground mb-8 text-balance">GapLogic needs to analyze your recent intentions against your reality logs to find inconsistency patterns.</p>
            <Button variant="secondary" onClick={runAudit} className="rounded-xl px-6">Generate First Insights</Button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 opacity-50 pointer-events-none grayscale pb-12">
            <div className="space-y-6">
              <div className="h-[400px] bg-card rounded-3xl animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-[400px] bg-card rounded-3xl animate-pulse" />
            </div>
          </div>
        )}

        {(analysis || recommendations) && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12">
            {/* Discrepancy Auditor Results */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
                  <Zap className="w-6 h-6 text-accent" />
                  Audit Findings
                </h2>
                <Badge variant="outline" className="rounded-full border-accent/30 text-accent bg-accent/5 font-mono">V.2.1-Flash</Badge>
              </div>

              <div className="space-y-4">
                {analysis?.discrepancies.map((d, i) => (
                  <Card key={i} className="bg-card/40 border-border/40 hover:bg-card/60 transition-colors cursor-default border-l-4 border-l-destructive/50">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[10px] uppercase text-muted-foreground">{d.inconsistencyReason}</Badge>
                      </div>
                      <CardTitle className="text-lg font-headline mt-1">{d.plannedItem.description}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{d.deviationExplanation}</p>
                      <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
                        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" /> Root Insight
                        </p>
                        <p className="text-sm italic text-foreground/90">"{d.suggestedInsight}"</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pivot Engine Recommendations */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Pivot Strategy
                </h2>
              </div>

              <div className="grid gap-6">
                {recommendations?.recommendations.map((r, i) => (
                  <Card key={i} className="glass-card overflow-hidden group hover:border-primary/40 transition-all">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Badge className="bg-accent/20 text-accent border-none mb-2">{r.category}</Badge>
                          <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors">{r.title}</CardTitle>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                          <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed">{r.description}</p>
                        <div className="pt-4 border-t border-border/40">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Strategic Rationale</p>
                          <p className="text-sm text-foreground/80 italic">{r.rationale}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
