"use server";

import { z } from "zod";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const CreateProcessSchema = z.object({
  clientName: z.string(),
  clientDocument: z.string(),
  processNumber: z.string(),
  court: z.string(),
  actionType: z.string(),
  plaintiff: z.string(),
  defendant: z.string(),
  representation: z.enum(["plaintiff", "defendant"]),
  status: z.enum(["active", "pending", "archived"]),
  lawyerId: z.string(),
});

type Result = 
    | { success: true; data: { processId: string } }
    | { success: false; error: string };

export async function createProcessAction(
  input: z.infer<typeof CreateProcessSchema>
): Promise<Result> {
  const parsedInput = CreateProcessSchema.safeParse(input);

  if (!parsedInput.success) {
    return { success: false, error: "Input inválido." };
  }
  
  try {
    const { lawyerId, ...processData } = parsedInput.data;
    
    const docRef = await addDoc(collection(db, "processes"), {
      ...processData,
      lawyerId: lawyerId, // Owner of the process
      collaboratorIds: [lawyerId], // Start with the owner in the collaborators list
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      movements: [], // Initialize with empty movements history
    });

    return { success: true, data: { processId: docRef.id } };
  } catch (error) {
    console.error("Erro ao criar processo:", error);
    return { success: false, error: "Falha ao criar processo. Tente novamente." };
  }
}
