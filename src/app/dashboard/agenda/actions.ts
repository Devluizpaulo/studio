"use server"

import { z } from "zod"
import { db } from "@/lib/firebase"
import { collection, addDoc, Timestamp } from "firebase/firestore"

const createEventSchema = z.object({
  title: z.string(),
  date: z.date(),
  type: z.enum(['audiencia', 'prazo', 'reuniao', 'outro']),
  description: z.string().optional(),
  lawyerId: z.string(),
  processId: z.string().optional(), // Add optional processId
})

type Result =
  | { success: true; data: { eventId: string } }
  | { success: false; error: string }

export async function createEventAction(
  input: z.infer<typeof createEventSchema>
): Promise<Result> {
  const parsedInput = createEventSchema.safeParse(input)

  if (!parsedInput.success) {
    return { success: false, error: "Input inválido." }
  }

  try {
    const { lawyerId, date, processId, ...eventData } = parsedInput.data
    
    const docData: any = {
      ...eventData,
      lawyerId: lawyerId,
      date: Timestamp.fromDate(date),
    }

    if (processId) {
      docData.processId = processId;
    }

    const docRef = await addDoc(collection(db, "events"), docData)

    return { success: true, data: { eventId: docRef.id } }
  } catch (error) {
    console.error("Erro ao criar evento:", error)
    return { success: false, error: "Falha ao criar evento. Tente novamente." }
  }
}
