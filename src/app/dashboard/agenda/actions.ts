"use server"

import { z } from "zod"
import { db } from "@/lib/firebase-admin"
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore"

const createEventSchema = z.object({
  title: z.string(),
  date: z.date(),
  type: z.enum(['audiencia-presencial', 'audiencia-virtual', 'prazo', 'reuniao', 'atendimento-presencial', 'outro']),
  description: z.string().optional(),
  lawyerId: z.string(), // ID of the user creating the event
  processId: z.string().optional(),
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
    const { lawyerId, date, processId, type, ...eventData } = parsedInput.data
    
    // Get user's officeId
    const userDocRef = doc(db, "users", lawyerId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists()) {
        return { success: false, error: "Usuário não encontrado." };
    }
    const officeId = userDoc.data()?.officeId;
    if (!officeId) {
        return { success: false, error: "Escritório do usuário não encontrado." };
    }


    const docData: any = {
      ...eventData,
      type,
      createdBy: lawyerId, // Keep track of who created the event
      lawyerId: lawyerId, // By default, event is for the creator
      officeId: officeId, // Associate event with the office
      date: Timestamp.fromDate(date),
      status: type.startsWith('audiencia') ? 'pendente' : 'concluido' // Add status for confirmation
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
