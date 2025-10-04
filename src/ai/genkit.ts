'use server';

import {genkit} from 'genkit';
import type {GenerateRequest, GenkitPlugin} from 'genkit/experimental';
import {googleAI} from '@genkit-ai/googleai';
import {db} from '@/lib/firebase-admin';

// Keep a cache of initialized GoogleAI plugins per API key
const googleAICache = new Map<string, GenkitPlugin>();

// Function to get or create a GoogleAI plugin instance for a given API key
function getGoogleAI(apiKey: string): GenkitPlugin {
  if (!googleAICache.has(apiKey)) {
    googleAICache.set(apiKey, googleAI({apiKey}));
  }
  return googleAICache.get(apiKey)!;
}

// Function to get the current user's officeId from their UID
async function getOfficeId(uid: string): Promise<string> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
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
  if (!db) {
    throw new Error('Firestore not initialized');
  }
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
    {
      onGenerate: async function (req: GenerateRequest, next: any) {
        const uid = req.context.auth?.uid;
        if (!uid) {
          throw new Error('User ID is required to get API key');
        }
        const officeId = await getOfficeId(uid);
        const apiKey = await getApiKey(officeId);
        const googleAIPlugin = getGoogleAI(apiKey);
        
        const onGenerate = (googleAIPlugin as any).onGenerate;
        if (onGenerate) {
            return await onGenerate(req, next);
        }
        return next(req);
      },
    } as GenkitPlugin,
  ],
});
