'use server';
/**
 * @fileOverview A GenAI-powered recommendation tool, the "Pivot Engine", that suggests specific, actionable workflow adjustments to align habits with stated goals.
 *
 * - generatePersonalizedRecommendations - A function that handles the generation of personalized recommendations.
 * - GeneratePersonalizedRecommendationsInput - The input type for the generatePersonalizedRecommendations function.
 * - GeneratePersonalizedRecommendationsOutput - The return type for the generatePersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlannedTaskSchema = z.object({
  name: z.string().describe('The name of the planned task.'),
  description: z.string().describe('A brief description of the task.'),
  expectedEffortHours: z
    .number()
    .describe('The estimated effort in hours for the task.'),
});

const ActualBehaviorSchema = z.object({
  name: z.string().describe('The name of the task as it was actually attempted.'),
  completed: z.boolean().describe('Whether the task was completed or not.'),
  actualEffortHours: z
    .number()
    .nullable()
    .describe('The actual effort in hours spent on the task, or null if not started.'),
});

const RecommendationSchema = z.object({
  title: z
    .string()
    .describe('A concise title for the personalized recommendation.'),
  description: z
    .string()
    .describe('Specific and actionable steps for the user to implement.'),
  category: z
    .enum([
      'Time Management',
      'Prioritization',
      'Environment Adjustment',
      'Cognitive Reframing',
      'Skill Development',
      'Task Breakdown',
      'Motivation',
    ])
    .describe('The category of the recommendation.'),
  rationale: z
    .string()
    .describe(
      'Explanation of why this recommendation is relevant based on the identified discrepancies.'
    ),
});

const GeneratePersonalizedRecommendationsInputSchema = z.object({
  userGoals: z
    .string()
    .describe('A summary of the user’s overall goals and intentions.'),
  discrepanciesSummary: z
    .string()
    .describe(
      'A detailed summary of identified behavioral leaks, inconsistencies, and why intentions were not fulfilled. This should include patterns of inconsistency.'
    ),
  plannedTasks: z
    .array(PlannedTaskSchema)
    .describe('A list of tasks the user planned to do.'),
  actualBehaviors: z
    .array(ActualBehaviorSchema)
    .describe('A list of tasks the user actually attempted or completed.'),
});
export type GeneratePersonalizedRecommendationsInput = z.infer<
  typeof GeneratePersonalizedRecommendationsInputSchema
>;

const GeneratePersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(RecommendationSchema)
    .describe('A list of specific, actionable, and personalized recommendations.'),
});
export type GeneratePersonalizedRecommendationsOutput = z.infer<
  typeof GeneratePersonalizedRecommendationsOutputSchema
>;

export async function generatePersonalizedRecommendations(
  input: GeneratePersonalizedRecommendationsInput
): Promise<GeneratePersonalizedRecommendationsOutput> {
  return generatePersonalizedRecommendationsFlow(input);
}

const recommendationPrompt = ai.definePrompt({
  name: 'generatePersonalizedRecommendationsPrompt',
  input: {schema: GeneratePersonalizedRecommendationsInputSchema},
  output: {schema: GeneratePersonalizedRecommendationsOutputSchema},
  prompt: `You are the "Pivot Engine", an AI-powered recommendation tool designed to help users align their actions with their intentions.
Your goal is to provide specific, actionable, and personalized recommendations based on the user's stated goals, planned tasks, actual behaviors, and identified discrepancies.

### User's Overall Goals:
{{{userGoals}}}

### Identified Discrepancies and Inconsistencies:
{{{discrepanciesSummary}}}

### Planned Tasks:
{{#each plannedTasks}}
- Task Name: {{{name}}}
  Description: {{{description}}}
  Expected Effort: {{{expectedEffortHours}}} hours
{{/each}}

### Actual Behaviors:
{{#each actualBehaviors}}
- Task Name: {{{name}}}
  Completed: {{{completed}}}
  Actual Effort: {{{actualEffortHours}}} hours
{{/each}}

Based on the above information, generate a list of 3-5 specific, actionable, and personalized recommendations. Each recommendation should include a clear title, detailed steps, a category, and a rationale explaining how it addresses the identified discrepancies and helps the user achieve their goals.
`,
});

const generatePersonalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedRecommendationsFlow',
    inputSchema: GeneratePersonalizedRecommendationsInputSchema,
    outputSchema: GeneratePersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await recommendationPrompt(input);
    return output!;
  }
);
