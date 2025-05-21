'use server';

/**
 * @fileOverview Generates example sentences for a given word or phrase using AI.
 *
 * - generateExampleSentences - A function that generates example sentences.
 * - GenerateExampleSentencesInput - The input type for the generateExampleSentences function.
 * - GenerateExampleSentencesOutput - The return type for the generateExampleSentences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExampleSentencesInputSchema = z.object({
  wordOrPhrase: z
    .string()
    .describe('The word or phrase for which to generate example sentences.'),
  language: z
    .string()
    .describe('The language in which to generate the example sentences.'),
});
export type GenerateExampleSentencesInput = z.infer<
  typeof GenerateExampleSentencesInputSchema
>;

const GenerateExampleSentencesOutputSchema = z.object({
  sentences: z
    .array(z.string())
    .describe('An array of example sentences for the given word or phrase.'),
});
export type GenerateExampleSentencesOutput = z.infer<
  typeof GenerateExampleSentencesOutputSchema
>;

export async function generateExampleSentences(
  input: GenerateExampleSentencesInput
): Promise<GenerateExampleSentencesOutput> {
  return generateExampleSentencesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExampleSentencesPrompt',
  input: {schema: GenerateExampleSentencesInputSchema},
  output: {schema: GenerateExampleSentencesOutputSchema},
  prompt: `You are an expert linguist. Your task is to generate example sentences for a given word or phrase in a specified language.

Word or Phrase: {{{wordOrPhrase}}}
Language: {{{language}}}

Generate at least 3 example sentences that demonstrate the usage of the word or phrase in different contexts. Ensure the sentences are grammatically correct and natural-sounding.

Sentences:`,
});

const generateExampleSentencesFlow = ai.defineFlow(
  {
    name: 'generateExampleSentencesFlow',
    inputSchema: GenerateExampleSentencesInputSchema,
    outputSchema: GenerateExampleSentencesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
