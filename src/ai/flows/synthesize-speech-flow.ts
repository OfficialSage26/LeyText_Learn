'use server';
/**
 * @fileOverview Synthesizes speech using Google Cloud Text-to-Speech API.
 *
 * - synthesizeSpeech - A function that synthesizes speech for supported languages.
 * - SynthesizeSpeechInput - The input type for the synthesizeSpeech function.
 * - SynthesizeSpeechOutput - The return type for the synthesizeSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {TextToSpeechClient} from '@google-cloud/text-to-speech';
import type { Language } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';

const LanguageEnum = z.enum(SUPPORTED_LANGUAGES);

const SynthesizeSpeechInputSchema = z.object({
  text: z.string().describe('The text to be synthesized.'),
  language: LanguageEnum.describe('The language of the text.'),
});
export type SynthesizeSpeechInput = z.infer<typeof SynthesizeSpeechInputSchema>;

const SynthesizeSpeechOutputSchema = z.object({
  audioBase64: z.string().nullable().describe('Base64 encoded audio content (MP3), or null if TTS is not supported for the language or an error occurred.'),
});
export type SynthesizeSpeechOutput = z.infer<typeof SynthesizeSpeechOutputSchema>;

// Initialize the TextToSpeechClient
// IMPORTANT: This requires Google Cloud authentication to be set up in the environment
// (e.g., GOOGLE_APPLICATION_CREDENTIALS environment variable).
let ttsClient: TextToSpeechClient | null = null;
try {
  ttsClient = new TextToSpeechClient();
} catch (error) {
  console.error("Failed to initialize TextToSpeechClient. Make sure Google Cloud credentials are set up correctly.", error);
  // Depending on how critical this is, you might want to handle this more gracefully
  // or ensure credentials are set before deploying/running.
}


// Mapping from app language to Google Cloud TTS language codes and preferred voices
// Note: Google Cloud TTS does not support Bisaya or Waray-Waray with standard voices.
// Filipino is used for Tagalog.
const languageToGoogleTTSConfig = (language: Language): { languageCode: string; name?: string } | null => {
  switch (language) {
    case "English":
      return { languageCode: "en-US", name: "en-US-Standard-C" }; // Example voice, many others available
    case "Tagalog":
      return { languageCode: "fil-PH", name: "fil-PH-Standard-A" }; // Example voice for Filipino
    case "Bisaya":
    case "Waray-Waray":
    default:
      return null; // Not directly supported by Google Cloud TTS standard voices
  }
};


export async function synthesizeSpeech(
  input: SynthesizeSpeechInput
): Promise<SynthesizeSpeechOutput> {
  return synthesizeSpeechFlow(input);
}

const synthesizeSpeechFlow = ai.defineFlow(
  {
    name: 'synthesizeSpeechFlow',
    inputSchema: SynthesizeSpeechInputSchema,
    outputSchema: SynthesizeSpeechOutputSchema,
  },
  async ({ text, language }) => {
    if (!ttsClient) {
      console.error("TextToSpeechClient not initialized. Cannot synthesize speech.");
      return { audioBase64: null };
    }

    const ttsConfig = languageToGoogleTTSConfig(language);

    if (!ttsConfig || !text.trim()) {
      // Language not supported by Google Cloud TTS or empty text
      return { audioBase64: null };
    }

    try {
      const request = {
        input: { text: text },
        voice: { languageCode: ttsConfig.languageCode, name: ttsConfig.name },
        audioConfig: { audioEncoding: 'MP3' as const }, // 'MP3' or 'LINEAR16'
      };

      // @ts-ignore // Types for synthesizeSpeech might be slightly off if library version changes
      const [response] = await ttsClient.synthesizeSpeech(request);
      
      if (response.audioContent instanceof Uint8Array) {
         return { audioBase64: Buffer.from(response.audioContent).toString('base64') };
      } else if (typeof response.audioContent === 'string') {
         return { audioBase64: response.audioContent }; // Already base64 string
      }
      console.warn("Unexpected audioContent format from TTS API:", response.audioContent);
      return { audioBase64: null };

    } catch (error) {
      console.error(`Error synthesizing speech for ${language}:`, error);
      return { audioBase64: null };
    }
  }
);
