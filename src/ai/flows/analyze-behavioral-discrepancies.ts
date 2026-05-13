'use server';
/**
 * @fileOverview This file implements a Genkit flow for the Discrepancy Auditor feature.
 * It analyzes a user's planned intentions against their actual behaviors to identify deviations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PlannedIntentionSchema = z.object({
  id: z.string(),
  description: z.string(),
  expectedEffort: z.string().optional(),
  category: z.string().optional(),
  dueDate: z.string().optional(),
});

const ActualBehaviorSchema = z.object({
  id: z.string().optional(),
  description: z.string(),
  completionStatus: z.enum(['completed', 'partially_completed', 'not_started', 'deviated']),
  notes: z.string().optional(),
  actualTimeSpent: z.string().optional(),
});

const AnalyzeBehavioralDiscrepanciesInputSchema = z.object({
  plannedIntentions: z.array(PlannedIntentionSchema),
  actualBehaviors: z.array(ActualBehaviorSchema),
  analysisContext: z.string().optional(),
});
export type AnalyzeBehavioralDiscrepanciesInput = z.infer<typeof AnalyzeBehavioralDiscrepanciesInputSchema>;

const DiscrepancyDetailSchema = z.object({
  plannedItem: PlannedIntentionSchema.pick({id: true, description: true}),
  actualOutcome: ActualBehaviorSchema.partial().pick({id: true, description: true, completionStatus: true}).optional(),
  deviationExplanation: z.string(),
  inconsistencyReason: z.string(),
  suggestedInsight: z.string(),
});

const AnalyzeBehavioralDiscrepanciesOutputSchema = z.object({
  discrepancies: z.array(DiscrepancyDetailSchema),
});
export type AnalyzeBehavioralDiscrepanciesOutput = z.infer<typeof AnalyzeBehavioralDiscrepanciesOutputSchema>;

export async function analyzeBehavioralDiscrepancies(input: AnalyzeBehavioralDiscrepanciesInput): Promise<AnalyzeBehavioralDiscrepanciesOutput> {
  return analyzeBehavioralDiscrepanciesFlow(input);
}

const analyzeBehavioralDiscrepanciesPrompt = ai.definePrompt({
  name: 'analyzeBehavioralDiscrepanciesPrompt',
  input: { schema: AnalyzeBehavioralDiscrepanciesInputSchema },
  output: { schema: AnalyzeBehavioralDiscrepanciesOutputSchema },
  prompt: `You are a diagnostic AI tool named "Discrepancy Auditor".
Compare a user's planned intentions with their actual recorded behaviors.
Identify deviations and explain *why* they occurred, focusing on root causes and inconsistency patterns.

**Planned Intentions:**
{{#each plannedIntentions}}
- {{{description}}} (Effort: {{{expectedEffort}}})
{{/each}}

**Actual Behaviors:**
{{#each actualBehaviors}}
- {{{description}}} (Status: {{{completionStatus}}})
{{/each}}

**Context:**
{{{analysisContext}}}

Return a JSON analysis focusing on empathy and insight.`,
});

const analyzeBehavioralDiscrepanciesFlow = ai.defineFlow(
  {
    name: 'analyzeBehavioralDiscrepanciesFlow',
    inputSchema: AnalyzeBehavioralDiscrepanciesInputSchema,
    outputSchema: AnalyzeBehavioralDiscrepanciesOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeBehavioralDiscrepanciesPrompt(input);
    return output!;
  }
);
