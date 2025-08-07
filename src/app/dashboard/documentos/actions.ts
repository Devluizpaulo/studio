"use server"

import { z } from "zod"
import { db } from "@/lib/firebase-admin"
import { serverTimestamp } from "firebase-admin/firestore"

const createDocumentTemplateSchema = z.object({
  title: z.string().min(3, "O título é obrigatório."),
  content: z.string().min(20, "O conteúdo é obrigatório."),
  officeId: z.string(),
  createdBy: z.string(),
})

type Result =
  | { success: true; data: { templateId: string } }
  | { success: false; error: string }

export async function createDocumentTemplateAction(
  input: z.infer<typeof createDocumentTemplateSchema>
): Promise<Result> {
  const parsedInput = createDocumentTemplateSchema.safeParse(input)

  if (!parsedInput.success) {
    return { success: false, error: "Input inválido." }
  }

  try {
    const { ...templateData } = parsedInput.data
    
    const docRef = await db.collection("document_templates").add({
      ...templateData,
      createdAt: serverTimestamp(),
    })

    return { success: true, data: { templateId: docRef.id } }
  } catch (error) {
    console.error("Erro ao criar modelo:", error)
    return { success: false, error: "Falha ao criar modelo. Tente novamente." }
  }
}
