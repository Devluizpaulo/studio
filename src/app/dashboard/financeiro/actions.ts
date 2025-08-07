'use server';

import {z} from 'zod';
import {db} from '@/lib/firebase-admin';
import {FieldValue} from 'firebase-admin/firestore';

const createFinancialTaskSchema = z.object({
  title: z.string().min(3, 'O título é obrigatório.'),
  processId: z.string().optional(),
  processNumber: z.string().optional(),
  type: z.enum(['honorarios', 'custas', 'reembolso', 'guia', 'outro']),
  dueDate: z.date(),
  value: z.number(),
  status: z.enum(['pendente', 'pago']),
  officeId: z.string(),
  createdBy: z.string(),
});

type Result =
  | {success: true; data: {taskId: string}}
  | {success: false; error: string};

export async function createFinancialTaskAction(
  input: z.infer<typeof createFinancialTaskSchema>
): Promise<Result> {
  const parsedInput = createFinancialTaskSchema.safeParse(input);

  if (!parsedInput.success) {
    return {success: false, error: 'Input inválido.'};
  }

  if (!db) {
    return {
      success: false,
      error: 'O serviço de banco de dados não está disponível.',
    };
  }

  try {
    const {...taskData} = parsedInput.data;

    const docRef = await db.collection('financial_tasks').add({
      ...taskData,
      createdAt: FieldValue.serverTimestamp(),
    });

    return {success: true, data: {taskId: docRef.id}};
  } catch (error) {
    console.error('Erro ao criar tarefa financeira:', error);
    return {success: false, error: 'Falha ao criar tarefa. Tente novamente.'};
  }
}

// --- Update Financial Task Status ---
const updateStatusSchema = z.object({
  taskId: z.string(),
  status: z.enum(['pendente', 'pago']),
});

type UpdateResult = {success: true} | {success: false; error: string};

export async function updateFinancialTaskStatusAction(
  input: z.infer<typeof updateStatusSchema>
): Promise<UpdateResult> {
  const parsedInput = updateStatusSchema.safeParse(input);
  if (!parsedInput.success) {
    return {success: false, error: 'Input inválido.'};
  }
  if (!db) {
    return {
      success: false,
      error: 'O serviço de banco de dados não está disponível.',
    };
  }
  try {
    const {taskId, status} = parsedInput.data;
    const taskRef = db.collection('financial_tasks').doc(taskId);
    await taskRef.update({
      status: status,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return {success: true};
  } catch (error) {
    console.error('Erro ao atualizar status da tarefa:', error);
    return {success: false, error: 'Falha ao atualizar o status.'};
  }
}
