'use server';

/**
 * @fileOverview An AI-powered tool that automatically filters and moderates comments on the blog section.
 *
 * - moderateBlogComments - A function that handles the moderation process.
 * - ModerateBlogCommentsInput - The input type for the moderateBlogComments function.
 * - ModerateBlogCommentsOutput - The return type for the moderateBlogComments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateBlogCommentsInputSchema = z.object({
  comment: z
    .string()
    .describe('The comment text to be moderated.'),
});
export type ModerateBlogCommentsInput = z.infer<typeof ModerateBlogCommentsInputSchema>;

const ModerateBlogCommentsOutputSchema = z.object({
  isSafe: z
    .boolean()
    .describe('Whether the comment is safe and appropriate for the blog.'),
  reason: z
    .string()
    .optional()
    .describe('The reason why the comment was flagged as unsafe, if applicable.'),
});
export type ModerateBlogCommentsOutput = z.infer<typeof ModerateBlogCommentsOutputSchema>;

export async function moderateBlogComments(input: ModerateBlogCommentsInput): Promise<ModerateBlogCommentsOutput> {
  return moderateBlogCommentsFlow(input);
}

const moderateBlogCommentsPrompt = ai.definePrompt({
  name: 'moderateBlogCommentsPrompt',
  input: {schema: ModerateBlogCommentsInputSchema},
  output: {schema: ModerateBlogCommentsOutputSchema},
  prompt: `You are a blog comment moderator.

  Your job is to determine if a given comment is safe and appropriate for the blog.
  "Safe" means that the comment is not spam, does not contain offensive language, and is relevant to the blog content.

  Here is the comment to moderate:
  {{comment}}

  Respond with a JSON object that indicates whether the comment is safe and provides a reason if it is not safe.
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const moderateBlogCommentsFlow = ai.defineFlow(
  {
    name: 'moderateBlogCommentsFlow',
    inputSchema: ModerateBlogCommentsInputSchema,
    outputSchema: ModerateBlogCommentsOutputSchema,
  },
  async input => {
    const {output} = await moderateBlogCommentsPrompt(input);
    return output!;
  }
);
