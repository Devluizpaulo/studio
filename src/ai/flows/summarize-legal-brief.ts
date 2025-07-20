// Summarize legal brief flow.
'use server';
/**
 * @fileOverview A legal summary AI agent.
 *
 * - summarizeLegalBrief - A function that handles the legal summary process.
 * - SummarizeLegalBriefInput - The input type for the summarizeLegalBrief function.
 * - SummarizeLegalBriefOutput - The return type for the summarizeLegalBrief function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLegalBriefInputSchema = z.object({
  documentText: z.string().describe('The text content of the legal document to summarize.'),
  tone: z.enum(['formal', 'informal', 'neutral']).describe('The desired tone of the summary.'),
  focusAreas: z.string().describe('Specific areas or topics to emphasize in the summary.'),
});
export type SummarizeLegalBriefInput = z.infer<typeof SummarizeLegalBriefInputSchema>;

const SummarizeLegalBriefOutputSchema = z.object({
  summary: z.string().describe('The generated legal summary.'),
});
export type SummarizeLegalBriefOutput = z.infer<typeof SummarizeLegalBriefOutputSchema>;

export async function summarizeLegalBrief(input: SummarizeLegalBriefInput): Promise<SummarizeLegalBriefOutput> {
  return summarizeLegalBriefFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLegalBriefPrompt',
  input: {schema: SummarizeLegalBriefInputSchema},
  output: {schema: SummarizeLegalBriefOutputSchema},
  prompt: `You are an AI assistant for paralegals to generate legal summaries.

  Summarize the following legal document, tailoring the response to the specified tone and focusing on the areas specified. 
  Make sure to include all relevant information, such as names of parties involved, dates and locations, and specific articles cited.

  Document Text: {{{documentText}}}
  Tone: {{{tone}}}
  Focus Areas: {{{focusAreas}}}
  `,
});

const summarizeLegalBriefFlow = ai.defineFlow(
  {
    name: 'summarizeLegalBriefFlow',
    inputSchema: SummarizeLegalBriefInputSchema,
    outputSchema: SummarizeLegalBriefOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
