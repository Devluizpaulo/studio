"use server"

import { z } from "zod"
import { db } from "@/lib/firebase-admin"
import { doc, updateDoc, arrayUnion, Timestamp, collection, query, where, getDocs, getDoc, addDoc, serverTimestamp } from "firebase/firestore"
import { updateProcessStatus } from "@/ai/flows/update-process-status"
import { draftPetition, DraftPetitionInput } from "@/ai/flows/draft-petition-flow"

const updateProcessStatusSchema = z.object({
  processId: z.string(),
  processNumber: z.string(),
  court: z.string(),
  currentStatus: z.string(),
  lastUpdate: z.string(),
  userId: z.string(),
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
    | { success: true; data: { uid: string, fullName: string, email: string, role: string, photoUrl?: string } | null }
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
        
        return { success: true, data: { uid: userData.uid, fullName: userData.fullName, email: userData.email, role: userData.role, photoUrl: userData.photoUrl } };

    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return { success: false, error: "Ocorreu um erro ao buscar o advogado." };
    }
}


// --- Add collaborator ---
const addCollaboratorSchema = z.object({
  processId: z.string(),
  collaboratorId: z.string(),
  currentUserId: z.string(),
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
    const { processId, collaboratorId, currentUserId } = parsedInput.data;
    const processRef = doc(db, "processes", processId);
    const processSnap = await getDoc(processRef);

    if (!processSnap.exists()) {
        return { success: false, error: "Processo não encontrado." };
    }

    const processData = processSnap.data();
    const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
    const currentUserRole = currentUserDoc.data()?.role;


    // Security check: Only owner or master can add collaborators
    if (processData.lawyerId !== currentUserId && currentUserRole !== 'master') {
        return { success: false, error: "Apenas o dono do processo ou o administrador podem adicionar colaboradores."}
    }

    await updateDoc(processRef, {
        collaboratorIds: arrayUnion(collaboratorId)
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao adicionar colaborador:", error);
    return { success: false, error: "Falha ao adicionar colaborador. Tente novamente." };
  }
}

// --- Add Document ---
const addDocumentSchema = z.object({
  processId: z.string(),
  title: z.string().min(3, "O título é obrigatório."),
  url: z.string().url("A URL do documento é inválida."),
  fileName: z.string(),
  uploadedBy: z.string(),
});

type AddDocumentResult = 
    | { success: true; data: { documentId: string } }
    | { success: false; error: string };

export async function addDocumentAction(
  input: z.infer<typeof addDocumentSchema>
): Promise<AddDocumentResult> {
  const parsedInput = addDocumentSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: "Input inválido." };
  }
  try {
    const { processId, ...documentData } = parsedInput.data;
    const documentsCollectionRef = collection(db, "processes", processId, "documents");
    
    const docRef = await addDoc(documentsCollectionRef, {
      ...documentData,
      createdAt: serverTimestamp(),
    });

    return { success: true, data: { documentId: docRef.id } };
  } catch (error) {
    console.error("Erro ao adicionar documento:", error);
    return { success: false, error: "Falha ao adicionar documento. Tente novamente." };
  }
}

// --- Add Chat Message ---
const addChatMessageSchema = z.object({
  processId: z.string(),
  text: z.string().min(1, "A mensagem não pode estar em branco."),
  senderId: z.string(),
  senderName: z.string(),
  senderPhotoUrl: z.string().optional(),
});

type AddChatMessageResult = 
    | { success: true; data: { messageId: string } }
    | { success: false; error: string };

export async function addChatMessageAction(
  input: z.infer<typeof addChatMessageSchema>
): Promise<AddChatMessageResult> {
  const parsedInput = addChatMessageSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: "Input inválido." };
  }
  try {
    const { processId, ...messageData } = parsedInput.data;
    const chatMessagesCollectionRef = collection(db, "processes", processId, "chatMessages");
    
    const docRef = await addDoc(chatMessagesCollectionRef, {
      ...messageData,
      timestamp: serverTimestamp(),
    });

    return { success: true, data: { messageId: docRef.id } };
  } catch (error) {
    console.error("Erro ao adicionar mensagem no chat:", error);
    return { success: false, error: "Falha ao enviar mensagem. Tente novamente." };
  }
}

// --- Draft Petition Action ---
const draftPetitionSchema = z.object({
    caseFacts: z.string(),
    petitionType: z.string(),
    legalThesis: z.string(),
    toneAndStyle: z.string(),
    clientInfo: z.string(),
    opponentInfo: z.string(),
    userId: z.string(),
});

type DraftPetitionResult =
    | { success: true; data: { draftContent: string } }
    | { success: false; error: string };

export async function draftPetitionAction(
    input: z.infer<typeof draftPetitionSchema>
): Promise<DraftPetitionResult> {
    const parsedInput = draftPetitionSchema.safeParse(input);

    if (!parsedInput.success) {
        return { success: false, error: "Input inválido para a IA." };
    }

    try {
        const result = await draftPetition(parsedInput.data);
        return { success: true, data: result };
    } catch (error) {
        console.error("Erro ao gerar rascunho da petição:", error);
        return { success: false, error: "A IA não conseguiu gerar o rascunho. Tente novamente." };
    }
}
