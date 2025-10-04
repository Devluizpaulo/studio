"use server";

import { z } from "zod";
import { db } from "@/lib/firebase-admin";
import { FieldValue } from 'firebase-admin/firestore';

const contactFormSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10),
  message: z.string().min(10),
});

type Result = 
  | { success: true }
  | { success: false; error: string };

export async function createContactRequestAction(
  input: z.infer<typeof contactFormSchema>
): Promise<Result> {
  const parsedInput = contactFormSchema.safeParse(input);

  if (!parsedInput.success) {
    return { success: false, error: "Dados inválidos." };
  }
  if (!db) {
    return { success: false, error: "O serviço de banco de dados não está disponível." };
  }

  try {
    // We need to associate this contact request with an office.
    // Since this is a public form, we'll get the first (and only) office.
    const officeSnapshot = await db.collection("offices").limit(1).get();
    if (officeSnapshot.empty) {
        return { success: false, error: "Nenhum escritório configurado para receber contatos." };
    }
    const officeId = officeSnapshot.docs[0].id;
      
    await db.collection("contact_requests").add({
      ...parsedInput.data,
      officeId: officeId,
      createdAt: FieldValue.serverTimestamp(),
      status: 'new'
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar pedido de contato:", error);
    return { success: false, error: "Falha ao enviar mensagem. Tente novamente mais tarde." };
  }
}
