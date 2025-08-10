'use server';

import {z} from 'zod';
import {db} from '@/lib/firebase-admin';
import {FieldValue} from 'firebase-admin/firestore';

const CreateProcessSchema = z.object({
  clientId: z.string(),
  clientName: z.string(),
  processNumber: z.string(),
  justiceType: z.enum(["civel", "criminal", "trabalhista", "federal", "outra"]),
  comarca: z.string(),
  court: z.string(),
  actionType: z.string(),
  plaintiff: z.string(),
  defendant: z.string(),
  representation: z.enum(['plaintiff', 'defendant']),
  status: z.enum(["a_distribuir", "em_andamento", "em_recurso", "execucao", "arquivado_provisorio", "arquivado_definitivo"]),
  lawyerId: z.string(),
  officeId: z.string(),
});

type Result =
  | {success: true; data: {processId: string}}
  | {success: false; error: string};

export async function createProcessAction(
  input: z.infer<typeof CreateProcessSchema>
): Promise<Result> {
  const parsedInput = CreateProcessSchema.safeParse(input);

  if (!parsedInput.success) {
    console.error("Validation Errors:", parsedInput.error.errors);
    return {success: false, error: 'Input inválido.'};
  }

  if (!db) {
    return {
      success: false,
      error: 'O serviço de banco de dados não está disponível.',
    };
  }

  try {
    const {lawyerId, ...processData} = parsedInput.data;

    const docRef = await db.collection('processes').add({
      ...processData,
      ownerId: lawyerId, // The lawyer who created it
      collaboratorIds: [lawyerId], // Start with the owner in the collaborators list
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      movements: [], // Initialize with empty movements history
    });

    return {success: true, data: {processId: docRef.id}};
  } catch (error) {
    console.error('Erro ao criar processo:', error);
    return {
      success: false,
      error: 'Falha ao criar processo. Tente novamente.',
    };
  }
}
