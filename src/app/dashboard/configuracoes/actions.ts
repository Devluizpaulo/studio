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
    
    const officeRef = db.collection("offices").doc(officeId);
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
        return { success: true, data: null };
    } catch (error) {
        console.error("Erro ao buscar a chave de API:", error);
        return { success: false, error: "Falha ao buscar a chave." };
    }
}


// --- SEO Settings Actions ---
const seoSettingsSchema = z.object({
  officeId: z.string(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().optional(),
})

export async function updateSeoSettingsAction(
  input: z.infer<typeof seoSettingsSchema>
): Promise<Result> {
    const parsedInput = seoSettingsSchema.safeParse(input);
    if (!parsedInput.success) return { success: false, error: "Input inválido." };

    try {
        const { officeId, ...seoData } = parsedInput.data;
        const officeRef = db.collection("offices").doc(officeId);
        await officeRef.set({ seo: seoData }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Erro ao salvar SEO:", error);
        return { success: false, error: "Falha ao salvar configurações de SEO." };
    }
}

type GetSeoSettingsResult = 
    | { success: true, data: z.infer<Omit<typeof seoSettingsSchema, 'officeId'>> | null }
    | { success: false, error: string };

export async function getSeoSettingsAction(officeId: string): Promise<GetSeoSettingsResult> {
    if (!officeId) return { success: false, error: "ID do escritório inválido." };
    try {
        const officeRef = db.collection("offices").doc(officeId);
        const docSnap = await officeRef.get();
        if (docSnap.exists) {
            return { success: true, data: docSnap.data()?.seo || null };
        }
        return { success: true, data: null };
    } catch (error) {
        console.error("Erro ao buscar SEO:", error);
        return { success: false, error: "Falha ao buscar configurações de SEO." };
    }
}


// --- GTM Settings Actions ---
const gtmIdSchema = z.object({
    officeId: z.string(),
    gtmId: z.string().optional(),
})

export async function updateGtmIdAction(
  input: z.infer<typeof gtmIdSchema>
): Promise<Result> {
    const parsedInput = gtmIdSchema.safeParse(input);
    if (!parsedInput.success) return { success: false, error: "Input inválido." };

    try {
        const { officeId, gtmId } = parsedInput.data;
        const officeRef = db.collection("offices").doc(officeId);
        await officeRef.set({ gtmId }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Erro ao salvar GTM ID:", error);
        return { success: false, error: "Falha ao salvar o ID do Google Tag Manager." };
    }
}

type GetGtmIdResult = 
    | { success: true, data: string | null }
    | { success: false, error: string };

export async function getGtmIdAction(officeId: string): Promise<GetGtmIdResult> {
    if (!officeId) return { success: false, error: "ID do escritório inválido." };
    try {
        const officeRef = db.collection("offices").doc(officeId);
        const docSnap = await officeRef.get();
        if (docSnap.exists) {
            return { success: true, data: docSnap.data()?.gtmId || null };
        }
        return { success: true, data: null };
    } catch (error) {
        console.error("Erro ao buscar GTM ID:", error);
        return { success: false, error: "Falha ao buscar o ID do Google Tag Manager." };
    }
}
