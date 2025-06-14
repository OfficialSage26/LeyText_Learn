
'use server';
/**
 * @fileOverview Synthesizes speech. Priority:
 * 1. ElevenLabs (for all languages, if API key & voice ID are configured)
 * 2. Google Cloud TTS (primarily for Tagalog, if configured and ElevenLabs fails or is not configured)
 * 3. Browser's default TTS (as a fallback)
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
  audioBase64: z.string().nullable().describe('Base64 encoded audio content (MP3), or null if TTS is not supported/configured for the language or an error occurred.'),
  source: z.enum(['elevenlabs', 'google', 'browser', 'none']).describe('Source of the TTS audio or indication of browser fallback/none.')
});
export type SynthesizeSpeechOutput = z.infer<typeof SynthesizeSpeechOutputSchema>;

let gcpTtsClient: TextToSpeechClient | null = null;
try {
  gcpTtsClient = new TextToSpeechClient();
} catch (error) {
  console.error("Failed to initialize Google Cloud TextToSpeechClient. Make sure Google Cloud credentials are set up correctly.", error);
}

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EJV7H2baGt5ab95tOoSG'; // Updated Default Voice ID
const ELEVENLABS_MODEL_ID = 'eleven_multilingual_v2';

async function synthesizeWithElevenLabs(text: string, language: Language): Promise<string | null> {
  if (!ELEVENLABS_API_KEY) { // Only attempt if API key is present
    return null;
  }
  if (!text.trim()) return null;

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: ELEVENLABS_MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`ElevenLabs API error for language ${language}: ${response.status} - ${response.statusText}. Body: ${errorBody}`);
      return null;
    }

    const audioArrayBuffer = await response.arrayBuffer();
    return Buffer.from(audioArrayBuffer).toString('base64');
  } catch (error) {
    console.error(`Error calling ElevenLabs API for language ${language}:`, error);
    return null;
  }
}

const languageToGoogleTTSConfig = (language: Language): { languageCode: string; name?: string } | null => {
  switch (language) {
    case "Tagalog":
      return { languageCode: "fil-PH", name: "fil-PH-Standard-A" }; // Example standard voice for Filipino
    // English could be added here if desired, e.g., { languageCode: "en-US", name: "en-US-Standard-C" }
    // Bisaya and Waray-Waray are not standardly supported by Google Cloud TTS with distinct voices.
    default:
      return null;
  }
};

async function synthesizeWithGoogleCloud(text: string, language: Language): Promise<string | null> {
  if (!gcpTtsClient) {
    console.warn("Google Cloud TextToSpeechClient not initialized. Cannot synthesize speech via Google Cloud.");
    return null;
  }

  const ttsConfig = languageToGoogleTTSConfig(language);
  if (!ttsConfig || !text.trim()) {
    return null;
  }

  try {
    const request = {
      input: { text: text },
      voice: { languageCode: ttsConfig.languageCode, name: ttsConfig.name },
      audioConfig: { audioEncoding: 'MP3' as const },
    };

    // @ts-ignore
    const [response] = await gcpTtsClient.synthesizeSpeech(request);
    
    if (response.audioContent instanceof Uint8Array) {
       return Buffer.from(response.audioContent).toString('base64');
    } else if (typeof response.audioContent === 'string') {
       return response.audioContent; 
    }
    console.warn("Unexpected audioContent format from Google Cloud TTS API:", response.audioContent);
    return null;

  } catch (error) {
    console.error(`Error synthesizing speech for ${language} via Google Cloud TTS:`, error);
    return null;
  }
}


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
    if (!text.trim()) {
      return { audioBase64: null, source: 'none' };
    }

    // Priority 1: ElevenLabs for all configured languages
    const elevenLabsAudio = await synthesizeWithElevenLabs(text, language);
    if (elevenLabsAudio) {
      console.log(`Synthesized speech with ElevenLabs for ${language}.`);
      return { audioBase64: elevenLabsAudio, source: 'elevenlabs' };
    }

    // Priority 2: Google Cloud TTS (primarily for Tagalog as per current config)
    const googleCloudAudio = await synthesizeWithGoogleCloud(text, language);
    if (googleCloudAudio) {
      console.log(`Synthesized speech with Google Cloud TTS for ${language}.`);
      return { audioBase64: googleCloudAudio, source: 'google' };
    }
    
    // If no cloud service provided audio, indicate browser fallback
    console.log(`No cloud TTS audio for ${language}. Client will attempt browser TTS.`);
    return { audioBase64: null, source: 'browser' };
  }
);

