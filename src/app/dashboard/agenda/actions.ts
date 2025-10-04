"use server"

import { z } from "zod"
import { db } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"

const createEventSchema = z.object({
  title: z.string().min(3, "O título é obrigatório."),
  date: z.date(),
  type: z.enum(['audiencia-presencial', 'audiencia-virtual', 'prazo', 'reuniao', 'atendimento-presencial', 'outro']),
  description: z.string().optional(),
  lawyerId: z.string(),
  processId: z.string().optional(),
})

type Result =
  | { success: true; data: { eventId: string } }
  | { success: false; error: string }

export async function createEventAction(
  input: z.infer<typeof createEventSchema>
): Promise<Result> {
  if (!db) {
    return { success: false, error: "O serviço de banco de dados não está disponível."}
  }

  const parsedInput = createEventSchema.safeParse(input)

  if (!parsedInput.success) {
    return { success: false, error: "Input inválido." }
  }
  
  try {
    const { lawyerId, date, processId, type, ...eventData } = parsedInput.data
    
    const userDocRef = db.collection("users").doc(lawyerId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
        return { success: false, error: "Usuário não encontrado." };
    }
    const officeId = userDoc.data()?.officeId;
    if (!officeId) {
        return { success: false, error: "Escritório do usuário não encontrado." };
    }

    const docData: any = {
      ...eventData,
      type,
      createdBy: lawyerId,
      lawyerId: lawyerId,
      officeId: officeId,
      date: Timestamp.fromDate(date),
      // Set a specific status for events that need confirmation, like hearings.
      status: (type === 'audiencia-presencial' || type === 'audiencia-virtual') ? 'pendente' : 'agendado' 
    }

    if (processId) {
      docData.processId = processId;
    }

    const docRef = await db.collection("events").add(docData);

    return { success: true, data: { eventId: docRef.id } }
  } catch (error) {
    console.error("Erro ao criar evento:", error)
    return { success: false, error: "Falha ao criar evento. Tente novamente." }
  }
}
