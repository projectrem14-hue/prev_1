'use server';
/**
 * @fileOverview This file implements a Genkit flow for the Discrepancy Auditor feature.
 * It analyzes a user's planned intentions against their actual behaviors to identify deviations,
 * explain the root causes of these inconsistencies, and provide actionable insights.
 *
 * - analyzeBehavioralDiscrepancies - The main function to call the AI flow for discrepancy analysis.
 * - AnalyzeBehavioralDiscrepanciesInput - The input type for the analysis.
 * - AnalyzeBehavioralDiscrepanciesOutput - The output type containing identified discrepancies and explanations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema for the behavioral discrepancy analysis.
const PlannedIntentionSchema = z.object({
  id: z.string().describe('Unique identifier for the planned intention.'),
  description: z.string().describe('Detailed description of the planned task or goal.'),
  expectedEffort: z.string().optional().describe('Expected effort level for the task (e.g., "high", "medium", "low", "1 hour").'),
  category: z.string().optional().describe('Category of the intention (e.g., "work", "personal", "health").'),
  dueDate: z.string().optional().describe('Optional due date for the intention (e.g., "YYYY-MM-DD").'),
});

const ActualBehaviorSchema = z.object({
  id: z.string().optional().describe('Unique identifier for the actual behavior, if it maps to a planned intention.'),
  description: z.string().describe('Description of the actual action taken or not taken.'),
  completionStatus: z.enum(['completed', 'partially_completed', 'not_started', 'deviated']).describe('Status of the behavior relative to a planned intention.'),
  notes: z.string().optional().describe('Any additional notes about the actual behavior or context.'),
  actualTimeSpent: z.string().optional().describe('Actual time spent on the activity (e.g., "30 minutes").'),
});

export const AnalyzeBehavioralDiscrepanciesInputSchema = z.object({
  plannedIntentions: z.array(PlannedIntentionSchema).describe('A list of daily planned tasks, goals, and intentions.'),
  actualBehaviors: z.array(ActualBehaviorSchema).describe('A list of recorded actual actions, completion statuses, and any relevant notes.'),
  analysisContext: z.string().optional().describe('Additional context for the analysis, such as the date, user mood, or specific external events.'),
});
export type AnalyzeBehavioralDiscrepanciesInput = z.infer<typeof AnalyzeBehavioralDiscrepanciesInputSchema>;

// Output schema for the behavioral discrepancy analysis.
const DiscrepancyDetailSchema = z.object({
  plannedItem: PlannedIntentionSchema.pick(['id', 'description']).describe('The planned intention that was analyzed.'),
  actualOutcome: ActualBehaviorSchema.partial().pick(['id', 'description', 'completionStatus']).optional().describe('The actual outcome observed for the planned item, if any. Can be partial if only status is relevant.'),
  deviationExplanation: z.string().describe('A detailed explanation of why the deviation occurred, considering external factors, internal motivations, and potential cognitive biases.'),
  inconsistencyReason: z.string().describe('The identified root cause or pattern of inconsistency (e.g., "Lack of motivation", "External distraction", "Poor time management", "Unrealistic planning", "Task too daunting").'),
  suggestedInsight: z.string().describe('A concise, actionable insight or takeaway derived from this specific discrepancy.'),
});

export const AnalyzeBehavioralDiscrepanciesOutputSchema = z.object({
  discrepancies: z.array(DiscrepancyDetailSchema).describe('A list of identified discrepancies, their explanations, root causes, and insights.'),
});
export type AnalyzeBehavioralDiscrepanciesOutput = z.infer<typeof AnalyzeBehavioralDiscrepanciesOutputSchema>;

/**
 * Initiates the behavioral discrepancy analysis using the Genkit AI flow.
 *
 * @param input - An object containing planned intentions and actual behaviors for analysis.
 * @returns A promise that resolves to an object containing identified discrepancies and their explanations.
 */
export async function analyzeBehavioralDiscrepancies(input: AnalyzeBehavioralDiscrepanciesInput): Promise<AnalyzeBehavioralDiscrepanciesOutput> {
  return analyzeBehavioralDiscrepanciesFlow(input);
}

const analyzeBehavioralDiscrepanciesPrompt = ai.definePrompt({
  name: 'analyzeBehavioralDiscrepanciesPrompt',
  input: { schema: AnalyzeBehavioralDiscrepanciesInputSchema },
  output: { schema: AnalyzeBehavioralDiscrepanciesOutputSchema },
  prompt: `You are a diagnostic AI tool named "Discrepancy Auditor" specializing in analyzing human behavior.
Your task is to compare a user's planned intentions with their actual recorded behaviors for a given period.
Identify each instance where the actual behavior deviated from the planned intention.
For each deviation, you MUST provide a detailed explanation of *why* it occurred, focusing on uncovering the root causes, underlying patterns of inconsistency, and offering a concise insight.

**Instructions for Analysis:**
1.  **Compare and Identify:** Carefully compare each item in 'Planned Intentions' with the 'Actual Behaviors'. Link them where possible (e.g., by description or inferred intent).
2.  **Explain Deviation:** For every planned intention that was not completed, partially completed, or deviated from, explain the probable reasons. Consider factors like:
    *   **External Factors:** Distractions, unexpected events, lack of resources, social obligations.
    *   **Internal Factors:** Lack of motivation, fatigue, procrastination, overestimation of ability, fear of failure, mood swings.
    *   **Planning Issues:** Unrealistic goals, vague intentions, lack of clear steps, poor time management.
3.  **Identify Root Cause/Pattern:** Summarize the core reason for the inconsistency. Use terms like: "Lack of clear planning", "Frequent distractions", "Overestimation of time", "Motivation dip", "Unforeseen interruptions", "Task too daunting", "Perfectionism paralysis".
4.  **Provide Insight:** Offer a brief, actionable insight or takeaway that the user can use to improve their consistency for similar situations in the future.

**Planned Intentions:**
```json
{{{JSON plannedIntentions}}}
```

**Actual Behaviors:**
```json
{{{JSON actualBehaviors}}}
```

**Analysis Context:**
{{{analysisContext}}}

**Output Format:**
Your response MUST be a JSON object matching the `AnalyzeBehavioralDiscrepanciesOutputSchema`.
Focus on providing clear, empathetic, and insightful explanations. Do not generate recommendations for future actions, only analysis and insights into *past* behavior.`,
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
