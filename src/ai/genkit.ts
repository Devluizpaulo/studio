import {genkit, GenerationCommon} from 'genkit';
import {googleAI, GoogleAIGenerativeAI} from '@genkit-ai/googleai';
import {db} from '@/lib/firebase-admin';

// Keep a cache of initialized GoogleAI plugins per API key
const googleAICache = new Map<string, GoogleAIGenerativeAI>();

// Function to get or create a GoogleAI plugin instance for a given API key
function getGoogleAI(apiKey: string): GoogleAIGenerativeAI {
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
  plugins: [], // Plugins are now managed dynamically
  model: 'googleai/gemini-2.0-flash', // Default model reference

  // Custom function to get the appropriate plugin based on options
  getPlugin: async <T extends GenerationCommon>(
    name: string,
    options?: T['options']
  ) => {
    if (name === 'googleai') {
      const uid = options?.user;
      if (!uid) {
        throw new Error('User ID is required to get API key');
      }
      const officeId = await getOfficeId(uid);
      const apiKey = await getApiKey(officeId);
      return getGoogleAI(apiKey);
    }
    // Fallback or error for other plugin names if needed
    throw new Error(`Plugin ${name} not found or not supported dynamically.`);
  },
});
