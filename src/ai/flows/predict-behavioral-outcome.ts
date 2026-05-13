'use server';
/**
 * @fileOverview This file implements a Genkit flow for the Predictive Behavior Audit.
 * It predicts the likely outcome of an intention based on historical behavioral patterns.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const HistoricalLogSchema = z.object({
  title: z.string(),
  category: z.string(),
  effort: z.number(),
  completed: z.boolean(),
  friction: z.string().optional(),
  date: z.string(),
});

const PredictBehavioralOutcomeInputSchema = z.object({
  history: z.array(HistoricalLogSchema),
  currentIntention: z.object({
    title: z.string(),
    category: z.string(),
    effort: z.number(),
    scheduledTime: z.string(),
    date: z.string(),
  }),
});
export type PredictBehavioralOutcomeInput = z.infer<typeof PredictBehavioralOutcomeInputSchema>;

const PredictBehavioralOutcomeOutputSchema = z.object({
  prediction: z.enum(['completed', 'missed', 'partially_completed']),
  probability: z.number().describe('Confidence level from 0 to 1'),
  reasoning: z.string().describe('A brief explanation of why this outcome is predicted based on history.'),
  suggestedAction: z.string().describe('A small tweak to increase the chance of completion.'),
});
export type PredictBehavioralOutcomeOutput = z.infer<typeof PredictBehavioralOutcomeOutputSchema>;

export async function predictBehavioralOutcome(input: PredictBehavioralOutcomeInput): Promise<PredictBehavioralOutcomeOutput> {
  return predictBehavioralOutcomeFlow(input);
}

const predictPrompt = ai.definePrompt({
  name: 'predictBehavioralOutcomePrompt',
  input: { schema: PredictBehavioralOutcomeInputSchema },
  output: { schema: PredictBehavioralOutcomeOutputSchema },
  prompt: `You are the "GapLogic Predictor", a behavioral science AI.
Analyze the user's historical performance to predict the outcome of their current intention.

### History (Past Intentions and Outcomes):
{{#each history}}
- {{{title}}} ({{{category}}}) | Effort: {{{effort}}} | Result: {{#if completed}}Completed{{else}}Missed{{/if}} | Notes: {{{friction}}}
{{/each}}

### Current Intention:
- Title: {{{currentIntention.title}}}
- Category: {{{currentIntention.category}}}
- Effort Level: {{{currentIntention.effort}}}
- Scheduled Time: {{{currentIntention.scheduledTime}}}
- Date: {{{currentIntention.date}}}

### Task:
Predict if the user will actually complete this task. Identify patterns like "struggles with health on Mondays" or "overestimates work capacity when effort is > 4".
Be precise, empathetic, and diagnostic.`,
});

const predictBehavioralOutcomeFlow = ai.defineFlow(
  {
    name: 'predictBehavioralOutcomeFlow',
    inputSchema: PredictBehavioralOutcomeInputSchema,
    outputSchema: PredictBehavioralOutcomeOutputSchema,
  },
  async (input) => {
    const { output } = await predictPrompt(input);
    return output!;
  }
);
