"use server"

import { z } from "zod"
import { db } from "@/lib/firebase-admin"
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore"

// --- Update API Key Action ---
const updateApiKeySchema = z.object({
  officeId: z.string(),
  googleApiKey: z.string().min(10, "A chave de API é muito curta."),
})

type Result =
  | { success: true }
  | { success: false; error: string }

export async function updateApiKeyAction(
  input: z.infer<typeof updateApiKeySchema>
): Promise<Result> {
  const parsedInput = updateApiKeySchema.safeParse(input)

  if (!parsedInput.success) {
    return { success: false, error: "Input inválido." }
  }

  try {
    const { officeId, googleApiKey } = parsedInput.data
    
    // The document ID is the officeId
    const officeRef = db.collection("offices").doc(officeId);
    
    // Use set with merge: true to create the document if it doesn't exist,
    // or update it if it does.
    await officeRef.set({ googleApiKey }, { merge: true });

    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar a chave de API:", error)
    return { success: false, error: "Falha ao atualizar a chave. Tente novamente." }
  }
}

// --- Get API Key Action ---
type GetApiKeyResult =
  | { success: true, data: string | null }
  | { success: false, error: string }

export async function getApiKeyAction(officeId: string): Promise<GetApiKeyResult> {
    if (!officeId) {
        return { success: false, error: "ID do escritório é inválido." };
    }
    try {
        const officeRef = db.collection("offices").doc(officeId);
        const docSnap = await officeRef.get();

        if (docSnap.exists) {
            return { success: true, data: docSnap.data()?.googleApiKey || "" };
        }
        return { success: true, data: null }; // No key set yet
    } catch (error) {
        console.error("Erro ao buscar a chave de API:", error);
        return { success: false, error: "Falha ao buscar a chave." };
    }
}
