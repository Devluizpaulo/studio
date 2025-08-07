import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase';
import type {Plugin} from 'genkit';
import {db} from '@/lib/firebase-admin';

// Keep a cache of initialized GoogleAI plugins per API key
const googleAICache = new Map<string, Plugin>();

// Function to get or create a GoogleAI plugin instance for a given API key
function getGoogleAI(apiKey: string): Plugin {
  if (!googleAICache.has(apiKey)) {
    googleAICache.set(apiKey, googleAI({apiKey}));
  }
  return googleAICache.get(apiKey)!;
}

// Function to get the current user's officeId from their UID
async function getOfficeId(uid: string): Promise<string> {
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    throw new Error('User not found');
  }
  const officeId = userDoc.data()?.officeId;
  if (!officeId) {
    throw new Error('Office ID not found for user');
  }
  return officeId;
}

// Function to get the API key for a given officeId
async function getApiKey(officeId: string): Promise<string> {
  const officeDoc = await db.collection('offices').doc(officeId).get();
  if (!officeDoc.exists) {
    throw new Error('Office configuration not found');
  }
  const apiKey = officeDoc.data()?.googleApiKey;
  if (!apiKey) {
    throw new Error('API key not configured for this office');
  }
  return apiKey;
}

// Main AI configuration object. It will dynamically select the correct
// Google AI plugin based on the user's office settings.
export const ai = genkit({
  plugins: [
    firebase(),
    {
      name: 'dynamic-google-ai',
      async onGenerate(input, next) {
        const uid = input.options?.user;
        if (!uid) {
          throw new Error('User ID is required to get API key');
        }
        const officeId = await getOfficeId(uid);
        const apiKey = await getApiKey(officeId);
        const googleAIPlugin = getGoogleAI(apiKey);
        return await googleAIPlugin.onGenerate!(input, next);
      },
    },
  ],
  model: 'googleai/gemini-2.0-flash', // Default model reference
});
