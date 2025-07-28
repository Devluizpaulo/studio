"use server"

import { z } from "zod"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { getAuth, updateProfile } from "firebase/auth"

const updateProfileSchema = z.object({
  uid: z.string(),
  fullName: z.string().min(3, "O nome completo é obrigatório."),
  oab: z.string().min(2, "O número da OAB é obrigatório."),
  legalSpecialty: z.string().min(3, "A especialidade é obrigatória."),
  office: z.string().min(2, "O nome do escritório é obrigatório."),
})

type Result =
  | { success: true }
  | { success: false; error: string }

export async function updateProfileAction(
  input: z.infer<typeof updateProfileSchema>
): Promise<Result> {
  const parsedInput = updateProfileSchema.safeParse(input)

  if (!parsedInput.success) {
    return { success: false, error: "Input inválido." }
  }

  try {
    const { uid, ...profileData } = parsedInput.data
    
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, profileData);

    // Note: Updating auth display name requires being on the client or having the user's context.
    // This server action assumes the client will refresh the user state if needed.

    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return { success: false, error: "Falha ao atualizar o perfil. Tente novamente." }
  }
}
