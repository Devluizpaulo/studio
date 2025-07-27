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
    const { lawyerId, date, ...eventData } = parsedInput.data
    
    const docRef = await addDoc(collection(db, "events"), {
      ...eventData,
      lawyerId: lawyerId,
      date: Timestamp.fromDate(date),
    })

    return { success: true, data: { eventId: docRef.id } }
  } catch (error) {
    console.error("Erro ao criar evento:", error)
    return { success: false, error: "Falha ao criar evento. Tente novamente." }
  }
}
