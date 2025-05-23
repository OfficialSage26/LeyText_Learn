
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-example-sentences.ts';
import '@/ai/flows/translate-text-flow.ts';
import '@/ai/flows/synthesize-speech-flow.ts';
import '@/ai/flows/fetch-tatoeba-sentences-flow.ts'; // Added new flow
