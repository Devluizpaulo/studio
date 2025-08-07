"use server"

import { z } from "zod"
import { db } from "@/lib/firebase-admin"
import { doc, updateDoc } from "firebase/firestore"

const updateEventStatusSchema = z.object({
  eventId: z.string(),
  status: z.string(),
})

type Result =
  | { success: true }
  | { success: false; error: string }

export async function updateEventStatusAction(
  input: z.infer<typeof updateEventStatusSchema>
): Promise<Result> {
  const parsedInput = updateEventStatusSchema.safeParse(input)

  if (!parsedInput.success) {
    return { success: false, error: "Input inválido." }
  }

  try {
    const { eventId, status } = parsedInput.data
    
    const eventRef = doc(db, "events", eventId)
    await updateDoc(eventRef, { status: status })

    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar status do evento:", error)
    return { success: false, error: "Falha ao atualizar o status. Tente novamente." }
  }
}
