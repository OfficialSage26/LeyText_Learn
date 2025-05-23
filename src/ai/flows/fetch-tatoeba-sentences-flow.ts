
'use server';
/**
 * @fileOverview Fetches example sentences from the Tatoeba API.
 *
 * - fetchTatoebaSentences - Fetches example sentences for a word.
 * - FetchTatoebaSentencesInput - Input type for the function.
 * - FetchTatoebaSentencesOutput - Output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Language } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';

const LanguageEnum = z.enum(SUPPORTED_LANGUAGES);

const FetchTatoebaSentencesInputSchema = z.object({
  word: z.string().describe('The word to search for in sentences.'),
  sourceLanguage: LanguageEnum.describe('The language of the word/source sentence.'),
  targetLanguage: LanguageEnum.describe('The language for the translated sentence.'),
});
export type FetchTatoebaSentencesInput = z.infer<typeof FetchTatoebaSentencesInputSchema>;

const SentencePairSchema = z.object({
  sourceText: z.string(),
  targetText: z.string(),
  sourceLang: z.string(),
  targetLang: z.string(),
});

const FetchTatoebaSentencesOutputSchema = z.object({
  sentences: z.array(SentencePairSchema).describe('An array of sentence pairs.'),
});
export type FetchTatoebaSentencesOutput = z.infer<typeof FetchTatoebaSentencesOutputSchema>;

const languageToTatoebaCode = (lang: Language): string => {
  switch (lang) {
    case "English": return "eng";
    case "Tagalog": return "tgl";
    case "Bisaya": return "ceb"; // Cebuano
    case "Waray-Waray": return "war";
    default: return "eng"; // Fallback
  }
};

export async function fetchTatoebaSentences(
  input: FetchTatoebaSentencesInput
): Promise<FetchTatoebaSentencesOutput> {
  return fetchTatoebaSentencesFlow(input);
}

const fetchTatoebaSentencesFlow = ai.defineFlow(
  {
    name: 'fetchTatoebaSentencesFlow',
    inputSchema: FetchTatoebaSentencesInputSchema,
    outputSchema: FetchTatoebaSentencesOutputSchema,
  },
  async ({ word, sourceLanguage, targetLanguage }) => {
    const sourceCode = languageToTatoebaCode(sourceLanguage);
    const targetCode = languageToTatoebaCode(targetLanguage);

    if (!word.trim() || sourceCode === targetCode) {
      return { sentences: [] };
    }

    const queryParams = new URLSearchParams({
      query: word,
      from: sourceCode,
      to: targetCode,
      orphans: 'no', // Ensures sentences have translations
      unapproved: 'no', // Gets only approved sentences
      sort: 'relevance',
      trans_filter: 'limit',
      trans_to: targetCode, // Explicitly ask for translations to the target language
      trans_link: 'direct', // Look for direct translations
      limit: '5', // Limit to 5 sentence pairs for brevity
    });

    const apiUrl = `https://tatoeba.org/eng/api_v0/search?${queryParams.toString()}`;

    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Tatoeba API error: ${response.status} - ${response.statusText}`);
        const errorBody = await response.text();
        console.error("Tatoeba error body:", errorBody);
        return { sentences: [] };
      }

      const data = await response.json();
      
      const sentencePairs: z.infer<typeof SentencePairSchema>[] = [];

      if (data.results && Array.isArray(data.results)) {
        for (const result of data.results) {
          if (result.text && result.translations && result.translations[0] && result.translations[0][0] && result.translations[0][0].text) {
             // The API sometimes nests translations weirdly. result.translations[0] is usually an array of translations in one target lang.
            // result.translations[0][0] would be the first translation object in that list.
            const translationObject = result.translations.flat().find((t: any) => t.lang === targetCode);

            if (translationObject) {
              sentencePairs.push({
                sourceText: result.text,
                targetText: translationObject.text,
                sourceLang: sourceLanguage, // Use app's language name
                targetLang: targetLanguage, // Use app's language name
              });
            }
          }
        }
      }
      
      return { sentences: sentencePairs.slice(0, 5) }; // Ensure max 5

    } catch (error) {
      console.error('Error fetching from Tatoeba API:', error);
      return { sentences: [] };
    }
  }
);
