'use server';

/**
 * @fileOverview An AI-powered tool to analyze student applications.
 *
 * - analyzeApplication - A function that provides a brief analysis of an applicant's responses.
 * - AnalyzeApplicationInput - The input type for the analyzeApplication function.
 * - AnalyzeApplicationOutput - The return type for the analyzeApplication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeApplicationInputSchema = z.object({
  reason: z
    .string()
    .describe("The applicant's reason for applying."),
  expectation: z
    .string()
    .describe("The applicant's expectations from joining."),
  situation: z
    .string()
    .describe("The applicant's answer to the situational question."),
});
export type AnalyzeApplicationInput = z.infer<typeof AnalyzeApplicationInputSchema>;

const AnalyzeApplicationOutputSchema = z.object({
  analysis: z
    .string()
    .describe("A brief, objective analysis of the applicant's potential based on their answers. Focus on identifying key traits like proactivity, teamwork, and problem-solving skills."),
});
export type AnalyzeApplicationOutput = z.infer<typeof AnalyzeApplicationOutputSchema>;

export async function analyzeApplication(input: AnalyzeApplicationInput): Promise<AnalyzeApplicationOutput> {
  return analyzeApplicationFlow(input);
}

const analyzeApplicationPrompt = ai.definePrompt({
  name: 'analyzeApplicationPrompt',
  input: {schema: AnalyzeApplicationInputSchema},
  output: {schema: AnalyzeApplicationOutputSchema},
  prompt: `You are an HR assistant for a student union, skilled in analyzing applications.
  
  Please provide a brief, objective analysis (2-3 sentences) of the following applicant's responses.
  Focus on identifying key traits like proactivity, teamwork, problem-solving skills, and alignment with the union's goals.
  Do not make a hiring decision, simply provide a summary of their potential strengths.

  Reason for applying: {{{reason}}}
  Expectations: {{{expectation}}}
  Situational Answer: {{{situation}}}
  `,
});

const analyzeApplicationFlow = ai.defineFlow(
  {
    name: 'analyzeApplicationFlow',
    inputSchema: AnalyzeApplicationInputSchema,
    outputSchema: AnalyzeApplicationOutputSchema,
  },
  async input => {
    const {output} = await analyzeApplicationPrompt(input);
    return output!;
  }
);
