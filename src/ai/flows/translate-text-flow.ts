'use server';
/**
 * @fileOverview A text translation AI agent.
 *
 * - translateText - A function that handles the text translation process.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { SUPPORTED_LANGUAGES } from '@/types';
import type { Language } from '@/types';

const LanguageEnum = z.enum(SUPPORTED_LANGUAGES);

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  sourceLanguage: LanguageEnum.describe('The source language of the text.'),
  targetLanguage: LanguageEnum.describe('The target language for the translation.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `You are a helpful translation assistant. Translate the following text from {{sourceLanguage}} to {{targetLanguage}}.
Provide only the translated text itself, without any additional explanations, apologies, or conversational filler.

Original text ({{sourceLanguage}}):
{{{text}}}

Translated text ({{targetLanguage}}):`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input: TranslateTextInput) => {
    if (input.text.trim() === '') {
      return { translatedText: '' };
    }
    if (input.sourceLanguage === input.targetLanguage) {
      return { translatedText: input.text };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
