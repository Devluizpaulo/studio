"use server"

import { z } from "zod"
import { db } from "@/lib/firebase"
import { doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore"
import { updateProcessStatus } from "@/ai/flows/update-process-status"

const updateProcessStatusSchema = z.object({
  processId: z.string(),
  processNumber: z.string(),
  court: z.string(),
  currentStatus: z.string(),
  lastUpdate: z.string(),
})

type Result =
  | { success: true; data: { movementId: string } }
  | { success: false; error: string }

export async function updateProcessStatusAction(
  input: z.infer<typeof updateProcessStatusSchema>
): Promise<Result> {
  const parsedInput = updateProcessStatusSchema.safeParse(input)

  if (!parsedInput.success) {
    return { success: false, error: "Input inválido." }
  }

  try {
    // Call the AI flow to get the simulated new status
    const newMovement = await updateProcessStatus(parsedInput.data);

    const processRef = doc(db, "processes", parsedInput.data.processId);

    // Atomically add the new movement to the "movements" array field
    await updateDoc(processRef, {
        movements: arrayUnion({
            ...newMovement,
            date: Timestamp.fromDate(new Date(newMovement.date)), // Convert date string to Firestore Timestamp
        })
    });

    return { success: true, data: { movementId: new Date().toISOString() } } // Placeholder ID
  } catch (error) {
    console.error("Erro ao atualizar andamento:", error)
    return { success: false, error: "Falha ao atualizar andamento. Tente novamente." }
  }
}

    