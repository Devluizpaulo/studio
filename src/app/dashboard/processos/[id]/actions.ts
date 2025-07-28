"use server"

import { z } from "zod"
import { db } from "@/lib/firebase"
import { doc, updateDoc, arrayUnion, Timestamp, collection, query, where, getDocs } from "firebase/firestore"
import { updateProcessStatus } from "@/ai/flows/update-process-status"

const updateProcessStatusSchema = z.object({
  processId: z.string(),
  processNumber: z.string(),
  court: z.string(),
  currentStatus: z.string(),
  lastUpdate: z.string(),
})

type UpdateResult =
  | { success: true; data: { movementId: string } }
  | { success: false; error: string }

export async function updateProcessStatusAction(
  input: z.infer<typeof updateProcessStatusSchema>
): Promise<UpdateResult> {
  const parsedInput = updateProcessStatusSchema.safeParse(input)

  if (!parsedInput.success) {
    return { success: false, error: "Input inválido." }
  }

  try {
    const newMovement = await updateProcessStatus(parsedInput.data);
    const processRef = doc(db, "processes", parsedInput.data.processId);

    await updateDoc(processRef, {
        movements: arrayUnion({
            ...newMovement,
            date: Timestamp.fromDate(new Date(newMovement.date)),
        })
    });

    return { success: true, data: { movementId: new Date().toISOString() } }
  } catch (error) {
    console.error("Erro ao atualizar andamento:", error)
    return { success: false, error: "Falha ao atualizar andamento. Tente novamente." }
  }
}

// --- Find user by email ---
const findUserSchema = z.string().email("E-mail inválido.");
type FindUserResult = 
    | { success: true; data: { uid: string, fullName: string, email: string } | null }
    | { success: false; error: string };

export async function findUserByEmailAction(email: string): Promise<FindUserResult> {
    const parsedEmail = findUserSchema.safeParse(email);
    if (!parsedEmail.success) {
        return { success: false, error: "Formato de e-mail inválido." };
    }

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", parsedEmail.data));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: true, data: null };
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        return { success: true, data: { uid: userData.uid, fullName: userData.fullName, email: userData.email } };

    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return { success: false, error: "Ocorreu um erro ao buscar o advogado." };
    }
}


// --- Add collaborator ---
const addCollaboratorSchema = z.object({
  processId: z.string(),
  collaboratorId: z.string(),
});

type AddCollaboratorResult = 
    | { success: true }
    | { success: false; error: string };

export async function addCollaboratorAction(
  input: z.infer<typeof addCollaboratorSchema>
): Promise<AddCollaboratorResult> {
  const parsedInput = addCollaboratorSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: "Input inválido." };
  }
  try {
    const { processId, collaboratorId } = parsedInput.data;
    const processRef = doc(db, "processes", processId);

    await updateDoc(processRef, {
        collaboratorIds: arrayUnion(collaboratorId)
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao adicionar colaborador:", error);
    return { success: false, error: "Falha ao adicionar colaborador. Tente novamente." };
  }
}

    