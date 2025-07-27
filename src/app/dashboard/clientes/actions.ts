"use server"

import { z } from "zod"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

const createClientSchema = z.object({
  fullName: z.string().min(3, "O nome é obrigatório."),
  email: z.string().email("O e-mail é inválido."),
  phone: z.string().min(10, "O telefone é obrigatório."),
  document: z.string().min(11, "O CPF/CNPJ é obrigatório."),
  address: z.string().min(5, "O endereço é obrigatório."),
  lawyerId: z.string(),
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

  try {
    const { lawyerId, ...clientData } = parsedInput.data
    
    const docRef = await addDoc(collection(db, "clients"), {
      ...clientData,
      lawyerId: lawyerId,
      createdAt: serverTimestamp(),
    })

    return { success: true, data: { clientId: docRef.id } }
  } catch (error) {
    console.error("Erro ao criar cliente:", error)
    return { success: false, error: "Falha ao criar cliente. Tente novamente." }
  }
}
