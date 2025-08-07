"use server"

import { z } from "zod"
import { db } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

const createClientSchema = z.object({
  fullName: z.string().min(3, "O nome é obrigatório."),
  email: z.string().email("O e-mail é inválido."),
  phone: z.string().min(10, "O telefone é obrigatório."),
  document: z.string().min(11, "O CPF/CNPJ é obrigatório."),
  address: z.string().min(5, "O endereço é obrigatório."),
  lawyerId: z.string(), // ID of the lawyer creating the client
})

type Result =
  | { success: true; data: { clientId: string } }
  | { success: false; error: string }

export async function createClientAction(
  input: z.infer<typeof createClientSchema>
): Promise<Result> {
  const parsedInput = createClientSchema.safeParse(input)

  if (!parsedInput.success) {
    return { success: false, error: "Input inválido." }
  }
  
  if (!db) {
    return { success: false, error: "O serviço de banco de dados não está disponível."}
  }

  try {
    const { lawyerId, ...clientData } = parsedInput.data
    
    // Get user's officeId
    const userDocRef = db.collection("users").doc(lawyerId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
        return { success: false, error: "Usuário não encontrado." };
    }
    const officeId = userDoc.data()?.officeId;
    if (!officeId) {
        return { success: false, error: "Escritório do usuário não encontrado." };
    }

    const docRef = await db.collection("clients").add({
      ...clientData,
      createdBy: lawyerId,
      officeId: officeId, // Associate client with the office
      createdAt: FieldValue.serverTimestamp(),
    })

    return { success: true, data: { clientId: docRef.id } }
  } catch (error) {
    console.error("Erro ao criar cliente:", error)
    return { success: false, error: "Falha ao criar cliente. Tente novamente." }
  }
}
